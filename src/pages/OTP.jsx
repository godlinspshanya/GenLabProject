
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import "./OTP.css";

function OTP() {
    const [otp, setOtp] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "your email";
    const purpose = location.state?.purpose || "login";

    const handleVerify = (e) => {
        e.preventDefault();

        console.log("Email:", email);
        console.log("OTP:", otp);
        console.log("Purpose:", purpose);
    };

    return (
        <div className="otp-page">

            <div className="otp-content">

                <Logo />

                <h1>Verify your email</h1>

                <p className="otp-subtitle">
                    We've sent a verification code to
                </p>

                <p className="otp-email">{email}</p>

                <form onSubmit={handleVerify}>

                    <input
                        type="text"
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

                    <button
                        type="submit"
                        className="otp-button"
                        disabled={otp.length !== 6}
                    >
                        Verify OTP
                    </button>

                </form>

                <p className="resend-text">
                    Didn't receive the code?

                    <button
                        type="button"
                        onClick={() => console.log("Resend OTP")}
                    >
                        Resend OTP
                    </button>
                </p>

                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    Back
                </button>

            </div>

        </div>
    );
}

export default OTP;
