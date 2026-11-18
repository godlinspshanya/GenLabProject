
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
    ClipboardList,
    Clock,
    TriangleAlert,
    CircleCheck
} from "lucide-react";

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

function Home() {
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

    const overdue = tasks.filter(
        task => !task.done && task.dueDate < today
    ).length;

    const firstName = (user.name || user.email).split(" ")[0];

    const recentTasks = [...tasks]
        .sort((a, b) => b.id.localeCompare(a.id))
        .slice(0, 5);

    return (
        <div className="home-layout">
            <Sidebar onLogout={logout} />

            <div className="home-main">
                <Topbar user={user} />

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

                    <section style={{ marginTop: "30px" }}>
                        <h2>Recent Tasks</h2>
                        <p style={{ color: "#888", marginBottom: "18px" }}>
                            Here's a quick look at your latest tasks.
                        </p>

                        {loading ? (
                            <p>Loading your tasks...</p>
                        ) : recentTasks.length === 0 ? (
                            <p>You haven't added any tasks yet.</p>
                        ) : (
                            <div>
                                {recentTasks.map(task => (
                                    <div
                                        key={task.id}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "16px",
                                            marginBottom: "10px",
                                            background: "#fff",
                                            borderRadius: "10px",
                                            border: "1px solid #eee",
                                            gap: "12px"
                                        }}
                                    >
                                        <div>
                                            <strong>{task.title}</strong>
                                            <p style={{
                                                color: "#888",
                                                fontSize: "13px",
                                                marginTop: "5px"
                                            }}>
                                                Due: {task.dueDate}
                                            </p>
                                        </div>

                                        <span style={{
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: task.done
                                                ? "#16a34a"
                                                : task.dueDate < today
                                                    ? "#dc2626"
                                                    : "#d97706"
                                        }}>
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
