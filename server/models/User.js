
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            trim: true,
            match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"]
        },

        gender: {
            type: String,
            enum: ["Female", "Male", "Other", "Prefer not to say"]
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

export default User;
