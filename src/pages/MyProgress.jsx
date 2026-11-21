import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { CalendarDays, Lightbulb, Target } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { API_BASE_URL } from "../config/api";
import "./Home.css";
import "./MyProgress.css";

const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

function getSavedUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
}

function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatTask(task) {
    const completionDate = task.completedAt ? new Date(task.completedAt) : null;

    return {
        completed: task.completed,
        completionDate: completionDate && !Number.isNaN(completionDate.getTime())
            ? getDateKey(completionDate)
            : null
    };
}

function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });
}

function MyProgress({ theme, onThemeChange }) {
    const navigate = useNavigate();
    const user = getSavedUser();
    const token = localStorage.getItem("token");

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/tasks`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
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
            } catch (fetchError) {
                setError(fetchError.message || "Unable to fetch tasks");
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchTasks();
    }, [token, navigate]);

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthName = now.toLocaleDateString("en-US", { month: "long" });
    const completedTasks = tasks.filter(task => task.completed);
    const datedCompletions = completedTasks.filter(task => task.completionDate);
    const untrackedCompletions = completedTasks.length - datedCompletions.length;

    const weeklyData = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        const dateKey = getDateKey(date);

        return {
            date,
            dateKey,
            label: date.toLocaleDateString("en-US", { weekday: "short" }),
            count: datedCompletions.filter(task => task.completionDate === dateKey).length
        };
    });
    const weeklyTotal = weeklyData.reduce((total, day) => total + day.count, 0);
    const weeklyMaximum = Math.max(0, ...weeklyData.map(day => day.count));

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthlyData = Array.from({ length: daysInMonth }, (_, index) => {
        const dayNumber = index + 1;
        const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), dayNumber);
        const dateKey = getDateKey(date);

        return {
            date,
            dateKey,
            dayNumber,
            count: datedCompletions.filter(task => task.completionDate === dateKey).length
        };
    });
    const monthlyTotal = monthlyData.reduce((total, day) => total + day.count, 0);
    const monthlyMaximum = Math.max(0, ...monthlyData.map(day => day.count));

    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-`;
    const weekdayTotals = Array.from({ length: 7 }, (_, weekday) => ({
        weekday,
        label: weekdayNames[weekday],
        count: datedCompletions.reduce((total, task) => {
            if (!task.completionDate.startsWith(monthKey)) return total;

            const [year, month, day] = task.completionDate.split("-").map(Number);
            return new Date(year, month - 1, day).getDay() === weekday
                ? total + 1
                : total;
        }, 0)
    }));
    const mostProductiveWeekdayCount = Math.max(
        0,
        ...weekdayTotals.map(day => day.count)
    );
    const mostProductiveWeekdays = weekdayTotals.filter(
        day => day.count === mostProductiveWeekdayCount && day.count > 0
    );

    const insight = weeklyTotal > 0
        ? (() => {
            const topDays = weeklyData.filter(day => day.count === weeklyMaximum);
            return topDays.length === 1
                ? `Your busiest day this week is ${topDays[0].label}, with ${weeklyMaximum} completed ${weeklyMaximum === 1 ? "task" : "tasks"}.`
                : `Your busiest days this week are ${topDays.map(day => day.label).join(" and ")}, with ${weeklyMaximum} ${weeklyMaximum === 1 ? "completion" : "completions"} each.`;
        })()
        : mostProductiveWeekdays.length > 0
            ? `This month, ${mostProductiveWeekdays.map(day => day.label).join(" and ")} ${mostProductiveWeekdays.length === 1 ? "is" : "are"} your most productive ${mostProductiveWeekdays.length === 1 ? "day" : "days"}, with ${mostProductiveWeekdayCount} ${mostProductiveWeekdayCount === 1 ? "completion" : "completions"} each.`
            : "";

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

                <main className="home-body progress-page">
                    <section className="welcome">
                        <div>
                            <h1>My Progress</h1>
                            <p>Explore your task completion patterns over time.</p>
                        </div>
                    </section>

                    {loading ? (
                        <p className="progress-state-message">Loading your task analytics...</p>
                    ) : error ? (
                        <p className="progress-error" role="alert">{error}</p>
                    ) : (
                        <>
                            {tasks.length === 0 && !error && (
                                <p className="progress-state-message">
                                    No tasks yet. Complete tasks in My Tasks to build your progress history.
                                </p>
                            )}

                            {untrackedCompletions > 0 && (
                                <p className="progress-history-note">
                                    {untrackedCompletions} previously completed {untrackedCompletions === 1 ? "task has" : "tasks have"} no recorded completion date and {untrackedCompletions === 1 ? "is" : "are"} excluded from date-based charts.
                                </p>
                            )}

                            <section className="progress-chart-grid">
                                <article className="progress-chart-card">
                                    <div className="progress-card-heading">
                                        <span className="progress-card-icon weekly-icon">
                                            <Target size={19} />
                                        </span>
                                        <div>
                                            <h2>Weekly progress</h2>
                                            <p>
                                                {formatDate(weekStart)} – {formatDate(weeklyData[6].date)}
                                            </p>
                                        </div>
                                    </div>

                                    {weeklyTotal === 0 && (
                                        <p className="progress-chart-note">
                                            No dated task completions this week yet.
                                        </p>
                                    )}

                                    <div
                                        className="weekly-chart"
                                        role="img"
                                        aria-label={`Tasks completed each day this week: ${weeklyData.map(day => `${day.label} ${day.count}`).join(", ")}`}
                                    >
                                        {weeklyData.map(day => {
                                            const height = weeklyMaximum === 0
                                                ? 3
                                                : day.count === 0
                                                    ? 3
                                                    : Math.max(10, (day.count / weeklyMaximum) * 100);

                                            return (
                                                <div className="weekly-chart-column" key={day.dateKey}>
                                                    <span className="weekly-chart-count">{day.count}</span>
                                                    <div className="weekly-chart-track">
                                                        <span
                                                            className="weekly-chart-bar"
                                                            style={{ height: `${height}%` }}
                                                        />
                                                    </div>
                                                    <span className="weekly-chart-label">{day.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <p className="progress-chart-caption">
                                        {weeklyTotal} recorded {weeklyTotal === 1 ? "completion" : "completions"} this week
                                    </p>
                                </article>

                                <article className="progress-chart-card monthly-progress-card">
                                    <div className="progress-card-heading">
                                        <span className="progress-card-icon monthly-icon">
                                            <CalendarDays size={19} />
                                        </span>
                                        <div>
                                            <h2>Monthly productivity</h2>
                                            <p>Daily completions in {monthName}</p>
                                        </div>
                                    </div>

                                    {monthlyTotal === 0 && (
                                        <p className="progress-chart-note">
                                            No dated task completions this month yet.
                                        </p>
                                    )}

                                    <div
                                        className="monthly-chart"
                                        style={{
                                            gridTemplateColumns: `repeat(${daysInMonth}, minmax(0, 1fr))`
                                        }}
                                        role="img"
                                        aria-label={`Tasks completed each day in ${monthName}: ${monthlyData.map(day => `${day.dayNumber}: ${day.count}`).join(", ")}`}
                                    >
                                        {monthlyData.map(day => {
                                            const height = monthlyMaximum === 0
                                                ? 3
                                                : day.count === 0
                                                    ? 3
                                                    : Math.max(10, (day.count / monthlyMaximum) * 100);
                                            const showLabel =
                                                day.dayNumber === 1 ||
                                                day.dayNumber % 5 === 0 ||
                                                day.dayNumber === daysInMonth;

                                            return (
                                                <div
                                                    className="monthly-chart-column"
                                                    key={day.dateKey}
                                                    title={`${formatDate(day.date)}: ${day.count} completed`}
                                                >
                                                    <div className="monthly-chart-track">
                                                        <span
                                                            className="monthly-chart-bar"
                                                            style={{ height: `${height}%` }}
                                                        />
                                                    </div>
                                                    <span className="monthly-chart-label">
                                                        {showLabel ? day.dayNumber : ""}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <p className="progress-chart-caption">
                                        {monthlyTotal} recorded {monthlyTotal === 1 ? "completion" : "completions"} this month
                                    </p>
                                </article>
                            </section>

                            <section className="progress-insights-card">
                                <div className="progress-card-heading">
                                    <span className="progress-card-icon insight-icon">
                                        <Lightbulb size={19} />
                                    </span>
                                    <div>
                                        <h2>Productivity insight</h2>
                                        <p>Based on recorded task completion dates</p>
                                    </div>
                                </div>
                                <p className={insight ? "progress-insight-text" : "progress-insight-empty"}>
                                    {insight || "There isn't enough dated completion activity yet to identify a pattern. Complete tasks to build your insights."}
                                </p>
                            </section>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}

export default MyProgress;
