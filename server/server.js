
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import { OAuth2Client } from "google-auth-library";
import {
    randomInt,
    createHash,
    timingSafeEqual
} from "crypto";

import User from "./models/User.js";

dotenv.config();
// ---------- GOOGLE AUTH CLIENT ----------
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "postmessage" // special value used for the popup (auth-code) flow
);

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"]
}));

app.use(express.json());

// ---------- MONGODB CONNECTION ----------
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Atlas Connected Successfully!");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

// ---------- NODEMAILER CONFIGURATION ----------
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// ---------- OTP STORAGE ----------
const otpStore = new Map();

const hashOTP = (otp) =>
    createHash("sha256")
        .update(String(otp))
        .digest("hex");


// ---------- SEND OTP ----------
app.post("/api/auth/send-otp", async (req, res) => {
    try {
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        const name = String(req.body.name || "").trim();
        const purpose = req.body.purpose;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        if (purpose !== "signup") {
            return res.status(400).json({
                message: "OTP verification is only available for signup"
            });
        }

        if (!name) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        // Check user in MongoDB
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Account already exists. Please log in."
            });
        }

        // Generate 6-digit OTP
        const otp = randomInt(100000, 1000000);

        // Send OTP using Gmail
        await transporter.sendMail({
            from: `"Page Flows" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Your Page Flows OTP",
            text: `Your verification code is ${otp}. It expires in 5 minutes.`,
            html: `
                <div style="font-family: Arial; padding: 20px;">
                    <h2>Page Flows Verification</h2>
                    <p>Your verification code is:</p>
                    <h1 style="color: #3B71C1; letter-spacing: 5px;">
                        ${otp}
                    </h1>
                    <p>This OTP expires in 5 minutes.</p>
                    <p>Please don't share this code with anyone.</p>
                </div>
            `
        });

        // Store OTP only after email sending succeeds
        otpStore.set(email, {
            otpHash: hashOTP(otp),
            expiresAt: Date.now() + 5 * 60 * 1000,
            purpose,
            name,
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


// ---------- EMAIL-ONLY LOGIN ----------
app.post("/api/auth/login", async (req, res) => {
    try {
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
    return res.status(404).json({
        message: "Account not found. Please sign up first."
    });
}

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            message: "Unable to log in. Please try again."
        });
    }
});


// ---------- VERIFY OTP ----------
app.post("/api/auth/verify-otp", async (req, res) => {
    try {
        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        const otp = String(req.body.otp || "").trim();

        if (!email || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                message: "Enter a valid 6-digit OTP"
            });
        }

        const record = otpStore.get(email);

        if (!record) {
            return res.status(400).json({
                message: "OTP not found. Please request a new OTP."
            });
        }

        if (record.purpose !== "signup") {
            otpStore.delete(email);

            return res.status(400).json({
                message: "OTP verification is only available for signup"
            });
        }

        // Check expiration
        if (Date.now() > record.expiresAt) {
            otpStore.delete(email);

            return res.status(400).json({
                message: "OTP expired. Please request a new one."
            });
        }

        // Limit incorrect attempts
        if (record.attempts >= 5) {
            otpStore.delete(email);

            return res.status(429).json({
                message: "Too many attempts. Request a new OTP."
            });
        }

        // Compare OTP hashes
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

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            otpStore.delete(email);

            return res.status(409).json({
                message: "Account already exists. Please log in."
            });
        }

        // Create account only after successful signup verification.
        const user = await User.create({
            name: record.name,
            email
        });

        // OTP can be used only once
        otpStore.delete(email);

        return res.status(200).json({
            message: "OTP verified successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
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
        const code = req.body.code;

        if (!code) {
            return res.status(400).json({
                message: "Google code is required"
            });
        }

        // 1. Exchange the code for tokens (this uses the client secret)
        const { tokens } = await googleClient.getToken(code);

        // 2. Verify the ID token really came from Google for OUR app
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

        // 3. Find the user, or create one if this is their first time
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name: payload.name,
                email
            });
        }

        return res.status(200).json({
            message: "Google login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Google Auth Error:", error.message);

        return res.status(401).json({
            message: "Google sign-in failed. Please try again."
        });
    }
});


// ---------- START SERVER ----------
const PORT = 5000;

const startServer = async () => {
    await connectDB();

    try {
        await transporter.verify();
        console.log("Gmail SMTP Connected Successfully!");
    } catch (error) {
        console.error("Gmail SMTP Connection Failed:", error.message);
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
