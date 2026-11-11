import "./GoogleButton.css";
import logo from "../assets/Google.png";

function GoogleButton() {
  return (
    <button className="google-button" type="button">
      <img src={logo} alt="Google" />
      <span>Continue with Google</span>
    </button>
  );
}

export default GoogleButton;