import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "./AppContext";

const Transition = ({ imageUrl, onTransitionEnd }) => {
  const { data } = useContext(AppContext);
  const [animationClass, setAnimationClass] = useState("");
  const [isVisible, setIsVisible] = useState(true); 

  useEffect(() => {
    if (isVisible) {
      setAnimationClass("zoom-in");
      const zoomInTimeout = setTimeout(() => {
        setAnimationClass("zoom-out");
      }, 800);

      const zoomOutTimeout = setTimeout(() => {
        setAnimationClass("fade-out");
      }, 1900);

      const fadeOutTimeout = setTimeout(() => {
        setIsVisible(false);
        onTransitionEnd();
      }, 2700);

      return () => {
        clearTimeout(zoomInTimeout);
        clearTimeout(zoomOutTimeout);
        clearTimeout(fadeOutTimeout);
      };
    } else {
      setAnimationClass(""); 
    }
  }, [isVisible, onTransitionEnd]);

  return (
    isVisible && ( 
      <div className={`transition-overlay ${animationClass}`}>
        <div className="transition-image-container">
          <img
            src={data.logoDadiBara}
            alt="Logo"
            className="transition-image"
          />
        </div>
      </div>
    )
  );
};

export default Transition;
