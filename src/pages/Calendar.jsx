import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    X
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./Home.css";
import "./Calendar.css";

const weekdays = [
    { full: "Sunday", short: "Sun" },
    { full: "Monday", short: "Mon" },
    { full: "Tuesday", short: "Tue" },
    { full: "Wednesday", short: "Wed" },
    { full: "Thursday", short: "Thu" },
    { full: "Friday", short: "Fri" },
    { full: "Saturday", short: "Sat" }
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

function getTaskDateKey(dateValue) {
    if (typeof dateValue === "string") {
        const isoDate = dateValue.match(/^(\d{4}-\d{2}-\d{2})/);
        if (isoDate) return isoDate[1];
    }

    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return "";

    return getDateKey(parsedDate);
}

function formatDate(dateKey, options = {}) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", options);
}

function formatTask(task) {
    return {
        id: task._id,
        title: task.title,
        dueDate: getTaskDateKey(task.dueDate),
        priority: task.priority,
        completed: task.completed
    };
}

function Calendar({ theme, onThemeChange }) {
    const navigate = useNavigate();
    const user = getSavedUser();
    const token = localStorage.getItem("token");

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);
    const [visibleMonth, setVisibleMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [selectedDate, setSelectedDate] = useState(() => getDateKey(new Date()));

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/tasks", {
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

                setTasks(data.map(formatTask).filter(task => task.dueDate));
            } catch (fetchError) {
                setError(fetchError.message || "Unable to fetch tasks");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchTasks();
        }
    }, [token, navigate]);

    useEffect(() => {
        if (!selectedTask) return undefined;

        const closeOnEscape = event => {
            if (event.key === "Escape") setSelectedTask(null);
        };

        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [selectedTask]);

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthLabel = visibleMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });
    const todayKey = getDateKey(new Date());
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

    const tasksByDate = tasks.reduce((groupedTasks, task) => {
        if (!groupedTasks[task.dueDate]) groupedTasks[task.dueDate] = [];
        groupedTasks[task.dueDate].push(task);
        return groupedTasks;
    }, {});

    Object.values(tasksByDate).forEach(dayTasks => {
        dayTasks.sort((a, b) => a.title.localeCompare(b.title));
    });

    const monthTasks = tasks.filter(task => task.dueDate.startsWith(monthKey));
    const selectedDateTasks = tasksByDate[selectedDate] || [];

    const calendarDays = Array.from({ length: cellCount }, (_, index) => {
        const dayNumber = index - firstWeekday + 1;
        if (dayNumber < 1 || dayNumber > daysInMonth) return null;

        const dateKey = `${monthKey}-${String(dayNumber).padStart(2, "0")}`;
        return {
            dateKey,
            dayNumber,
            tasks: tasksByDate[dateKey] || [],
            isToday: dateKey === todayKey
        };
    });

    const changeMonth = offset => {
        const nextMonth = new Date(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth() + offset,
            1
        );
        setVisibleMonth(nextMonth);
        setSelectedDate(getDateKey(nextMonth));
    };

    const goToToday = () => {
        const now = new Date();
        const dateKey = getDateKey(now);
        setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
        setSelectedDate(dateKey);
    };

    const renderTaskButton = task => (
        <button
            type="button"
            className={`calendar-task ${task.completed ? "is-completed" : ""}`}
            key={task.id}
            onClick={() => {
                setSelectedDate(task.dueDate);
                setSelectedTask(task);
            }}
            title={`${task.title} · ${task.priority} priority · ${task.completed ? "Completed" : "Incomplete"}`}
        >
            <span className={`calendar-task-marker priority-${task.priority.toLowerCase()}`}>
                {task.completed && <CircleCheck size={11} aria-hidden="true" />}
            </span>
            <span className="calendar-task-title">{task.title}</span>
        </button>
    );

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

                <main className="home-body calendar-page">
                    <section className="welcome">
                        <div>
                            <h1>Calendar</h1>
                            <p>See your tasks by due date and plan the month ahead.</p>
                        </div>
                    </section>

                    {error && (
                        <p className="calendar-error" role="alert">{error}</p>
                    )}

                    {!loading && !error && tasks.length === 0 && (
                        <p className="calendar-empty-message">
                            No tasks yet. Add tasks in My Tasks and their due dates will appear here.
                        </p>
                    )}

                    {!loading && !error && tasks.length > 0 && monthTasks.length === 0 && (
                        <p className="calendar-empty-message">
                            No tasks are scheduled for {monthLabel}.
                        </p>
                    )}

                    <section className="calendar-panel" aria-label="Monthly task calendar">
                        <div className="calendar-toolbar">
                            <div>
                                <span className="calendar-eyebrow">YOUR SCHEDULE</span>
                                <h2>{monthLabel}</h2>
                            </div>
                            <div className="calendar-month-controls">
                                <button
                                    type="button"
                                    className="calendar-today-button"
                                    onClick={goToToday}
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    className="calendar-nav-button"
                                    aria-label="Previous month"
                                    onClick={() => changeMonth(-1)}
                                >
                                    <ChevronLeft size={19} />
                                </button>
                                <button
                                    type="button"
                                    className="calendar-nav-button"
                                    aria-label="Next month"
                                    onClick={() => changeMonth(1)}
                                >
                                    <ChevronRight size={19} />
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <p className="calendar-empty-message">Loading your calendar...</p>
                        ) : (
                            <>
                                <div className="calendar-weekdays">
                                    {weekdays.map(day => (
                                        <div className="calendar-weekday" key={day.full}>
                                            <span className="weekday-full">{day.full}</span>
                                            <span className="weekday-short">{day.short}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="calendar-grid">
                                    {calendarDays.map((day, index) => day ? (
                                        <div
                                            className={[
                                                "calendar-day",
                                                day.isToday ? "is-today" : "",
                                                selectedDate === day.dateKey ? "is-selected" : ""
                                            ].filter(Boolean).join(" ")}
                                            key={day.dateKey}
                                        >
                                            <div className="calendar-day-heading">
                                                <button
                                                    type="button"
                                                    className="calendar-date-button"
                                                    aria-label={`${formatDate(day.dateKey, {
                                                        weekday: "long",
                                                        month: "long",
                                                        day: "numeric"
                                                    })}${day.isToday ? ", today" : ""}`}
                                                    aria-pressed={selectedDate === day.dateKey}
                                                    onClick={() => setSelectedDate(day.dateKey)}
                                                >
                                                    <span>{day.dayNumber}</span>
                                                    {day.isToday && (
                                                        <span className="today-label">Today</span>
                                                    )}
                                                </button>
                                                {day.tasks.length > 0 && (
                                                    <span className="calendar-task-count">
                                                        {day.tasks.length}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="calendar-task-list">
                                                {day.tasks.map(renderTaskButton)}
                                            </div>

                                            {day.tasks.length > 0 && (
                                                <div className="calendar-task-indicators" aria-hidden="true">
                                                    {day.tasks.slice(0, 4).map(task => (
                                                        <span
                                                            className={[
                                                                "calendar-task-indicator",
                                                                `priority-${task.priority.toLowerCase()}`,
                                                                task.completed ? "is-completed" : ""
                                                            ].filter(Boolean).join(" ")}
                                                            key={task.id}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            className="calendar-day outside-month"
                                            key={`empty-${index}`}
                                            aria-hidden="true"
                                        />
                                    ))}
                                </div>

                                <section className="calendar-agenda" aria-live="polite">
                                    <h3>
                                        {formatDate(selectedDate, {
                                            weekday: "long",
                                            month: "long",
                                            day: "numeric"
                                        })}
                                    </h3>
                                    {selectedDateTasks.length > 0 ? (
                                        <div className="calendar-agenda-list">
                                            {selectedDateTasks.map(renderTaskButton)}
                                        </div>
                                    ) : (
                                        <p>No tasks scheduled for this date.</p>
                                    )}
                                </section>
                            </>
                        )}
                    </section>

                    <p className="calendar-legend">
                        <span className="calendar-legend-item">
                            <span className="calendar-task-indicator priority-high" /> High priority
                        </span>
                        <span className="calendar-legend-item">
                            <span className="calendar-task-indicator priority-medium" /> Medium priority
                        </span>
                        <span className="calendar-legend-item">
                            <span className="calendar-task-indicator priority-low" /> Low priority
                        </span>
                        <span className="calendar-legend-item">
                            <CircleCheck size={14} /> Completed
                        </span>
                    </p>
                </main>
            </div>

            {selectedTask && (
                <div
                    className="calendar-modal-backdrop"
                    role="presentation"
                    onClick={() => setSelectedTask(null)}
                >
                    <section
                        className="calendar-task-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="calendar-task-modal-title"
                        onClick={event => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="calendar-modal-close"
                            aria-label="Close task details"
                            onClick={() => setSelectedTask(null)}
                        >
                            <X size={20} />
                        </button>
                        <span className="calendar-modal-eyebrow">
                            <CalendarDays size={15} /> Task details
                        </span>
                        <h2 id="calendar-task-modal-title">{selectedTask.title}</h2>
                        <dl className="calendar-task-details">
                            <div>
                                <dt>Due date</dt>
                                <dd>{formatDate(selectedTask.dueDate, {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric"
                                })}</dd>
                            </div>
                            <div>
                                <dt>Priority</dt>
                                <dd>
                                    <span className={`badge priority-${selectedTask.priority.toLowerCase()}`}>
                                        {selectedTask.priority}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt>Status</dt>
                                <dd className={selectedTask.completed ? "task-status-completed" : "task-status-pending"}>
                                    {selectedTask.completed ? "Completed" : "Incomplete"}
                                </dd>
                            </div>
                        </dl>
                        <Link className="calendar-open-tasks" to="/my-tasks">
                            Open My Tasks <ArrowRight size={17} />
                        </Link>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Calendar;
