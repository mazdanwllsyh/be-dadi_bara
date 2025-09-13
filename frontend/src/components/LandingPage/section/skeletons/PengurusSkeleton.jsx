import React from "react";
import { Container } from "react-bootstrap";

const PengurusSkeleton = () => {
  const renderCards = (count, size = "large") => {
    const boxClass = size === "large" ? "box box-1" : "box box-2";
    const colClass =
      size === "large" ? "col-12 col-md-6" : "col-12 col-sm-6 col-lg-3";

    return [...Array(count)].map((_, i) => (
      <div key={i} className={`${colClass} item`}>
        <div className={`${boxClass} placeholder`}></div>
      </div>
    ));
  };

  return (
    <section
      className="team-grid d-flex align-items-center placeholder-glow"
      style={{ minHeight: "100vh" }}
    >
      <Container className="py-5">
        <div className="intro">
          <h2 className="section-title text-center placeholder col-5 mx-auto"></h2>
          <p className="section-subtitle text-center placeholder col-7 mx-auto"></p>
          <div className="py-3 mt-3">
            <div
              className="placeholder mx-auto w-100 w-md-75"
              style={{
                height: "58px",
                borderRadius: "var(--bs-border-radius)",
              }}
            ></div>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1">
            <h5 className="text-custom text-center fw-bold placeholder col-3 mx-auto"></h5>
            <div className="row people row-cols-1 row-cols-md-2 justify-content-center">
              {renderCards(2, "large")}
            </div>
          </div>

          <div className="mb-1 mt-4">
            <h5 className="text-custom text-center fw-bold placeholder col-4 mx-auto"></h5>
            <div className="row people row-cols-1 row-cols-sm-2 row-cols-lg-4 justify-content-center">
              {renderCards(4, "small")}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default PengurusSkeleton;
