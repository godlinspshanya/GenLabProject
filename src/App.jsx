
import { useCallback, useLayoutEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import MyTasks from "./pages/MyTasks";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OTP from "./pages/OTP";
import Users from "./pages/Users";
import Landing from "./pages/Landing";
import Preloader from "./components/Preloader";

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
    const completeIntro = useCallback(() => setIntroComplete(true), []);

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
                    <Route path="/home" element={<Home />} />
                    <Route path="/my-tasks" element={<MyTasks />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
            {!introComplete && <Preloader onComplete={completeIntro} />}
        </BrowserRouter>
    );
}

export default App;
