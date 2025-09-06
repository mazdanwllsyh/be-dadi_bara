import React, { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../LandingPage/UserContext";
import { AppContext } from "../LandingPage/AppContext";
import Draggable from "react-draggable";
import { FaHourglassHalf } from "react-icons/fa";

const SessionTimer = () => {
  const { user } = useContext(UserContext);
  const { theme } = useContext(AppContext);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpiring, setIsExpiring] = useState(false); 
  const [isBlinking, setIsBlinking] = useState(false); 
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const nodeRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "superAdmin")) {
      setTimeLeft(null);
      return;
    }

    const expirationTime = localStorage.getItem("sessionExpiresAt");
    if (!expirationTime) {
      setTimeLeft(null);
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = parseInt(expirationTime, 10) - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("Sesi Habis, Mulai Ulang Halaman Anda!");
        setIsExpiring(true);
        setIsBlinking(false); 
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const totalSecondsLeft = Math.floor(distance / 1000);

      if (minutes < 5) setIsExpiring(true);
      else setIsExpiring(false);

      if (totalSecondsLeft <= 150) setIsBlinking(true);
      else setIsBlinking(false);

      setTimeLeft(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  if (timeLeft === null) {
    return null;
  }

  const timerStyle = {
    position: "fixed",
    backgroundColor: isExpiring
      ? "rgba(220, 53, 69, 0.9)"
      : theme === "dark"
      ? "rgba(0, 0, 0, 0.75)"
      : "darkcyan",
    color: "white",
    padding: "10px 15px",
    borderRadius: "10px",
    fontSize: "0.85rem",
    zIndex: 1051,
    display: "flex",
    alignItems: "center",
    cursor: "move",
    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
    transition: "background-color 0.5s ease",
    ...(isMobile
      ? { top: "100px", left: "20px", transform: "translateX(-50%)" }
      : { top: "20px", right: "20px" }),
  };

  return (
    <Draggable nodeRef={nodeRef}>
      <div
        ref={nodeRef}
        className={`session-timer-draggable ${
          isBlinking ? "blinking-effect" : ""
        }`}
        style={timerStyle}
      >
        <FaHourglassHalf
          className={`me-2 ${isExpiring ? "spinning-icon" : ""}`}
        />
        <b className="ms-1">{timeLeft}</b>
      </div>
    </Draggable>
  );
};

export default SessionTimer;
