import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const FAQSkeleton = () => (
  <section className="faq d-flex align-items-center py-5 placeholder-glow">
    <Container>
      <h2 className="section-title text-center placeholder col-6 mx-auto"></h2>
      <p className="section-subtitle text-center placeholder col-8 mx-auto mb-5"></p>
      <Row className="justify-content-center">
        <Col lg={8}>
          <div className="placeholder mb-2" style={{ height: "50px" }}></div>
          <div className="placeholder mb-2" style={{ height: "50px" }}></div>
          <div className="placeholder" style={{ height: "50px" }}></div>
        </Col>
      </Row>
    </Container>
  </section>
);

export default FAQSkeleton;
