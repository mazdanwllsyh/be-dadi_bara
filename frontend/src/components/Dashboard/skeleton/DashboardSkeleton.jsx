import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

const DashboardSkeleton = () => {
  const renderStatCard = (index) => (
    <Col md={6} className="mb-4" key={index}>
      <Card>
        <Card.Body className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="placeholder col-4"></h2>
            <h5 className="placeholder col-8"></h5>
          </div>
          <div
            className="placeholder rounded"
            style={{ width: "50px", height: "50px" }}
          ></div>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container fluid className="my-3 placeholder-glow">
      <Row>
        <Col>
          <h2 className="section-title mb-4 placeholder col-3"></h2>
        </Col>
      </Row>

      <Row>{[...Array(4)].map((_, index) => renderStatCard(index))}</Row>

      <Row className="mt-4">
        <Col xs={12}>
          <Card>
            <Card.Body>
              <div
                className="placeholder w-100"
                style={{ height: "400px" }}
              ></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardSkeleton;
