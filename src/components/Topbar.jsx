import { Search, Bell, ChevronDown } from "lucide-react";

function Topbar({ user }) {
    const displayName = user.name || user.email;
    const firstName = displayName.split(" ")[0];
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <header className="topbar">
            <div className="search-box">
                <Search size={20} />
                <input type="text" placeholder="Search tasks..." />
            </div>

            <div className="topbar-right">
                <div className="bell">
                    <Bell size={24} />
                    <span className="bell-dot"></span>
                </div>

                <div className="user-chip">
                    <div className="avatar">{initial}</div>
                    <div className="user-text">
                        <small>Hello,</small>
                        <strong>{firstName}</strong>
                    </div>
                    <ChevronDown size={16} />
                </div>
            </div>
        </header>
    );
}

export default Topbar;