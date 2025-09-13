import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const ContactUsSkeleton = () => (
  <section className="py-5 d-flex align-items-center placeholder-glow">
    <Container>
      <Row className="g-4 justify-content-center">
        <Col md={6}>
          <h2 className="section-title placeholder col-5"></h2>
          {/* Skeleton untuk Form */}
          <div className="placeholder mb-3" style={{ height: "58px" }}></div>
          <div className="placeholder mb-3" style={{ height: "58px" }}></div>
          <div className="placeholder mb-3" style={{ height: "150px" }}></div>
          <div className="placeholder" style={{ height: "40px" }}></div>
        </Col>
        <Col md={6}>
          <h2 className="section-title placeholder col-5"></h2>
          {/* Skeleton untuk Peta */}
          <div className="placeholder" style={{ height: "450px" }}></div>
        </Col>
      </Row>
    </Container>
  </section>
);

export default ContactUsSkeleton;
