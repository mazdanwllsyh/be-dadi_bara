import React, { useEffect, useContext, useState } from "react";
import { Row, Col, Button } from "react-bootstrap";
import AOS from "aos";
import "aos/dist/aos.css";
import { Helmet } from "react-helmet-async";
import { AppContext } from "../AppContext";

const Home = () => {
  const { data } = useContext(AppContext);

  const optimizedLogoUrl =
    "https://res.cloudinary.com/dr7olcn4r/image/upload/w_600,h_600,c_fill/v1757167793/logos/logo_organisasi.webp";

  const [showPengurusButton, setShowPengurusButton] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    AOS.init({
      duration: 1750,
      easing: "ease-in-out",
      once: false,
    });
    AOS.refresh();

    const scrollTimeout = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 49800);

    const showButtonTimeout = setTimeout(() => {
      setShowPengurusButton(true);
    }, 29900);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(scrollTimeout);
      clearTimeout(showButtonTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section id="home" className="hero-section d-flex align-items-center">
      <Helmet>
        <title>Beranda | Karang Taruna Desa Bejalen</title>
        <meta
          name="description"
          content="Karang Taruna Dadi Bara - Organisasi bersama dalam mengembangkan kesejahteraan sosial di Bejalen, Ambarawa."
        />
        <link rel="canonical" href="https://dadibara.bejalen.com/" />

        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Karang Taruna DADI BARA",
              "url": "https://dadibara.bejalen.com/"
            }
          `}
        </script>
      </Helmet>

      <div className="container">
        <div className="row align-items-center">
          <div
            className="col-lg-6 order-lg-2 text-center"
            data-aos="slide-down"
          >
            <img
              src={optimizedLogoUrl}
              alt="Logo"
              className="img-fluid pb-4"
              width="300"
              height="300"
              fetchpriority="high"
            />
          </div>
          <div
            className="col-lg-6 order-lg-1 align-items-center text-center"
            data-aos="fade-up"
          >
            <h3
              className="section-title fw-bold lh-2 mb-3"
              style={{ fontSize: "215%" }}
            >
              KARANG TARUNA
              <br />
              {data.namaOrganisasi}
            </h3>
            <h4 className="my-3">
              Selamat Datang
              <br />
              Di Website Karang Taruna
              <br />
              Desa Bejalen Ambarawa
              <br />
              <b>{data.tagline}</b>
            </h4>

            <div className="mt-4">
              <Row className="justify-content-center gx-3">
                {/* Tombol Pertama */}
                <Col xs={10} sm={8} md={"auto"}>
                  <Button
                    as="a"
                    href="/gallery"
                    className="btn explore-btn shadow"
                    data-aos="fade-left"
                  >
                    Jelajahi Galeri
                  </Button>
                </Col>

                {isMobile && showPengurusButton && (
                  <Col xs={10} sm={8} md={"auto"} className="mt-2 mt-md-0">
                    <a
                      href="/pengurus"
                      className="btn explore-btn shadow"
                      data-aos="fade-right"
                    >
                      Lihat Pengurus
                    </a>
                  </Col>
                )}
              </Row>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
