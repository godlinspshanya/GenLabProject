import { Navigate, useNavigate } from "react-router-dom";
import { Mail, Palette, UserRound } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ThemeToggle from "../components/ThemeToggle";
import "./Home.css";
import "./Profile.css";

function getSavedUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
}

function Profile({ theme, onThemeChange }) {
    const navigate = useNavigate();
    const user = getSavedUser();
    const token = localStorage.getItem("token");

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
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

                <main className="home-body profile-page">
                    <section className="welcome">
                        <div>
                            <h1>Profile Settings</h1>
                            <p>View your account details and choose your dashboard theme.</p>
                        </div>
                    </section>

                    <div className="profile-settings-grid">
                        <section className="profile-settings-card">
                            <div className="profile-card-heading">
                                <span className="profile-card-icon">
                                    <UserRound size={20} />
                                </span>
                                <div>
                                    <h2>Profile details</h2>
                                    <p>Your account information</p>
                                </div>
                            </div>

                            <dl className="profile-details-list">
                                <div>
                                    <dt>Name</dt>
                                    <dd>{user.name || "Name not provided"}</dd>
                                </div>
                                <div>
                                    <dt><Mail size={15} /> Email</dt>
                                    <dd>{user.email}</dd>
                                </div>
                            </dl>
                        </section>

                        <section className="profile-settings-card">
                            <div className="profile-card-heading">
                                <span className="profile-card-icon theme-card-icon">
                                    <Palette size={20} />
                                </span>
                                <div>
                                    <h2>Theme settings</h2>
                                    <p>Choose the appearance used across your dashboard.</p>
                                </div>
                            </div>

                            <ThemeToggle theme={theme} onChange={onThemeChange} />
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Profile;
