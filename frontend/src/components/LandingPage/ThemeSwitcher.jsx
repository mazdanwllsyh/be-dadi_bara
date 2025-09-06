import React, { useContext } from "react";
import { Form } from "react-bootstrap";
import { FaSun, FaMoon } from "react-icons/fa";
import { AppContext } from "./AppContext";

const ThemeSwitcher = ({ expanded = true }) => {
  const { theme, toggleTheme } = useContext(AppContext);

  return (
    <div className="theme-switcher-container p-2">
      {expanded && (
        <div className="d-flex align-items-center justify-content-center">
          <FaSun
            size={17}
            style={{ color: theme === "light" ? "#ffc107" : "#6c757d" }}
          />
          <Form.Check
            type="switch"
            id="theme-switch-expanded"
            checked={theme === "dark"}
            onChange={toggleTheme}
            className="theme-switcher-custom ps-5"
            aria-label="Ganti tema gelap atau terang"
          />
          <FaMoon
            size={14}
            style={{ color: theme === "dark" ? "#63C7B1FF" : "#6c757d" }}
          />
        </div>
      )}

      {!expanded && (
        <div className="d-flex flex-column align-items-center">
          <Form.Check
            type="switch"
            id="theme-switch-collapsed"
            checked={theme === "dark"}
            onChange={toggleTheme}
            className="theme-switcher-custom ps-5"
          />
          <span
            className="mt-1 fw-bold SF-UIDisplay"
            style={{
              fontSize: "10px",
              color: "var(--bs-secondary-color)",
              letterSpacing: "0.5px",
            }}
          >
            {theme === "light" ? "TERANG" : "GELAP"}
          </span>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
