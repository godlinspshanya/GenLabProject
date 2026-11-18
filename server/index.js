
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import {
    randomInt,
    createHash,
    timingSafeEqual
} from "crypto";

import User from "./models/User.js";
import Task from "./models/Task.js";

dotenv.config();

const app = express();

// ---------- JWT AUTHENTICATION ----------

const createAuthToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing in server .env");
    }

    return jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// Middleware to verify logged-in users.

const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.userId;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token. Please log in again."
        });
    }
};

// ---------- GOOGLE AUTH CLIENT ----------

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "postmessage"
);

// ---------- CORS CONFIGURATION ----------

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://gen-lab-project.vercel.app"
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));

app.use(express.json());

// ---------- HEALTH CHECK ----------

app.get("/", (req, res) => {
    res.status(200).json({
        message: "PageFlows Backend is running!"
    });
});

// ---------- MONGODB CONNECTION ----------

let dbPromise;

const connectDB = async () => {

    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing");
    }

    if (mongoose.connection.readyState !== 2) {
        dbPromise = null;
    }

    if (!dbPromise) {
        dbPromise = mongoose.connect(process.env.MONGO_URI)
            .then(() => {
                console.log("MongoDB Atlas Connected Successfully!");
            })
            .catch((error) => {
                dbPromise = null;

                console.error(
                    "MongoDB Connection Failed:",
                    error.message
                );

                throw error;
            });
    }

    return dbPromise;
};

// Connect to MongoDB before API requests.

app.use("/api", async (req, res, next) => {
    try {
        await connectDB();
        next();

    } catch (error) {
        console.error("Database Error:", error.message);

        res.status(503).json({
            message: "Database connection failed"
        });
    }
});

// ---------- NODEMAILER CONFIGURATION ----------

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// ---------- OTP STORAGE ----------

// Temporary in-memory storage.
// This must be moved to persistent storage
// before relying on serverless deployment.

const otpStore = new Map();

const hashOTP = (otp) =>
    createHash("sha256")
        .update(String(otp))
        .digest("hex");

// ---------- GOOGLE SHEETS INTEGRATION ----------

const addUserToGoogleSheet = async (user) => {
    const sheetUrl = process.env.GOOGLE_SHEET_WEB_APP_URL;
    const secret = process.env.GOOGLE_SHEET_SECRET;

    if (!sheetUrl || !secret) {
        throw new Error("Google Sheets environment variables are missing");
    }

    const response = await fetch(sheetUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            secret,
            name: user.name,
            email: user.email,
            phone: user.phone,
            gender: user.gender
        })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message || "Failed to add user to Google Sheets"
        );
    }

    console.log(
        "User successfully added to Google Sheets:",
        user.email
    );
};

// ---------- SEND OTP ----------

