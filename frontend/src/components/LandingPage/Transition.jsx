import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "./AppContext";

const Transition = ({ onTransitionEnd, isLoading = false }) => {
  const { data } = useContext(AppContext);
  const [animationClass, setAnimationClass] = useState("zoom-in");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setAnimationClass((prevClass) =>
          prevClass === "zoom-in" ? "zoom-out" : "zoom-in"
        );
      }, 1000);
      return () => clearInterval(interval);
    } else {
      const zoomInTimeout = setTimeout(() => {
        setAnimationClass("zoom-out");
      }, 800);

      const zoomOutTimeout = setTimeout(() => {
        setAnimationClass("fade-out");
      }, 1900);

      const fadeOutTimeout = setTimeout(() => {
        setIsVisible(false);
        if (onTransitionEnd) {
          onTransitionEnd();
        }
      }, 2700);

      return () => {
        clearTimeout(zoomInTimeout);
        clearTimeout(zoomOutTimeout);
        clearTimeout(fadeOutTimeout);
      };
    }
  }, [isLoading, onTransitionEnd]);

  return (
    isVisible && (
      <div className={`transition-overlay ${animationClass}`}>
        <div className="transition-image-container">
          <img
            src={
              data?.logoDadiBara ||
              "https://github.com/mazdanwllsyh/dadibara/blob/main/assets/Logo.png?raw=true"
            }
            alt="Logo"
            className="transition-image"
          />
        </div>
      </div>
    )
  );
};

export default Transition;
