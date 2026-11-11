
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";
import { randomInt, createHash } from "crypto";

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

// Temporary OTP storage (for development)
const otpStore = new Map();

// Generate and send OTP
app.post("/api/auth/send-otp", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        // Generate a random 6-digit OTP
        const otp = randomInt(100000, 1000000);

        // Store a hash instead of the plain OTP
        const otpHash = createHash("sha256")
            .update(String(otp))
            .digest("hex");

        otpStore.set(email, {
            otpHash,
            expiresAt: Date.now() + 5 * 60 * 1000
        });

        // Send OTP through Resend
        const { data, error } = await resend.emails.send({
            from: "Page Flows <onboarding@resend.dev>",
            to: [email],
            subject: "Your Page Flows verification code",
            html: `
                <h2>Email Verification</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>This code expires in 5 minutes.</p>
            `
        });

        if (error) {
            otpStore.delete(email);
            console.error(error);
            return res.status(500).json({
                message: "Unable to send OTP"
            });
        }

        return res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
