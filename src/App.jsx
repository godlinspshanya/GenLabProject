
import { useCallback, useLayoutEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import MyTasks from "./pages/MyTasks";
import Calendar from "./pages/Calendar";
import MyProgress from "./pages/MyProgress";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OTP from "./pages/OTP";
import Landing from "./pages/Landing";
import Preloader from "./components/Preloader";

function getSavedTheme() {
    try {
        return localStorage.getItem("theme") === "dark" ? "dark" : "light";
    } catch (error) {
        console.error("Unable to read the saved theme preference:", error);
        return "light";
    }
}

function ScrollToTop() {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        const previousScrollRestoration = window.history.scrollRestoration;
        window.history.scrollRestoration = "manual";
        window.scrollTo(0, 0);

        return () => {
            window.history.scrollRestoration = previousScrollRestoration;
        };
    }, [pathname]);

    return null;
}

function App() {
    const [introComplete, setIntroComplete] = useState(false);
    const [theme, setTheme] = useState(getSavedTheme);
    const completeIntro = useCallback(() => setIntroComplete(true), []);

    useLayoutEffect(() => {
        document.documentElement.dataset.theme = theme;

        try {
            localStorage.setItem("theme", theme);
        } catch (error) {
            console.error("Unable to save the theme preference:", error);
        }
    }, [theme]);

    return (
        <BrowserRouter>
            <ScrollToTop />
            <div
                className="app-routes"
                style={{ display: "contents" }}
                inert={!introComplete}
                aria-hidden={!introComplete}
            >
                <Routes>
                    <Route path="/" element={<Landing />} />

                    {/* Authentication */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/verify-otp" element={<OTP />} />

                    {/* Main Pages */}
                    <Route
                        path="/home"
                        element={<Home theme={theme} onThemeChange={setTheme} />}
                    />
                    <Route
                        path="/my-tasks"
                        element={<MyTasks theme={theme} onThemeChange={setTheme} />}
                    />
                    <Route
                        path="/calendar"
                        element={<Calendar theme={theme} onThemeChange={setTheme} />}
                    />
                    <Route
                        path="/my-progress"
                        element={<MyProgress theme={theme} onThemeChange={setTheme} />}
                    />
                    <Route
                        path="/profile"
                        element={<Profile theme={theme} onThemeChange={setTheme} />}
                    />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
            {!introComplete && <Preloader onComplete={completeIntro} />}
        </BrowserRouter>
    );
}

export default App;
