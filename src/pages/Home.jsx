
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
    ClipboardList,
    Clock,
    TriangleAlert,
    CircleCheck,
    CalendarDays,
    ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import "./Home.css";

function getSavedUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
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

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatUpcomingDate(dateKey) {
    return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
    });
}

function Home({ theme, onThemeChange }) {
    const navigate = useNavigate();
    const user = getSavedUser();
    const token = localStorage.getItem("token");

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    const today = new Date().toLocaleDateString("en-CA");

    const total = tasks.length;
    const completed = tasks.filter(task => task.done).length;
    const pending = total - completed;
    const completionPercentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    const overdue = tasks.filter(
        task => !task.done && task.dueDate < today
    ).length;

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const deadlineEndDate = new Date(todayDate);
    deadlineEndDate.setDate(deadlineEndDate.getDate() + 7);
    const todayKey = formatDateKey(todayDate);
    const deadlineEndKey = formatDateKey(deadlineEndDate);

    const upcomingDeadlines = tasks
        .filter(task =>
            !task.done &&
            task.dueDate >= todayKey &&
            task.dueDate <= deadlineEndKey
        )
        .sort((a, b) =>
            a.dueDate.localeCompare(b.dueDate) ||
            a.title.localeCompare(b.title)
        );

    const firstName = (user.name || user.email).split(" ")[0];

    const recentTasks = [...tasks]
        .sort((a, b) => b.id.localeCompare(a.id))
        .slice(0, 5);

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
                            <h1>Welcome back, {firstName}!</h1>
                            <p>
                                Stay organized, complete your tasks,
                                and achieve your goals!
                            </p>
                        </div>

                        <p className="motto">You've got this!</p>
                    </section>

                    <section className="stats">
                        <StatCard
                            icon={ClipboardList}
                            value={total}
                            label="Total Tasks"
                            color="blue"
                        />

                        <StatCard
                            icon={Clock}
                            value={pending}
                            label="Pending"
                            color="orange"
                        />

                        <StatCard
                            icon={TriangleAlert}
                            value={overdue}
                            label="Overdue"
                            color="red"
                        />

                        <StatCard
                            icon={CircleCheck}
                            value={completed}
                            label="Completed"
                            color="green"
                        />
                    </section>

                    {error && (
                        <p style={{ color: "#ff6b6b", margin: "12px 0" }}>
                            {error}
                        </p>
                    )}

                    <section className="dashboard-highlights">
                        <article className="dashboard-summary-card">
                            <div className="dashboard-card-heading">
                                <span className="dashboard-card-icon progress-icon">
                                    <CircleCheck size={20} />
                                </span>
                                <div>
                                    <h2>Overall completion</h2>
                                    <p>Your progress across all tasks</p>
                                </div>
                            </div>

                            <div className="completion-summary">
                                <strong>
                                    {loading || error
                                        ? "—"
                                        : `${completionPercentage}%`}
                                </strong>
                                <span>
                                    {loading
                                        ? "Loading your tasks..."
                                        : error
                                            ? "Task progress is unavailable."
                                            : `${completed} of ${total} tasks completed`}
                                </span>
                            </div>

                            <div
                                className="completion-track"
                                role="progressbar"
                                aria-label="Overall task completion"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={loading || error ? 0 : completionPercentage}
                            >
                                <div
                                    className="completion-fill"
                                    style={{
                                        width: `${loading || error ? 0 : completionPercentage}%`
                                    }}
                                />
                            </div>
                        </article>

                        <article className="dashboard-summary-card deadlines-card">
                            <div className="dashboard-card-heading">
                                <span className="dashboard-card-icon deadline-icon">
                                    <CalendarDays size={20} />
                                </span>
                                <div>
                                    <h2>Upcoming deadlines</h2>
                                    <p>Incomplete tasks due today or in the next 7 days</p>
                                </div>
                            </div>

                            {loading ? (
                                <p className="deadlines-message">Loading upcoming deadlines...</p>
                            ) : error ? (
                                <p className="deadlines-message">
                                    Upcoming deadlines are unavailable.
                                </p>
                            ) : upcomingDeadlines.length === 0 ? (
                                <p className="deadlines-message">
                                    No upcoming deadlines. Tasks due within the next 7 days will appear here.
                                </p>
                            ) : (
                                <div className="deadline-list">
                                    {upcomingDeadlines.map(task => (
                                        <Link
                                            className="deadline-item"
                                            key={task.id}
                                            to="/my-tasks"
                                            aria-label={`Open ${task.title} in My Tasks`}
                                        >
                                            <span className="deadline-copy">
                                                <strong>{task.title}</strong>
                                                <span>Due {formatUpcomingDate(task.dueDate)}</span>
                                            </span>
                                            <span className="deadline-item-meta">
                                                <span className={`badge priority-${task.priority.toLowerCase()}`}>
                                                    {task.priority}
                                                </span>
                                                <ArrowRight size={17} aria-hidden="true" />
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </article>
                    </section>

                    <section className="recent-tasks-section">
                        <h2>Recent Tasks</h2>
                        <p className="recent-tasks-subtitle">
                            Here's a quick look at your latest tasks.
                        </p>

                        {loading ? (
                            <p>Loading your tasks...</p>
                        ) : recentTasks.length === 0 ? (
                            <p>You haven't added any tasks yet.</p>
                        ) : (
                            <div className="recent-task-list">
                                {recentTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="recent-task-item"
                                    >
                                        <div>
                                            <strong className="recent-task-title">{task.title}</strong>
                                            <p className="recent-task-due">
                                                Due: {task.dueDate}
                                            </p>
                                        </div>

                                        <span className={`recent-task-status ${
                                            task.done
                                                ? "is-completed"
                                                : task.dueDate < today
                                                    ? "is-overdue"
                                                    : "is-pending"
                                        }`}>
                                            {task.done
                                                ? "Completed"
                                                : task.dueDate < today
                                                    ? "Overdue"
                                                    : "Pending"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                </div>
            </div>
        </div>
    );
}

export default Home;
