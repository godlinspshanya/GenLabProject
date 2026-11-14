
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Logo from "../components/Logo";
import GoogleButton from "../components/GoogleButton";
import Divider from "../components/Divider";
import InputField from "../components/InputField";
import "./Login.css";

// Backend API URL
const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function Login() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to log in");
            }

            localStorage.setItem("user", JSON.stringify(data.user));

            navigate("/home");

        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-content">

                <Logo />

                <h1>Log In to Student Task Manager</h1>

                <form onSubmit={handleSubmit}>

                    <InputField
                        email={email}
                        setEmail={setEmail}
                    />

                    {error && (
                        <p style={{ color: "#ff6b6b" }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="continue-button"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Continue"}
                    </button>

                </form>

                <Divider />

                <GoogleButton />

                <p className="policy-text">
                    By logging in you agree with our
                    <a href="#privacy"> Privacy Policy </a>
                    and
                    <a href="#terms"> Terms of Use</a>
                </p>

                <p className="signup-text">
                    Don't have an account?
                    <Link to="/signup"> Sign Up</Link>
                </p>

            </div>
        </div>
    );
}

export default Login;
