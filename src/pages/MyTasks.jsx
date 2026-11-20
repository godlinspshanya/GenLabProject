
import { useState, useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AddTaskForm from "../components/AddTaskForm";
import TaskTable from "../components/TaskTable";

import "./Home.css";

function getSavedUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
}

function autoPriority(dueDate) {
    const today = new Date(new Date().toLocaleDateString("en-CA"));
    const due = new Date(dueDate);

    const daysLeft = Math.round(
        (due - today) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft <= 2) return "High";
    if (daysLeft <= 7) return "Medium";
    return "Low";
}

function formatTask(task) {
    return {
        id: task._id,
        title: task.title,
        dueDate: new Date(task.dueDate).toISOString().slice(0, 10),
        priority: task.priority,
        done: task.completed
    };
}

function announceTaskChange() {
    window.dispatchEvent(new Event("tasks:changed"));
}

function MyTasks({ theme, onThemeChange }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const highlightedTaskId = searchParams.get("task");

    const user = getSavedUser();
    const token = localStorage.getItem("token");

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingTask, setEditingTask] = useState(null);

    // Fetch tasks
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/tasks",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        navigate("/login", { replace: true });
                        return;
                    }

                    throw new Error(data.message || "Unable to fetch tasks");
                }

                setTasks(data.map(formatTask));

            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchTasks();
        }
    }, [token, navigate]);

    useEffect(() => {
        if (loading || !highlightedTaskId) return;

        const row = document.getElementById(`task-row-${highlightedTaskId}`);
        row?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    }, [highlightedTaskId, loading, tasks]);

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    // Logout
    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Add task
    const addTask = async ({ title, dueDate, priority }) => {
        try {
            setError("");

            const finalPriority =
                priority === "Auto"
                    ? autoPriority(dueDate)
                    : priority;

            const response = await fetch(
                "http://localhost:5000/api/tasks",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title,
                        dueDate,
                        priority: finalPriority
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to add task");
            }

            setTasks(previousTasks => [
                formatTask(data.task),
                ...previousTasks
            ]);
            announceTaskChange();

        } catch (err) {
            setError(err.message || "Something went wrong");
        }
    };

    // Select task for editing
    const editTask = (task) => {
        setEditingTask(task);
    };

    // Update task
    const updateTask = async (id, { title, dueDate, priority }) => {
        try {
            setError("");

            const finalPriority =
                priority === "Auto"
                    ? autoPriority(dueDate)
                    : priority;

            const response = await fetch(
                `http://localhost:5000/api/tasks/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title,
                        dueDate,
                        priority: finalPriority
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to update task");
            }

            setTasks(previousTasks =>
                previousTasks.map(task =>
                    task.id === id ? formatTask(data.task) : task
                )
            );
            announceTaskChange();

            setEditingTask(null);

        } catch (err) {
            setError(err.message || "Something went wrong");
        }
    };

    // Complete / undo task
    const toggleTask = async (id) => {
        const selectedTask = tasks.find(task => task.id === id);

        if (!selectedTask) return;

        try {
            setError("");

            const response = await fetch(
                `http://localhost:5000/api/tasks/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        completed: !selectedTask.done
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to update task");
            }

            setTasks(previousTasks =>
                previousTasks.map(task =>
                    task.id === id ? formatTask(data.task) : task
                )
            );
            announceTaskChange();

        } catch (err) {
            setError(err.message || "Something went wrong");
        }
    };

    // Delete task
    const deleteTask = async (id) => {
        try {
            setError("");

            const response = await fetch(
                `http://localhost:5000/api/tasks/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to delete task");
            }

            setTasks(previousTasks =>
                previousTasks.filter(task => task.id !== id)
            );
            announceTaskChange();

            if (editingTask?.id === id) {
                setEditingTask(null);
            }

        } catch (err) {
            setError(err.message || "Something went wrong");
        }
    };

    return (
        <div className="home-layout">

            <Sidebar onLogout={logout} />

            <div className="home-main">

                <Topbar
                    user={user}
                    theme={theme}
                    onThemeChange={onThemeChange}
                    onLogout={logout}
                />

                <div className="home-body">

                    <section className="welcome">
                        <div>
                            <h1>My Tasks</h1>
                            <p>
                                Organize your work, track your progress,
                                and stay productive.
                            </p>
                        </div>
                    </section>

                    {error && (
                        <p style={{ color: "#ff6b6b", margin: "12px 0" }}>
                            {error}
                        </p>
                    )}

                    {loading ? (
                        <p>Loading your tasks...</p>
                    ) : (
                        <section className="content-row">

                            <TaskTable
                                tasks={tasks}
                                highlightedTaskId={highlightedTaskId}
                                onToggle={toggleTask}
                                onDelete={deleteTask}
                                onEdit={editTask}
                            />

                            <AddTaskForm
                                onAdd={addTask}
                                editingTask={editingTask}
                                onUpdate={updateTask}
                                onCancel={() => setEditingTask(null)}
                            />

                        </section>
                    )}

                </div>
            </div>
        </div>
    );
}

export default MyTasks;
