import { useState } from "react";
import { Plus, CircleAlert } from "lucide-react";

function AddTaskForm({ onAdd }) {
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("Auto");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim() || !dueDate) {
            setError("Please enter a task title and a due date.");
            return;
        }

        // Send the data UP to Home.jsx
        onAdd({ title: title.trim(), dueDate, priority });

        // Clear the form
        setTitle("");
        setDueDate("");
        setPriority("Auto");
        setError("");
    };

    return (
        <form className="add-task" onSubmit={handleSubmit}>
            <div className="add-task-header">
                <span className="add-task-icon">
                    <Plus size={18} />
                </span>
                <h3>Add New Task</h3>
            </div>

            <label>
                Task Title <span className="required">*</span>
                <input
                    type="text"
                    placeholder="Enter task name..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </label>

            <label>
                Due Date <span className="required">*</span>
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
            </label>

            <label>
                Priority Level
                <div className="select-wrap">
                    <CircleAlert size={18} className="select-icon" />
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="Auto">Auto (Based on Due Date)</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            </label>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="add-task-button">
                Add Task <Plus size={18} />
            </button>
        </form>
    );
}

export default AddTaskForm;