import React from "react";
import { Container } from "react-bootstrap";

const SKSkeleton = () => {
  return (
    <section id="sk-dadibara-skeleton" className="placeholder-glow">
      <Container className="my-5">
        <h2 className="section-title text-center mb-3 placeholder col-5 mx-auto"></h2>

        <p className="section-subtitle text-center mb-3 placeholder col-7 mx-auto"></p>

        <div
          className="placeholder w-100"
          style={{
            border: "1px solid #ddd",
            height: "1000px",
            borderRadius: "var(--bs-border-radius)",
          }}
        ></div>
      </Container>
    </section>
  );
};

export default SKSkeleton;
