import { useState } from "react";
import {
    List,
    ArrowUp,
    ArrowRight,
    ArrowDown,
    CircleCheck,
    Pencil,
    Trash2,
    TriangleAlert
} from "lucide-react";

const priorityIcons = {
    High: ArrowUp,
    Medium: ArrowRight,
    Low: ArrowDown
};

const priorityRank = { High: 0, Medium: 1, Low: 2 };

// "2026-11-13"  ->  "Nov 13, 2026"
function formatDate(dateText) {
    return new Date(dateText + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function TaskTable({ tasks, onToggle, onDelete }) {
    const [filter, setFilter] = useState("all");   // all | pending | completed
    const [sortBy, setSortBy] = useState("date");  // date | priority

    const today = new Date().toLocaleDateString("en-CA");

    // 1. keep only the tasks that match the selected tab
    const filtered = tasks.filter((task) => {
        if (filter === "pending") return !task.done;
        if (filter === "completed") return task.done;
        return true;
    });

    // 2. sort them (we copy the list first so the original is not changed)
    const visible = [...filtered].sort((a, b) => {
        if (sortBy === "priority") {
            return priorityRank[a.priority] - priorityRank[b.priority];
        }
        return a.dueDate.localeCompare(b.dueDate);
    });

    return (
        <div className="task-card">
            <div className="task-card-top">
                <h3>
                    <List size={22} /> My Tasks
                </h3>

                <div className="task-controls">
                    <div className="tabs">
                        {["all", "pending", "completed"].map((name) => (
                            <button
                                key={name}
                                className={filter === name ? "tab active" : "tab"}
                                onClick={() => setFilter(name)}
                            >
                                {name}
                            </button>
                        ))}
                    </div>

                    <select
                        className="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="date">Sort by: Due Date</option>
                        <option value="priority">Sort by: Priority</option>
                    </select>
                </div>
            </div>

            <div className="table-scroll">
                <table className="task-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Task</th>
                            <th>Due Date</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {visible.length === 0 && (
                            <tr>
                                <td colSpan="6" className="no-tasks">
                                    No tasks to show.
                                </td>
                            </tr>
                        )}

                        {visible.map((task) => {
                            const PriorityIcon = priorityIcons[task.priority];
                            const isOverdue = !task.done && task.dueDate < today;

                            return (
                                <tr key={task.id} className={task.done ? "row-done" : ""}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={task.done}
                                            onChange={() => onToggle(task.id)}
                                        />
                                    </td>

                                    <td className="task-title">{task.title}</td>

                                    <td className={isOverdue ? "due overdue" : "due"}>
                                        {isOverdue && <TriangleAlert size={16} />}
                                        {formatDate(task.dueDate)}
                                    </td>

                                    <td>
                                        <span className={`badge priority-${task.priority.toLowerCase()}`}>
                                            <PriorityIcon size={14} /> {task.priority}
                                        </span>
                                    </td>

                                    <td>
                                        {task.done ? (
                                            <span className="badge status-completed">
                                                <CircleCheck size={14} /> Completed
                                            </span>
                                        ) : (
                                            <span className="badge status-pending">
                                                <span className="dot"></span> Pending
                                            </span>
                                        )}
                                    </td>

                                    <td className="actions">
                                        <button className="icon-btn edit" title="Edit">
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            className="icon-btn delete"
                                            title="Delete"
                                            onClick={() => onDelete(task.id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <p className="showing">
                Showing {visible.length} of {tasks.length} tasks
            </p>
        </div>
    );
}

export default TaskTable;