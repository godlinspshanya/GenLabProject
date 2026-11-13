import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

import "./GoogleButton.css";
import logo from "../assets/Google.png";

function GoogleButton() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const login = useGoogleLogin({
        flow: "auth-code",      // we get a one-time code, not a token
        select_account: true,   // always show the account chooser

        onSuccess: async ({ code }) => {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(
                    "http://localhost:5000/api/auth/google",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Google sign-in failed");
                }

                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/home");

            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        },

        onError: () => setError("Google sign-in was cancelled or failed.")
    });

    return (
        <>
            <button
                className="google-button"
                type="button"
                onClick={() => login()}
                disabled={loading}
            >
                <img src={logo} alt="Google" />
                <span>{loading ? "Please wait..." : "Continue with Google"}</span>
            </button>

            {error && (
                <p style={{ color: "#ff6b6b", marginTop: "10px" }}>
                    {error}
                </p>
            )}
        </>
    );
}

export default GoogleButton;