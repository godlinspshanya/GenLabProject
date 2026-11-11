
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Logo from "../components/Logo";
import "./Signup.css";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            // Send email to backend to generate OTP
            const response = await fetch(
                "http://localhost:5000/api/auth/send-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to send OTP");
            }

            // Navigate to OTP page after successful email sending
            navigate("/verify-otp", {
                state: {
                    email: email.trim(),
                    name: name.trim(),
                    purpose: "signup"
                }
            });

        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-content">

                <Logo />

                <h1>Create your account</h1>

                <p className="signup-subtitle">
                    Sign up to get started with your account
                </p>

                <form onSubmit={handleSignup}>

                    <input
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {error && (
                        <p style={{ color: "#ff6b6b" }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="signup-button"
                        disabled={loading}
                    >
                        {loading ? "Sending OTP..." : "Create Account"}
                    </button>

                </form>

                <p className="login-redirect">
                    Already have an account?
                    <Link to="/login"> Login</Link>
                </p>

            </div>
        </div>
    );
}

export default Signup;
