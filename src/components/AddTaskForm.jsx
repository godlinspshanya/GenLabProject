
import { useState, useEffect } from "react";
import { Plus, CircleAlert, Save, X } from "lucide-react";

function AddTaskForm({ onAdd, editingTask, onUpdate, onCancel }) {
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("Auto");
    const [error, setError] = useState("");

    // Load selected task details into the form
    useEffect(() => {
        if (editingTask) {
            setTitle(editingTask.title);
            setDueDate(editingTask.dueDate);
            setPriority(editingTask.priority);
        } else {
            setTitle("");
            setDueDate("");
            setPriority("Auto");
        }

        setError("");
    }, [editingTask]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim() || !dueDate) {
            setError("Please enter a task title and a due date.");
            return;
        }

        const taskData = {
            title: title.trim(),
            dueDate,
            priority
        };

        if (editingTask) {
            onUpdate(editingTask.id, taskData);
        } else {
            onAdd(taskData);

            setTitle("");
            setDueDate("");
            setPriority("Auto");
        }

        setError("");
    };

    const handleCancel = () => {
        onCancel();
        setError("");
    };

    return (
        <form className="add-task" onSubmit={handleSubmit}>

            <div className="add-task-header">
                <span className="add-task-icon">
                    {editingTask ? <Save size={18} /> : <Plus size={18} />}
                </span>

                <h3>
                    {editingTask ? "Edit Task" : "Add New Task"}
                </h3>
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
                        <option value="Auto">
                            Auto (Based on Due Date)
                        </option>

                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            </label>

            {error && (
                <p className="form-error">{error}</p>
            )}

            <button type="submit" className="add-task-button">
                {editingTask ? "Save Changes" : "Add Task"}

                {editingTask ? <Save size={18} /> : <Plus size={18} />}
            </button>

            {editingTask && (
                <button
                    type="button"
                    className="add-task-button"
                    onClick={handleCancel}
                >
                    Cancel <X size={18} />
                </button>
            )}

        </form>
    );
}

export default AddTaskForm;