app.post("/api/auth/send-otp", async (req, res) => {

    try {
        const email = String(req.body?.email || "")
            .trim()
            .toLowerCase();

        const name = String(req.body?.name || "").trim();

        const phone = String(req.body?.phone || "").trim();

        const gender = String(req.body?.gender || "").trim();

        const purpose = req.body?.purpose;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        if (!["signup", "login"].includes(purpose)) {
            return res.status(400).json({
                message: "Invalid OTP purpose"
            });
        }

        // Find user in MongoDB.

        const existingUser = await User.findOne({ email });

        // ---------- SIGNUP VALIDATION ----------

        if (purpose === "signup") {

            if (!name) {
                return res.status(400).json({
                    message: "Name is required"
                });
            }

            if (!/^\d{10}$/.test(phone)) {
                return res.status(400).json({
                    message: "Enter a valid 10-digit phone number"
                });
            }

            if (![
                "Female",
                "Male",
                "Other",
                "Prefer not to say"
            ].includes(gender)) {
                return res.status(400).json({
                    message: "Please select a valid gender"
                });
            }

            if (existingUser) {
                return res.status(409).json({
                    message: "Account already exists. Please log in."
                });
            }
        }

        // ---------- LOGIN VALIDATION ----------

        if (purpose === "login") {

            if (!existingUser) {
                return res.status(404).json({
                    message: "Account not found. Please sign up first."
                });
            }
        }

        // Generate six-digit OTP.

        const otp = randomInt(100000, 1000000);

        // Send OTP through Gmail.

        await transporter.sendMail({
            from: `"Task Manager System" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Your Task Manager OTP",

            text: `Your verification code is ${otp}. It expires in 5 minutes.`,

            html: `
                <div style="font-family: Arial; padding: 20px;">
                    <h2>Task Manager Verification</h2>

                    <p>Your verification code is:</p>

                    <h1 style="color: #3B71C1; letter-spacing: 5px;">
                        ${otp}
                    </h1>

                    <p>This OTP expires in 5 minutes.</p>

                    <p>Please don't share this code with anyone.</p>
                </div>
            `
        });

        // Store hashed OTP and signup details.

        otpStore.set(email, {
            otpHash: hashOTP(otp),
            expiresAt: Date.now() + 5 * 60 * 1000,
            purpose,
            name,
            phone,
            gender,
            attempts: 0
        });

        return res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error("Email Sending Error:", error);

        return res.status(500).json({
            message: "Unable to send OTP. Please try again."
        });
    }
});

// ---------- VERIFY OTP ----------

app.post("/api/auth/verify-otp", async (req, res) => {

    try {
        const email = String(req.body?.email || "")
            .trim()
            .toLowerCase();

        const otp = String(req.body?.otp || "").trim();

        if (!email || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                message: "Enter a valid 6-digit OTP"
            });
        }

        // Get OTP record.

        const record = otpStore.get(email);

        if (!record) {
            return res.status(400).json({
                message: "OTP not found. Please request a new OTP."
            });
        }

        // Check expiry.

        if (Date.now() > record.expiresAt) {
            otpStore.delete(email);

            return res.status(400).json({
                message: "OTP expired. Please request a new one."
            });
        }

        // Limit incorrect attempts.

        if (record.attempts >= 5) {
            otpStore.delete(email);

            return res.status(429).json({
                message: "Too many attempts. Request a new OTP."
            });
        }

        // Compare OTP hashes.

        const enteredHash = Buffer.from(hashOTP(otp), "hex");

        const storedHash = Buffer.from(record.otpHash, "hex");

        if (!timingSafeEqual(enteredHash, storedHash)) {

            record.attempts++;

            if (record.attempts >= 5) {
                otpStore.delete(email);
            }

            return res.status(400).json({
                message: "Incorrect OTP. Please try again."
            });
        }

        // ---------- SIGNUP VERIFICATION ----------

        if (record.purpose === "signup") {

            const existingUser = await User.findOne({ email });

            if (existingUser) {
                otpStore.delete(email);

                return res.status(409).json({
                    message: "Account already exists. Please log in."
                });
            }

            // Create user only after OTP verification.

            const user = await User.create({
                name: record.name,
                email,
                phone: record.phone,
                gender: record.gender
            });

            // Sync successfully registered user to Google Sheets.
            // MongoDB registration will remain successful
            // even if Google Sheets is temporarily unavailable.

            try {
                await addUserToGoogleSheet(user);

            } catch (sheetError) {
                console.error(
                    "Google Sheets Sync Error:",
                    sheetError.message
                );
            }

            // OTP can only be used once.

            otpStore.delete(email);

            return res.status(200).json({
                message: "Account created successfully",

                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    gender: user.gender
                }
            });
        }

        // ---------- LOGIN VERIFICATION ----------

        if (record.purpose === "login") {

            const user = await User.findOne({ email });

            if (!user) {
                otpStore.delete(email);

                return res.status(404).json({
                    message: "Account not found. Please sign up first."
                });
            }

            // OTP can only be used once.

            otpStore.delete(email);

            // Generate JWT token.

            const token = createAuthToken(user);

            return res.status(200).json({
                message: "Login successful",
                token,

                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    gender: user.gender
                }
            });
        }

        otpStore.delete(email);

        return res.status(400).json({
            message: "Invalid OTP purpose"
        });

    } catch (error) {
        console.error("OTP Verification Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Account already exists. Please log in."
            });
        }

        return res.status(500).json({
            message: "Server error"
        });
    }
});

// ---------- GOOGLE LOGIN / SIGNUP ----------

app.post("/api/auth/google", async (req, res) => {

    try {
        const code = req.body?.code;

        if (!code) {
            return res.status(400).json({
                message: "Google code is required"
            });
        }

        // Exchange authorization code for tokens.

        const { tokens } = await googleClient.getToken(code);

        if (!tokens.id_token) {
            return res.status(401).json({
                message: "Google ID token is missing"
            });
        }

        // Verify Google ID token.

        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if (!payload?.email || !payload.email_verified) {
            return res.status(401).json({
                message: "Google account email is not verified"
            });
        }

        const email = payload.email.toLowerCase();

        // Find existing user or create new user.

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name: payload.name,
                email
            });
        }

        // Generate JWT token.

        const token = createAuthToken(user);

        return res.status(200).json({
            message: "Google login successful",
            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                gender: user.gender
            }
        });

    } catch (error) {
        console.error("Google Auth Error:", error);

        return res.status(401).json({
            message: "Google sign-in failed. Please try again."
        });
    }
});

// ---------- GET ALL REGISTERED USERS ----------

app.get("/api/users", requireAuth, async (req, res) => {
    try {
        const users = await User.find()
            .select("name email phone gender createdAt")
            .sort({ createdAt: -1 })
            .lean();

        res.json(users);

    } catch (error) {
        console.error("Fetch users error:", error);

        res.status(500).json({
            message: "Unable to fetch registered users"
        });
    }
});

// ---------- SERVER START ----------

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== "1") {

    connectDB()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch((error) => {
            console.error("Server startup failed:", error);
        });
}

// ---------- TASK MANAGEMENT ROUTES ----------

// GET: Fetch tasks belonging to the logged-in user

app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.userId
        }).sort({ createdAt: -1 });

        return res.status(200).json(tasks);

    } catch (error) {
        console.error("Fetch Tasks Error:", error);

        return res.status(500).json({
            message: "Unable to fetch tasks"
        });
    }
});

// POST: Create a new task

app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
        const { title, dueDate, priority } = req.body;

        if (!title || !String(title).trim() || !dueDate) {
            return res.status(400).json({
                message: "Task title and due date are required"
            });
        }

        const validPriorities = ["High", "Medium", "Low"];

        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({
                message: "Invalid task priority"
            });
        }

        const parsedDate = new Date(dueDate);

        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                message: "Invalid due date"
            });
        }

        const task = await Task.create({
            title: String(title).trim(),
            dueDate: parsedDate,
            priority: priority || "Medium",
            user: req.userId
        });

        return res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        console.error("Create Task Error:", error);

        return res.status(500).json({
            message: "Unable to create task"
        });
    }
});

// PUT: Update a task

app.put("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
        const { title, dueDate, priority, completed } = req.body;

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const updates = {};

        if (title !== undefined) {
            if (!String(title).trim()) {
                return res.status(400).json({
                    message: "Task title cannot be empty"
                });
            }

            updates.title = String(title).trim();
        }

        if (dueDate !== undefined) {
            const parsedDate = new Date(dueDate);

            if (Number.isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid due date"
                });
            }

            updates.dueDate = parsedDate;
        }

        if (priority !== undefined) {
            if (!["High", "Medium", "Low"].includes(priority)) {
                return res.status(400).json({
                    message: "Invalid task priority"
                });
            }

            updates.priority = priority;
        }

        if (completed !== undefined) {
            if (typeof completed !== "boolean") {
                return res.status(400).json({
                    message: "Invalid completion status"
                });
            }

            updates.completed = completed;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid updates provided"
            });
        }

        const task = await Task.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.userId
            },
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json({
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        console.error("Update Task Error:", error);

        return res.status(500).json({
            message: "Unable to update task"
        });
    }
});

// DELETE: Delete a task

app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID"
            });
        }

        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        return res.status(200).json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error("Delete Task Error:", error);

        return res.status(500).json({
            message: "Unable to delete task"
        });
    }
});

export default app;
