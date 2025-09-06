import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../AppContext";
import { Container, Row, Col, Card, Button, Modal } from "react-bootstrap";
import { Link } from "react-router-dom"; // Impor Link untuk navigasi

const Donation = () => {
  const { data } = useContext(AppContext);
  const [showFullscreen, setShowFullscreen] = useState(false);
  // 1. State baru untuk mengontrol visibilitas tombol "Sudah Berdonasi"
  const [showThanksButton, setShowThanksButton] = useState(false);

  // 2. useEffect untuk menampilkan tombol setelah 12 detik
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowThanksButton(true);
    }, 17000); // 17 detik

    return () => clearTimeout(timer);
  }, []);

  const handleCloseFullscreen = () => setShowFullscreen(false);
  const handleShowFullscreen = () => setShowFullscreen(true);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/QRIS_Dadi-Bara.jpg"; // Menambahkan path ke file gambar
    link.download = "QRIS_Donasi_DADI_BARA.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <section id="donation" className="d-flex py-5 align-items-center justify-content-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="text-center shadow-lg">
                <Card.Header>
                  <h2 className="section-title mb-0">Donasi Karang Taruna</h2>
                </Card.Header>
                <Card.Body>
                  <Card.Title className="SF-UIDisplay fw-bold text-uppercase">
                    KARTAR {data.namaOrganisasi}
                  </Card.Title>
                  <p className="text-muted">
                    Scan QR Code di bawah ini menggunakan aplikasi perbankan
                    atau e-wallet Anda untuk berdonasi.
                  </p>
                  <figure className="my-4">
                    <img
                      src="https://res.cloudinary.com/dr7olcn4r/image/upload/v1754792131/QRIS_Dadi-Bara_d5s5c8.jpg"
                      alt="QRIS Donasi Karang Taruna DADI BARA"
                      className="img-fluid rounded-4 shadow"
                      style={{
                        maxWidth: "100%", 
                        height: "auto", 
                        cursor: "pointer",
                      }}
                      onClick={handleShowFullscreen}
                    />
                  </figure>
                  <p className="fw-bold SF-UIDisplay">SATU QRIS UNTUK SEMUA</p>
                  <small className="text-muted">
                    Terima kasih atas dukungan Anda untuk memajukan kegiatan
                    kepemudaan di Desa Bejalen.
                  </small>
                </Card.Body>
                <Card.Footer>
                  {/* 5. Tombol-tombol diperbarui */}
                  <div className="d-flex justify-content-center gap-3">
                    <Button
                      variant="primary"
                      onClick={handleDownload}
                      className="w-50"
                    >
                      Unduh QRIS
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleShowFullscreen}
                      className="w-50"
                    >
                      Layar Penuh
                    </Button>
                  </div>

                  {showThanksButton && (
                    <Button
                      variant="success"
                      as="a"
                      href="/"
                      className="w-100 mt-3 text-white"
                    >
                      Saya sudah berdonasi
                    </Button>
                  )}
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <Modal
        show={showFullscreen}
        onHide={handleCloseFullscreen}
        centered
        size="lg"
        className="shadow"
      >
        <Modal.Header closeButton>
          <Modal.Title className="section-title">QRIS Donasi</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img
            src="https://res.cloudinary.com/dr7olcn4r/image/upload/v1754792131/QRIS_Dadi-Bara_d5s5c8.jpg"
            alt="QRIS Donasi Karang Taruna DADI BARA"
            className="img-fluid rounded-5 shadow-sm"
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Donation;
