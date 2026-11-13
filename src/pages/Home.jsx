import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ClipboardList, Clock, TriangleAlert, CircleCheck } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import AddTaskForm from "../components/AddTaskForm";
import TaskTable from "../components/TaskTable";
import "./Home.css";

// Sample tasks so the page is not empty at the start.
// To start with an empty list, change this to:  const sampleTasks = [];
const sampleTasks = [
    { id: 1, title: "Complete Web Development Project", dueDate: "2026-11-12", priority: "High", done: false },
    { id: 2, title: "Prepare DSA Notes", dueDate: "2026-11-15", priority: "Medium", done: false },
    { id: 3, title: "Read The Silent Patient", dueDate: "2026-11-16", priority: "Low", done: false },
    { id: 4, title: "Finish English Grammar Practice", dueDate: "2026-11-18", priority: "Medium", done: false },
    { id: 5, title: "Submit Environment Assignment", dueDate: "2026-11-20", priority: "High", done: false },
    { id: 6, title: "Learn Java Collections", dueDate: "2026-11-10", priority: "Medium", done: true }
];

// Read the logged-in user that Login.jsx saved
function getSavedUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
}

// Decide priority from how soon the task is due
function autoPriority(dueDate) {
    const today = new Date(new Date().toLocaleDateString("en-CA"));
    const due = new Date(dueDate);

    const daysLeft = Math.round((due - today) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 2) return "High";    // due within 2 days, or overdue
    if (daysLeft <= 7) return "Medium";  // due within a week
    return "Low";
}

function Home() {
    const navigate = useNavigate();
    const user = getSavedUser();

    const [tasks, setTasks] = useState(sampleTasks);

    // If nobody is logged in, send them to the login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // ---------- ACTIONS ----------
    const logout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    const addTask = ({ title, dueDate, priority }) => {
        const newTask = {
            id: Date.now(),
            title: title,
            dueDate: dueDate,
            priority: priority === "Auto" ? autoPriority(dueDate) : priority,
            done: false
        };

        setTasks([newTask, ...tasks]); // new task goes first
    };

    const toggleTask = (id) => {
        setTasks(
            tasks.map((task) =>
                task.id === id ? { ...task, done: !task.done } : task
            )
        );
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter((task) => task.id !== id));
    };

    // ---------- NUMBERS FOR THE STAT CARDS ----------
    const today = new Date().toLocaleDateString("en-CA"); // gives 2026-11-13

    const total = tasks.length;
    const completed = tasks.filter((task) => task.done).length;
    const pending = total - completed;
    const overdue = tasks.filter(
        (task) => !task.done && task.dueDate < today
    ).length;

    const firstName = (user.name || user.email).split(" ")[0];

    return (
        <div className="home-layout">
            <Sidebar onLogout={logout} />

            <div className="home-main">
                <Topbar user={user} />

                <div className="home-body">
                    <section className="welcome">
                        <div>
                            <h1>Welcome back, {firstName}! 👋</h1>
                            <p>Stay organized, complete your tasks, and achieve your goals!</p>
                        </div>
                        <p className="motto">You've got this!</p>
                    </section>

                    <section className="stats">
                        <StatCard icon={ClipboardList} value={total} label="Total Tasks" color="blue" />
                        <StatCard icon={Clock} value={pending} label="Pending" color="orange" />
                        <StatCard icon={TriangleAlert} value={overdue} label="Overdue" color="red" />
                        <StatCard icon={CircleCheck} value={completed} label="Completed" color="green" />
                    </section>

                    <section className="content-row">
                        <TaskTable
                            tasks={tasks}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                        />

                        <AddTaskForm onAdd={addTask} />
                    </section>
                </div>
            </div>
        </div>
    );
}

export default Home;