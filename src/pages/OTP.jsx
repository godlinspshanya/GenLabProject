
import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

import Logo from "../components/Logo";
import { API_BASE_URL } from "../config/api";
import "./OTP.css";

function OTP() {
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email || "";
    const name = location.state?.name || "";
    const phone = location.state?.phone || "";
    const gender = location.state?.gender || "";
    const purpose = location.state?.purpose || "";

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [verified, setVerified] = useState(false);
    const [user, setUser] = useState(null);

    // ---------- VERIFY OTP ----------

    const handleVerify = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (otp.length !== 6) {
            setError("Please enter the complete 6-digit OTP.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/verify-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        otp: otp,
                        name: name,
                        phone: phone,
                        gender: gender,
                        purpose: purpose
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "OTP verification failed"
                );
            }

            setUser(data.user);

            // LOGIN
            if (purpose === "login") {
                localStorage.setItem("token", data.token);

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                navigate("/home", { replace: true });
                return;
            }

            // SIGNUP
            setVerified(true);

        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // ---------- RESEND OTP ----------

    const handleResend = async () => {
        setError("");
        setMessage("");
        setResending(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/send-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        name: name,
                        phone: phone,
                        gender: gender,
                        purpose: purpose
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to resend OTP"
                );
            }

            setOtp("");
            setMessage("A new OTP has been sent to your email.");

        } catch (err) {
            setError(err.message || "Unable to resend OTP");
        } finally {
            setResending(false);
        }
    };

    // ---------- CHECK PAGE ACCESS ----------

    if (
        !email ||
        !["signup", "login"].includes(purpose)
    ) {
        return (
            <div className="otp-page">
                <div className="otp-content">
                    <Logo />

                    <h1>Verification unavailable</h1>

                    <p className="otp-subtitle">
                        Please start again from the Login or Signup page.
                    </p>

                    <Link to="/login">Go to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="otp-page">
            <div className="otp-content">

                <Logo />

                {!verified ? (
                    <>
                        <h1>
                            {purpose === "login"
                                ? "Verify to Login"
                                : "Verify your email"}
                        </h1>

                        <p className="otp-subtitle">
                            We've sent a verification code to
                        </p>

                        <p className="otp-email">
                            {email}
                        </p>

                        <form onSubmit={handleVerify}>

                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(
                                        e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6)
                                    )
                                }
                                maxLength={6}
                                required
                            />

                            {error && (
                                <p style={{ color: "#ff6b6b" }}>
                                    {error}
                                </p>
                            )}

                            {message && (
                                <p style={{ color: "#51ADE8" }}>
                                    {message}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="otp-button"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading
                                    ? "Verifying..."
                                    : "Verify OTP"}
                            </button>

                        </form>

                        <p className="resend-text">
                            Didn't receive the code?

                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resending}
                            >
                                {resending
                                    ? "Sending..."
                                    : "Resend OTP"}
                            </button>
                        </p>

                        <Link
                            to={purpose === "login" ? "/login" : "/signup"}
                        >
                            Back
                        </Link>
                    </>
                ) : (
                    <>
                        <h1>Account Created!</h1>

                        <p className="otp-subtitle">
                            Your email has been verified and your account has been created.
                        </p>

                        {user && (
                            <p className="otp-email">
                                {user.name || user.email}
                            </p>
                        )}

                        <p style={{ color: "#51ADE8" }}>
                            {user?.email}
                        </p>

                        <Link to="/login">
                            Continue to Login
                        </Link>
                    </>
                )}

            </div>
        </div>
    );
}

export default OTP;
