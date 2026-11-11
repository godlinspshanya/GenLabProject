import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import GoogleButton from "../components/GoogleButton";
import Divider from "../components/Divider";
import InputField from "../components/InputField";

import "./Login.css";

import "./Login.css";

function Login() {

    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const handleSubmit = (e) => {
    e.preventDefault();

    navigate("/verify-otp", {
        state: {
            email: email,
            purpose: "login"
        }
    });
};

    return (
        <div className="login-page">

            <div className="login-content">

                <Logo />

                <h1>Log In to Page Flows</h1>

                <GoogleButton />

                <Divider />

                <form onSubmit={handleSubmit}>

                    <InputField
                        email={email}
                        setEmail={setEmail}
                    />

                    <button
                        type="submit"
                        className="continue-button"
                    >
                        Continue
                    </button>

                </form>

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