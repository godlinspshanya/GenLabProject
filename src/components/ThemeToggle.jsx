import { Moon, Sun } from "lucide-react";

function ThemeToggle({ theme, onChange, compact = false }) {
    return (
        <div
            className={compact ? "theme-toggle compact" : "theme-toggle"}
            role="group"
            aria-label="Theme settings"
        >
            <button
                type="button"
                className={theme === "light" ? "is-selected" : ""}
                aria-pressed={theme === "light"}
                onClick={() => onChange("light")}
            >
                <Sun size={16} />
                <span>Light</span>
            </button>
            <button
                type="button"
                className={theme === "dark" ? "is-selected" : ""}
                aria-pressed={theme === "dark"}
                onClick={() => onChange("dark")}
            >
                <Moon size={16} />
                <span>Dark</span>
            </button>
        </div>
    );
}

export default ThemeToggle;
