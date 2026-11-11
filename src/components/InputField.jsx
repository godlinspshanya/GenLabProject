import "./InputField.css";

function InputField({ email, setEmail }) {
    return (
        <input
            type="email"
            className="email-input"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />
    );
}

export default InputField;