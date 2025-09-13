import React, { useState, useRef, useEffect } from "react";

const LazySection = ({ children, minHeight = "100vh" }) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const placeholderRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: "0px 0px 200px 0px", // Mulai load saat 200px sebelum masuk viewport
      }
    );

    const currentRef = placeholderRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={placeholderRef}
      style={{ minHeight: !isIntersecting ? minHeight : "auto" }}
    >
      {isIntersecting && children}
    </div>
  );
};

export default LazySection;
