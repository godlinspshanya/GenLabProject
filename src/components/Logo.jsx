import "./Logo.css";
import logo from "../assets/zion logo.png";
function Logo() {
    return (
        <div className="logo">
            <img
                src={logo}
                alt="Company Logo"
            />
        </div>
    );
}

export default Logo;