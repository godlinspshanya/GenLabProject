
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        dueDate: {
            type: Date,
            required: true
        },
        priority: {
            type: String,
            enum: ["High", "Medium", "Low"],
            default: "Medium"
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: {
            type: Date,
            default: null
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
