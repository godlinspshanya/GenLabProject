import {
    GraduationCap,
    House,
    ClipboardCheck,
    Calendar,
    ChartColumn,
    Settings,
    LogOut
} from "lucide-react";

const menuItems = [
    { label: "Home", icon: House, active: true },
    { label: "My Tasks", icon: ClipboardCheck },
    { label: "Calendar", icon: Calendar },
    { label: "Statistics", icon: ChartColumn },
    { label: "Settings", icon: Settings }
];

function Sidebar({ onLogout }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <GraduationCap size={46} />
                <span>Student Task Manager</span>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.label}
                            className={item.active ? "nav-item active" : "nav-item"}
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