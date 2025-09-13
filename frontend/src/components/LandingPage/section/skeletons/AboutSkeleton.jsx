import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const AboutSkeleton = () => (
  <section className="aboutus py-5 mt-4 placeholder-glow">
    <Container>
      <h3 className="section-title mt-5 mb-4 text-center placeholder col-4 mx-auto"></h3>
      <Row className="gx-5">
        <Col xs={12} md={6}>
          {/* Skeleton untuk Carousel */}
          <div
            className="placeholder w-100"
            style={{ height: "400px", borderRadius: "var(--bs-border-radius)" }}
          ></div>
        </Col>
        <Col xs={12} md={6} className="align-self-center">
          {/* Skeleton untuk Paragraf */}
          <p className="mb-4">
            <span className="placeholder col-12"></span>
            <span className="placeholder col-10"></span>
            <span className="placeholder col-11"></span>
          </p>
          <p>
            <span className="placeholder col-12"></span>
            <span className="placeholder col-8"></span>
          </p>
        </Col>
      </Row>
    </Container>
  </section>
);

export default AboutSkeleton;
