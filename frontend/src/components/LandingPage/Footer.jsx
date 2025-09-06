import React, { useContext } from "react";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import { Container, Row, Col } from "react-bootstrap";
import { AppContext } from "./AppContext";
import moment from "moment";

const Footer = () => {
  const { data } = useContext(AppContext); // Ambil data dari context

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="footer-dadibara" className="footer-dadibara text-dark py-4">
      <Container>
        <Row className="align-items-center text-center">
          <Col xs={12} className="d-md-none">
            <img
              src={data.logoDadiBara}
              alt="Logo"
              width="80"
              height="auto"
              style={{ cursor: "pointer" }}
              onClick={scrollToTop}
              className="mb-2"
            />
            <img
              src={data.logoDesaBaru}
              alt="LogoDesa"
              width="80"
              height="80"
              className="mb-2 ms-2"
            />
          </Col>

          {/* Tagline dan Sosial Media */}
          <Col xs={12} md={4} className="text-center order-md-2">
            <p className="fw-bold mb-0">{data.tagline}</p>
            <p className="mb-0">
              <a
                href="https://maps.app.goo.gl/AQ2GP9iUVEaS7Eyj6"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                Desa Bejalen, Kec. Ambarawa, Kab. Semarang 50614
              </a>
            </p>
            <div className="d-flex justify-content-center">
              <a
                href="https://www.instagram.com/kartar.dadibara/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none social-icon me-2"
                aria-label="Instagram Karang Taruna Dadi Bara"
              >
                <FaInstagram size={25} />
              </a>
              <a
                href="https://www.tiktok.com/@kartar.desabejalen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none social-icon me-2"
                aria-label="TikTok Karang Taruna Dadi Bara"
              >
                <FaTiktok size={25} />
              </a>
            </div>
          </Col>

          <Col md={4} className="d-none d-md-block order-md-1 text-center">
            <img
              src={data.logoDadiBara}
              alt="Logo"
              width="80"
              height="auto"
              style={{ cursor: "pointer" }}
              onClick={scrollToTop}
            />
          </Col>
          <Col md={4} className="d-none d-md-block order-md-3 text-center">
            <a href="https://www.bejalen.com">
              <img
                src={data.logoDesaBaru}
                alt="LogoDesa"
                width="80"
                height="80"
              />
            </a>
          </Col>
        </Row>

        <Row>
          <Col xs={12} className="text-center">
            <hr className="bg-light custom-hr" />
            <p className="mb-0">
              © 2023 - {moment().year()} {data.namaOrganisasi}. All Rights
              Reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
