import React, { useState, useEffect } from "react";
import { Container, Row, Col, Accordion, Spinner } from "react-bootstrap";
import { FaQuestionCircle } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import instance from "../../../utils/axios";

function Faq() {
  const [faqData, setFaqData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        const response = await instance.get("/faq");
        setFaqData(response.data || []);
      } catch (error) {
        console.error("Gagal mengambil data FAQ:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqData();

    AOS.init({
      duration: 850,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  if (isLoading) {
    return (
      <section id="faq" className="faq d-flex align-items-center py-5">
        <Container>
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section id="faq" className="faq d-flex align-items-center py-5">
      <div className="container">
        <Container>
          <Row className="mb-5">
            <Col>
              <h2
                className="section-title text-center"
                data-aos="fade-up"
              >
                Frequently Asked Questions
              </h2>
              <p
                className="section-subtitle text-center mb-3"
                data-aos="fade-up"
              >
                "Pertanyaan yang Sering Ditanyakan"
              </p>
            </Col>
          </Row>
          <Row className="row-cols-1 g-4">
            <Col>
              {faqData.length > 0 ? (
                <Accordion defaultActiveKey="0">
                  {faqData.map((faq, index) => (
                    <Accordion.Item
                      key={faq._id || index}
                      eventKey={index.toString()}
                      data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                    >
                      <Accordion.Header style={{ backgroundColor: "rgba(209, 209, 209, 0.95)" }}>
                        <FaQuestionCircle className="me-2" />
                        {faq.question}
                      </Accordion.Header>
                      <Accordion.Body>{faq.answer}</Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center">
                  Belum ada pertanyaan yang sering ditanyakan.
                </p>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </section>
  );
}

export default Faq;
