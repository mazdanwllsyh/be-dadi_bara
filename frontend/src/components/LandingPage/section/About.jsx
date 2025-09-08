import React, { useEffect, useContext, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Spinner,
  Carousel,
  Image,
  Button,
} from "react-bootstrap";
import AOS from "aos";
import "aos/dist/aos.css";
import { AppContext } from "../AppContext";
import { toast } from "react-toastify";
import instance from "../../../utils/axios.js";

const About = () => {
  const { data } = useContext(AppContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [images, setImages] = useState([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await instance.get("/gallery");
        const allImages = response.data || [];

        if (allImages.length > 0) {
          let shuffled = [...allImages];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }

          const randomSixImages = shuffled.slice(0, 6);
          setImages(randomSixImages);
        }
      } catch (error) {
        toast.error("Gagal memuat gambar galeri.");
        setImages([]);
      } finally {
        setIsGalleryLoading(false);
      }
    };
    fetchImages();

    AOS.init({
      duration: 1090,
      easing: "ease-in-out",
      once: false,
    });
  }, []);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const aboutUsParagraphs = Array.isArray(data.aboutUsParagraphs)
    ? data.aboutUsParagraphs
    : [];
  const initialParagraphs = aboutUsParagraphs.slice(0, 2);
  const expandedParagraphs = aboutUsParagraphs.slice(2);

  const isDataLoading = isGalleryLoading || !data.namaOrganisasi;

  if (isDataLoading) {
    return (
      <section id="about" className="py-5">
        <Container>
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section id="about" className="aboutus py-5 mt-4">
      <Container>
        <h3 className="section-title mt-5 mb-4 text-center" data-aos="fade-up">
          Tentang Kami
        </h3>
        <Row className="gx-5">
          <Col xs={12} md={6} data-aos="fade-right">
            {images.length > 0 ? (
              <Carousel
                className="carousel-light"
                interval={3780}
                controls
                indicators
              >
                {images.map((image) => (
                  <Carousel.Item key={image._id}>
                    <Image
                      src={image.src}
                      className="d-block mx-auto w-100 h-100 object-fit-cover border border-3 mb-4"
                      alt={image.title}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <p className="text-center">Belum ada gambar yang tersedia.</p>
            )}
          </Col>

          <Col
            xs={12}
            md={6}
            className="align-self-center"
            data-aos="fade-left"
          >
            {initialParagraphs.map((paragraph, index) => (
              <p key={`initial-${index}`} className="text-about-us mb-4">
                {paragraph}
              </p>
            ))}
            {isExpanded &&
              expandedParagraphs.map((paragraph, index) => (
                <p key={`expanded-${index}`} className="text-about-us mb-4">
                  {paragraph}
                </p>
              ))}
            {aboutUsParagraphs.length > 2 && (
              <Button
                onClick={toggleExpand}
                className="btn-link section-subtitle float-end fw-bold border-0"
              >
                {isExpanded ? "...Tutup" : "Baca Selengkapnya..."}
              </Button>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default About;
