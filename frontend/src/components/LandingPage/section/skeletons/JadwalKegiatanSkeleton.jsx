import React from "react";
import { Container, Row, Col, Table } from "react-bootstrap";

const JadwalKegiatanSkeleton = () => (
  <section className="jadwal-kegiatan py-5 placeholder-glow">
    <Container>
      <h2 className="section-title text-center placeholder col-5 mx-auto"></h2>
      <p className="section-subtitle text-center placeholder col-7 mx-auto"></p>
      <Row className="justify-content-center mt-4">
        <Col lg={10}>
          <Table striped="columns" bordered responsive>
            <thead>
              <tr>
                <th>
                  <span className="placeholder col-12"></span>
                </th>
                <th>
                  <span className="placeholder col-12"></span>
                </th>
                <th>
                  <span className="placeholder col-12"></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, i) => (
                <tr key={i}>
                  <td>
                    <span className="placeholder col-10"></span>
                  </td>
                  <td>
                    <span className="placeholder col-8"></span>
                  </td>
                  <td>
                    <span className="placeholder col-11"></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  </section>
);

export default JadwalKegiatanSkeleton;
