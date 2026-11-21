
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Logo from "../components/Logo";
import { API_BASE_URL } from "../config/api";
import "./Signup.css";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/send-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim().toLowerCase(),
                        phone: phone.trim(),
                        gender,
                        purpose: "signup"
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to send OTP");
            }

            navigate("/verify-otp", {
                state: {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    phone: phone.trim(),
                    gender,
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

                    <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) =>
                            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                        }
                        pattern="[0-9]{10}"
                        title="Enter a valid 10-digit phone number"
                        maxLength={10}
                        required
                    />

                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Select your gender
                        </option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">
                            Prefer not to say
                        </option>
                    </select>

                    {error && (
                        <p className="signup-error">
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
