import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    Bell,
    CalendarClock,
    Check,
    CheckCheck,
    ChevronDown,
    Clock3,
    LogOut,
    TriangleAlert,
    UserRound
} from "lucide-react";

import ThemeToggle from "./ThemeToggle";

function getLocalDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function addDaysToDateKey(dateKey, days) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return getLocalDateKey(new Date(year, month - 1, day + days));
}

function getDeadlineNotifications(tasks) {
    const today = getLocalDateKey(new Date());
    const lastUpcomingDate = addDaysToDateKey(today, 7);

    return tasks.reduce((notifications, task) => {
        const taskId = String(task._id || "");
        const dueDate = String(task.dueDate || "").slice(0, 10);

        if (
            !taskId ||
            task.completed ||
            !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)
        ) {
            return notifications;
        }

        let category = "";

        if (dueDate < today) {
            category = "overdue";
        } else if (dueDate === today) {
            category = "today";
        } else if (dueDate <= lastUpcomingDate) {
            category = "upcoming";
        }

        if (category) {
            notifications.push({
                taskId,
                title: task.title,
                dueDate,
                category
            });
        }

        return notifications;
    }, []);
}

function formatDueDate(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function readNotificationState(storageKey) {
    if (!storageKey) {
        return {
            ids: [],
            warning: "Notification read status is unavailable for this account."
        };
    }

    try {
        const savedIds = localStorage.getItem(storageKey);

        if (!savedIds) {
            return { ids: [], warning: "" };
        }

        const parsedIds = JSON.parse(savedIds);

        if (!Array.isArray(parsedIds)) {
            throw new Error("Saved notification status is not a list.");
        }

        return {
            ids: parsedIds.filter(id => typeof id === "string"),
            warning: ""
        };
    } catch (error) {
        console.error("Unable to read notification status:", error);
        return {
            ids: [],
            warning: "Read status could not be loaded and will reset on refresh."
        };
    }
}

function saveNotificationState(storageKey, ids) {
    if (!storageKey) {
        return "Notification read status is unavailable for this account.";
    }

    try {
        localStorage.setItem(storageKey, JSON.stringify(ids));
        return "";
    } catch (error) {
        console.error("Unable to save notification status:", error);
        return "Read status could not be saved and may reset on refresh.";
    }
}

const notificationSections = [
    { category: "overdue", title: "Overdue" },
    { category: "today", title: "Due Today" },
    { category: "upcoming", title: "Upcoming Deadlines" }
];

const categoryIcons = {
    overdue: TriangleAlert,
    today: Clock3,
    upcoming: CalendarClock
};

function Topbar({ user, theme, onThemeChange, onLogout }) {
    const token = localStorage.getItem("token");
    const storageKey = user?.id || user?.email
        ? `task-manager:read-notifications:${user.id || user.email}`
        : "";
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(Boolean(token));
    const [notificationError, setNotificationError] = useState("");
    const [readState, setReadState] = useState(() =>
        readNotificationState(storageKey)
    );
    const profileRef = useRef(null);
    const notificationsRef = useRef(null);
    const readIdsRef = useRef(readState.ids);
    const requestIdRef = useRef(0);
    const displayName = user?.name?.trim() || user?.email || "User";
    const firstName = displayName.split(/\s+/)[0];
    const initial = displayName.charAt(0).toUpperCase();
    const notifications = getDeadlineNotifications(tasks);
    const unreadCount = notifications.filter(
        notification => !readState.ids.includes(notification.taskId)
    ).length;

    const refreshTasks = useCallback(async () => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        if (!token) return;

        try {
            const response = await fetch("http://localhost:5000/api/tasks", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load notifications");
            }

            if (!Array.isArray(data)) {
                throw new Error("The tasks response was not a list.");
            }

            if (requestId !== requestIdRef.current) return;

            setTasks(data);
            const activeTaskIds = new Set(
                getDeadlineNotifications(data).map(notification => notification.taskId)
            );
            const retainedIds = readIdsRef.current.filter(id => activeTaskIds.has(id));

            if (retainedIds.length !== readIdsRef.current.length) {
                readIdsRef.current = retainedIds;
                setReadState({
                    ids: retainedIds,
                    warning: saveNotificationState(storageKey, retainedIds)
                });
            }
            setNotificationError("");
        } catch (error) {
            if (requestId !== requestIdRef.current) return;

            console.error("Unable to refresh notifications:", error);
            setNotificationError(error.message || "Unable to load notifications.");
        } finally {
            if (requestId === requestIdRef.current) {
                setLoadingNotifications(false);
            }
        }
    }, [storageKey, token]);

    useEffect(() => {
        let isActive = true;
        queueMicrotask(() => {
            if (isActive) refreshTasks();
        });

        const handleRefresh = () => {
            setLoadingNotifications(true);
            setNotificationError("");
            refreshTasks();
        };

        window.addEventListener("tasks:changed", handleRefresh);
        window.addEventListener("focus", handleRefresh);

        return () => {
            isActive = false;
            window.removeEventListener("tasks:changed", handleRefresh);
            window.removeEventListener("focus", handleRefresh);
            requestIdRef.current += 1;
        };
    }, [refreshTasks]);

    useEffect(() => {
        if (!profileOpen && !notificationsOpen) return undefined;

        const handlePointerDown = event => {
            if (
                notificationsRef.current &&
                !notificationsRef.current.contains(event.target)
            ) {
                setNotificationsOpen(false);
            }

            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        };
        const handleKeyDown = event => {
            if (event.key === "Escape") {
                setNotificationsOpen(false);
                setProfileOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [profileOpen, notificationsOpen]);

    const markNotificationsRead = notificationIds => {
        const nextIds = [...new Set([...readIdsRef.current, ...notificationIds])];
        readIdsRef.current = nextIds;
        setReadState({
            ids: nextIds,
            warning: saveNotificationState(storageKey, nextIds)
        });
    };

    const markAllRead = () => {
        markNotificationsRead(notifications.map(notification => notification.taskId));
    };

    const openNotifications = () => {
        const shouldOpen = !notificationsOpen;
        setNotificationsOpen(shouldOpen);
        setProfileOpen(false);

        if (shouldOpen && token) {
            setLoadingNotifications(true);
            setNotificationError("");
            refreshTasks();
        }
    };

    return (
        <header className="topbar">
            <div className="topbar-right">
                <div className="notification-control" ref={notificationsRef}>
                    <button
                        type="button"
                        className="bell"
                        aria-label={
                            unreadCount
                                ? `Notifications, ${unreadCount} unread`
                                : "Notifications"
                        }
                        aria-expanded={notificationsOpen}
                        aria-haspopup="true"
                        aria-controls="notification-dropdown"
                        onClick={openNotifications}
                    >
                        <Bell size={22} />
                        {unreadCount > 0 && (
                            <span className="bell-count" aria-hidden="true">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {notificationsOpen && (
                        <section
                            className="notification-dropdown"
                            id="notification-dropdown"
                            aria-label="Notifications"
                        >
                            <header className="notification-dropdown-header">
                                <div>
                                    <h2>Notifications</h2>
                                    <p>
                                        {unreadCount
                                            ? `${unreadCount} unread`
                                            : "You're all caught up"}
                                    </p>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        className="notification-mark-all"
                                        onClick={markAllRead}
                                    >
                                        <CheckCheck size={15} />
                                        Mark all read
                                    </button>
                                )}
                            </header>

                            {notificationError && (
                                <p className="notification-message notification-error" role="alert">
                                    {notificationError}
                                </p>
                            )}
                            {readState.warning && (
                                <p className="notification-message notification-warning" role="status">
                                    {readState.warning}
                                </p>
                            )}

                            {loadingNotifications && notifications.length === 0 ? (
                                <p className="notification-empty">Loading your deadlines...</p>
                            ) : notificationSections.every(section =>
                                !notifications.some(
                                    notification => notification.category === section.category
                                )
                            ) ? (
                                notificationError ? null : (
                                    <div className="notification-empty">
                                        <Check size={20} />
                                        <strong>No upcoming task deadlines</strong>
                                        <span>Due dates within the next 7 days will appear here.</span>
                                    </div>
                                )
                            ) : (
                                <div className="notification-list">
                                    {notificationSections.map(section => {
                                        const sectionNotifications = notifications
                                            .filter(item => item.category === section.category)
                                            .sort((a, b) => (
                                                section.category === "overdue"
                                                    ? b.dueDate.localeCompare(a.dueDate)
                                                    : a.dueDate.localeCompare(b.dueDate)
                                            ));

                                        if (sectionNotifications.length === 0) return null;

                                        const CategoryIcon = categoryIcons[section.category];

                                        return (
                                            <section
                                                className={`notification-group notification-group-${section.category}`}
                                                key={section.category}
                                            >
                                                <h3>
                                                    <CategoryIcon size={15} />
                                                    {section.title}
                                                    <span>{sectionNotifications.length}</span>
                                                </h3>

                                                {sectionNotifications.map(notification => {
                                                    const isRead = readState.ids.includes(
                                                        notification.taskId
                                                    );

                                                    return (
                                                        <article
                                                            className={[
                                                                "notification-item",
                                                                isRead ? "is-read" : "is-unread"
                                                            ].join(" ")}
                                                            key={notification.taskId}
                                                        >
                                                            <Link
                                                                className="notification-task-link"
                                                                to={`/my-tasks?task=${encodeURIComponent(notification.taskId)}`}
                                                                onClick={() => {
                                                                    markNotificationsRead([
                                                                        notification.taskId
                                                                    ]);
                                                                    setNotificationsOpen(false);
                                                                }}
                                                            >
                                                                <span className="notification-task-title">
                                                                    {notification.title}
                                                                </span>
                                                                <span className="notification-task-date">
                                                                    Due {formatDueDate(notification.dueDate)}
                                                                </span>
                                                            </Link>

                                                            {isRead ? (
                                                                <span
                                                                    className="notification-read-label"
                                                                    aria-label="Read"
                                                                >
                                                                    <Check size={14} />
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    className="notification-mark-read"
                                                                    aria-label={`Mark ${notification.title} as read`}
                                                                    title="Mark as read"
                                                                    onClick={() =>
                                                                        markNotificationsRead([
                                                                            notification.taskId
                                                                        ])
                                                                    }
                                                                >
                                                                    <Check size={15} />
                                                                </button>
                                                            )}
                                                        </article>
                                                    );
                                                })}
                                            </section>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    )}
                </div>

                <div className="profile-control" ref={profileRef}>
                    <button
                        type="button"
                        className="user-chip"
                        aria-expanded={profileOpen}
                        aria-haspopup="true"
                        aria-controls="profile-dropdown"
                        onClick={() => {
                            setProfileOpen(open => !open);
                            setNotificationsOpen(false);
                        }}
                    >
                        <span className="avatar">{initial}</span>
                        <span className="user-text">
                            <small>Hello,</small>
                            <strong>{firstName}</strong>
                        </span>
                        <ChevronDown
                            className={profileOpen ? "profile-chevron is-open" : "profile-chevron"}
                            size={16}
                        />
                    </button>

                    {profileOpen && (
                        <div className="profile-dropdown" id="profile-dropdown">
                            <div className="profile-dropdown-identity">
                                <strong>{displayName}</strong>
                                {user?.email && <span>{user.email}</span>}
                            </div>

                            <Link
                                className="profile-dropdown-link"
                                to="/profile"
                                onClick={() => setProfileOpen(false)}
                            >
                                <UserRound size={17} />
                                <span>Profile Settings</span>
                            </Link>

                            <div className="profile-theme-settings">
                                <span className="profile-theme-label">Theme Settings</span>
                                <ThemeToggle
                                    theme={theme}
                                    onChange={onThemeChange}
                                    compact
                                />
                            </div>

                            <button
                                type="button"
                                className="profile-dropdown-logout"
                                onClick={() => {
                                    setProfileOpen(false);
                                    onLogout();
                                }}
                            >
                                <LogOut size={17} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Topbar;
