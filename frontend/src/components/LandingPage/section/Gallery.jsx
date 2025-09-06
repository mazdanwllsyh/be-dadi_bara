import React, { useState, useEffect, useContext, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Form,
  Pagination,
} from "react-bootstrap";
import AOS from "aos";
import "aos/dist/aos.css";
import { AppContext } from "../AppContext";
import { toast } from "react-toastify";
import instance from "../../../utils/axios.js";
import { usePagination, DOTS } from "../../usePagination.jsx";
import Testimonials from "./Testimonials";

const shuffleArray = (array) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

const Gallery = () => {
  const { data } = useContext(AppContext);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 2 : 6);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setItemsPerPage(3); 
      } else if (width < 992) {
        setItemsPerPage(4); 
      } else {
        setItemsPerPage(6); 
      }
    };

    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      try {
        const response = await instance.get("/gallery");
        // Langsung acak gambar setelah berhasil di-fetch
        setImages(shuffleArray(response.data || []));
      } catch (error) {
        toast.error("Gagal memuat gambar galeri.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();

    AOS.init({
      duration: 1200,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  const filteredImages = useMemo(() => {
    return images.filter(
      (image) =>
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (image.description &&
          image.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, images]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const paginationRange = usePagination({
    currentPage,
    totalCount: filteredImages.length,
    siblingCount: 1,
    pageSize: itemsPerPage,
  });

  const currentImages = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * itemsPerPage;
    const lastPageIndex = firstPageIndex + itemsPerPage;
    return filteredImages.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredImages, itemsPerPage]);

  const getAnimation = (index) => {
    const animations = [
      "fade-up",
      "fade-down",
      "fade-right",
      "fade-left",
      "zoom-in",
      "zoom-out",
    ];
    return animations[index % animations.length];
  };

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container>
      <section id="gallery" className="gallery-section py-5">
        <Helmet>
          <title>Galeri Kegiatan | Karang Taruna Dadi Bara</title>
          <link rel="canonical" href="https://dadibara.bejalen.com/gallery" />
          <meta
            name="description"
            content="Jelajahi dokumentasi foto dari berbagai program kerja dan acara seru yang telah diselenggarakan oleh Karang Taruna DADI BARA Bejalen dan beberapa Testimoni dari beberapa Pengguna."
          />
          <meta
            property="og:title"
            content="Galeri Kegiatan | Karang Taruna Dadi Bara"
          />
          <meta
            property="og:description"
            content="Lihat momen-momen terbaik dari kegiatan kami, mulai dari acara sosial hingga perlombaan."
          />
          <meta
            property="og:url"
            content="https://dadibara.bejalen.com/gallery"
          />
          <meta
            property="og:image"
            content="https://res.cloudinary.com/dr7olcn4r/image/upload/v1754892337/karang-taruna-uploads/p4qhg0nacmqjlp2duipu.png"
          />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Karang Taruna DADI BARA" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="Galeri Kegiatan | Karang Taruna Dadi Bara"
          />
          <meta
            name="twitter:description"
            content="Jelajahi dokumentasi foto dari berbagai program kerja dan acara seru Karang Taruna DADI BARA."
          />
          <meta
            name="twitter:image"
            content="https://res.cloudinary.com/dr7olcn4r/image/upload/v1754892337/karang-taruna-uploads/p4qhg0nacmqjlp2duipu.png"
          />
        </Helmet>
        <div className="container align-items-center">
          <h2 className="section-title text-center" data-aos="fade-up">
            Galeri {data.namaOrganisasi}
          </h2>

          <Row className="my-3 align-items-center" data-aos="zoom-in">
            <Col
              xs={12}
              md={6}
              className="order-2 order-md-1 d-flex justify-content-center justify-content-md-start"
            >
              <Pagination className="shadow-sm mb-0">
                <Pagination.Prev
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {paginationRange.map((pageNumber, index) => {
                  if (pageNumber === DOTS) {
                    return (
                      <Pagination.Ellipsis key={`dots-${index}`} disabled />
                    );
                  }
                  return (
                    <Pagination.Item
                      key={pageNumber}
                      active={pageNumber === currentPage}
                      onClick={() => paginate(pageNumber)}
                    >
                      {pageNumber}
                    </Pagination.Item>
                  );
                })}
                <Pagination.Next
                  onClick={() => paginate(currentPage + 1)}
                  disabled={
                    currentPage === paginationRange[paginationRange.length - 1]
                  }
                />
              </Pagination>
            </Col>

            <Col
              xs={12}
              md={6}
              className="order-1 order-md-2 d-flex justify-content-center justify-content-md-end mb-3 mb-md-0"
            >
              <Form.Control
                type="search"
                placeholder="Cari berdasarkan judul atau deskripsi..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="shadow w-75 w-md-auto"
              />
            </Col>
          </Row>

          <Row className="my-3 justify-content-center">
            {currentImages.length > 0 ? (
              currentImages.map((image, index) => (
                <Col
                  xs={12}
                  md={6}
                  lg={4}
                  key={image._id}
                  className="mb-4 d-flex"
                >
                  <Card
                    className="w-100 h-100 shadow gallery-card"
                    data-aos={getAnimation(index)}
                    data-aos-delay={index * 220}
                  >
                    <div
                      style={{
                        overflow: "hidden",
                        borderRadius: "var(--bs-card-inner-border-radius)",
                      }}
                    >
                      <Card.Img
                        variant="top"
                        src={image.src}
                        alt={image.title}
                        style={{ objectFit: "cover", height: "250px" }}
                      />
                    </div>
                    <Card.Body>
                      <Card.Title className="text-center text-title fw-bold">
                        {image.title}
                      </Card.Title>
                      <Card.Text
                        className="text-title"
                        style={{ textAlign: "justify", fontSize: "14px" }}
                      >
                        {image.description}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <p className="text-center">
                Tidak ada gambar yang cocok dengan pencarian Anda.
              </p>
            )}
          </Row>

          <hr
            style={{
              height: "3px",
              width: "100%",
              backgroundColor: "#ccc",
              borderRadius: "15px",
            }}
          />
          <Testimonials />
        </div>
      </section>
    </Container>
  );
};

export default Gallery;
