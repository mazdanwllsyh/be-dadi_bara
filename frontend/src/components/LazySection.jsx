import React, { useState, useRef, useEffect, Suspense } from "react";
import { Spinner } from "react-bootstrap";

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
        rootMargin: "0px 0px 200px 0px",
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
      {isIntersecting && (
        <Suspense
          fallback={
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight }}
            >
              <Spinner animation="border" />
            </div>
          }
        >
          {children}
        </Suspense>
      )}
    </div>
  );
};

export default LazySection;
