import React, { useEffect, useContext, useState } from "react";
import { Container, Row, Col, Table, Spinner } from "react-bootstrap";
import AOS from "aos";
import "aos/dist/aos.css";
import { AppContext } from "../AppContext";
import instance from "../../../utils/axios.js";

const JadwalKegiatan = () => {
  const { data } = useContext(AppContext);

  const [kegiatan, setKegiatan] = useState([]);
  const [displayedKegiatan, setDisplayedKegiatan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJadwal = async () => {
      try {
        const response = await instance.get("/jadwal-kegiatan");
        setKegiatan(response.data || []);
      } catch (error) {
        console.error("Gagal mengambil data jadwal:", error);
        setKegiatan([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJadwal();
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 750,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  const formatTanggalIndonesia = (tanggalISO) => {
    const date = new Date(tanggalISO);
    if (isNaN(date)) {
      return "Tanggal tidak valid";
    }
    const options = {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("id-ID", options);
  };

  useEffect(() => {
    if (kegiatan.length > 0) {
      const sortedKegiatan = [...kegiatan].sort(
        (a, b) => new Date(a.tanggal) - new Date(b.tanggal)
      );

      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(today.getDate() - 3);

      const fourteenDaysLater = new Date(today);
      fourteenDaysLater.setDate(today.getDate() + 14);

      const filtered = sortedKegiatan.filter((item) => {
        const eventDate = new Date(item.tanggal);
        return eventDate >= threeDaysAgo && eventDate <= fourteenDaysLater;
      });

      setDisplayedKegiatan(filtered);
    } else {
      setDisplayedKegiatan([]);
    }
  }, [kegiatan]);

  if (isLoading) {
    return (
      <section
        id="jadwal"
        className="jadwal-kegiatan py-5 d-flex align-items-center justify-content-center"
      >
        <Container>
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      id="jadwal"
      className="jadwal-kegiatan py-5 d-flex align-items-center justify-content-center"
    >
      <Container>
        <Row className="text-center mb-4" data-aos="fade-down">
          <Col>
            <h2 className="section-title">
              Jadwal Kegiatan {data.namaOrganisasi}
            </h2>
            <p className="section-subtitle text-center justify-content-center mb-3 opacity-50">
              {displayedKegiatan.length > 0
                ? `Berikut kegiatan Karang Taruna ${data.namaOrganisasi}`
                : `Belum ada kegiatan untuk ${data.namaOrganisasi}`}
            </p>
          </Col>
        </Row>

        {displayedKegiatan.length > 0 ? (
          <Row className="justify-content-center">
            <Col lg={10}>
              <Table
                striped="columns"
                bordered
                responsive
                className="table-jadwal"
                data-aos="zoom-in"
              >
                <thead>
                  <tr>
                    <th>Nama Kegiatan</th>
                    <th>Tempat</th>
                    <th>Tanggal Kegiatan</th>
                    <th>Waktu</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedKegiatan.map((item) => (
                    <tr key={item._id}>
                      <td>{item.nama}</td>
                      <td>{item.tempat}</td>
                      <td>{formatTanggalIndonesia(item.tanggal)}</td>
                      <td>{item.waktu} WIB</td>
                      <td>{item.keterangan}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <p
                className="small text-center text-custom text-mute my-3"
                data-aos="flip-down"
              >
                *jadwal yang ditampilkan
                <br />{" "}
                <strong>3 hari sesudah sampai 14 hari yang akan datang</strong>
              </p>
            </Col>
          </Row>
        ) : (
          <Row className="justify-content-center" data-aos="flip-up">
            <Col xs="auto">
              {" "}
              <p className="text-center text-code">Belum ada kegiatan yang dijadwalkan dalam waktu dekat ini.</p>
            </Col>
          </Row>
        )}
      </Container>
    </section>
  );
};

export default JadwalKegiatan;
