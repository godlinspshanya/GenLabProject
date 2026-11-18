
import {
    GraduationCap,
    House,
    ClipboardCheck,
    Users,
    LogOut
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
    { label: "Home", icon: House, path: "/home" },
    { label: "My Tasks", icon: ClipboardCheck, path: "/my-tasks" },
    { label: "Users", icon: Users, path: "/users" }
];

function Sidebar({ onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside className="sidebar">

            <div className="sidebar-brand">
                <GraduationCap size={46} />
                <span>Student Task Manager</span>
            </div>

            <nav className="sidebar-nav">

                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;

                    return (
                        <button
                            key={item.path}
                            className={active ? "nav-item active" : "nav-item"}
                            onClick={() => navigate(item.path)}
                        >
                            <Icon size={22} />
                            <span className="nav-label">{item.label}</span>
                        </button>
                    );
                })}

                <button className="nav-item" onClick={onLogout}>
                    <LogOut size={22} />
                    <span className="nav-label">Logout</span>
                </button>

            </nav>

            <p className="sidebar-motto">Plan · Study · Achieve ✨</p>

        </aside>
    );
}

export default Sidebar;
