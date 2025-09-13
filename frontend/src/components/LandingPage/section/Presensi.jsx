import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { UserContext } from "../UserContext";
import { toast } from "react-toastify";
import instance from "../../../utils/axios";
import { useNavigate, useLocation } from "react-router-dom";

const Presensi = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [kegiatanList, setKegiatanList] = useState([]);
  const [pengurusList, setPengurusList] = useState([]);
  const [selectedKegiatan, setSelectedKegiatan] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [namaLengkap, setNamaLengkap] = useState("");
  const [namaTerverifikasi, setNamaTerverifikasi] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");

  const [isPresensiOpen, setIsPresensiOpen] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [kegiatanRes, pengurusRes] = await Promise.all([
          instance.get("/jadwal-kegiatan"),
          instance.get("/members"),
        ]);

        const sortedKegiatan = (kegiatanRes.data || []).sort((a, b) => {
          const dateTimeB = new Date(
            `${b.tanggal.substring(0, 10)}T${b.waktu}`
          );
          const dateTimeA = new Date(
            `${a.tanggal.substring(0, 10)}T${a.waktu}`
          );
          return dateTimeB - dateTimeA;
        });

        const latestKegiatan = sortedKegiatan.slice(0, 6);
        setKegiatanList(latestKegiatan);
        setPengurusList(pengurusRes.data || []);
      } catch (error) {
        toast.error("Gagal memuat data awal.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedKegiatan) {
      setIsPresensiOpen(false);
      setCountdown("");
      return;
    }
    const kegiatan = kegiatanList.find((k) => k._id === selectedKegiatan);
    if (!kegiatan) return;

    const [tahun, bulan, tanggal] = kegiatan.tanggal
      .substring(0, 10)
      .split("-")
      .map(Number);
    const [jam, menit] = kegiatan.waktu.split(":").map(Number);
    const waktuMulai = new Date(tahun, bulan - 1, tanggal, jam, menit);

    const waktuBukaPresensi = waktuMulai;
    const waktuTutupPresensi = new Date(
      waktuMulai.getTime() + 24 * 60 * 60 * 1000
    );

    let interval;
    const updateCountdown = () => {
      const now = new Date();
      if (now >= waktuBukaPresensi && now <= waktuTutupPresensi) {
        setIsPresensiOpen(true);
        setCountdown("");
        if (interval) clearInterval(interval);
      } else if (now < waktuBukaPresensi) {
        setIsPresensiOpen(false);
        const diff = waktuBukaPresensi - now;
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setCountdown(
          `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
            .toString()
            .padStart(2, "0")}`
        );
      } else {
        setIsPresensiOpen(false);
        setCountdown("Waktu presensi sudah berakhir.");
        if (interval) clearInterval(interval);
      }
    };

    updateCountdown();
    interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [selectedKegiatan, kegiatanList]);

  const handleEmailClick = () => {
    if (!user) {
      navigate("/login", { state: { background: location } });
    }
  };

  const jabatan = useMemo(() => {
    const trimmedNama = namaLengkap.trim();
    if (!trimmedNama) {
      setNamaTerverifikasi("");
      return "";
    }
    const inputNamaLower = trimmedNama.toLowerCase();
    const inputWords = inputNamaLower.split(/\s+/);

    let bestMatch = null;
    let highestScore = 0;

    pengurusList.forEach((pengurus) => {
      const namaLower = pengurus.nama.toLowerCase();
      if (namaLower === inputNamaLower) {
        bestMatch = pengurus;
        highestScore = 100;
        return;
      }
      if (highestScore === 100) return;

      const pengurusWords = namaLower.split(/\s+/);
      let currentScore = 0;
      inputWords.forEach((inputWord) => {
        if (
          pengurusWords.some((pengurusWord) =>
            pengurusWord.startsWith(inputWord)
          )
        ) {
          currentScore++;
        }
      });
      if (currentScore > highestScore) {
        highestScore = currentScore;
        bestMatch = pengurus;
      }
    });

    if (bestMatch) {
      setNamaTerverifikasi(bestMatch.nama);
      return bestMatch.titleLabel;
    } else {
      setNamaTerverifikasi("");
      return "Anggota";
    }
  }, [namaLengkap, pengurusList]);

  useEffect(() => {
    if (user) {
      setNamaLengkap(user.fullName || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (konfirmasi.trim().toLowerCase() !== "hadir") {
      return toast.warn('Harap ketik "HADIR" dengan benar untuk konfirmasi.');
    }
    setIsSubmitting(true);
    try {
      const presensiData = {
        kegiatanId: selectedKegiatan,
        nama: namaTerverifikasi || namaLengkap,
        email: user?.email,
        jabatan: jabatan,
      };
      await instance.post("/presensi", presensiData, { withCredentials: true });
      toast.success(
        `Terima kasih, ${
          namaTerverifikasi || namaLengkap
        }. Kehadiran Anda telah dicatat!`
      );
      setSelectedKegiatan("");
      setKonfirmasi("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengirim presensi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section
        id="userprofile"
        className="d-flex justify-content-center align-items-center vh-100"
      >
        <Container className="my-2">
          <Card className="shadow p-4 placeholder-glow">
            <Card.Header className="border-0 text-center">
              <h2 className="placeholder col-6 mb-0"></h2>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="my-2">
                <span
                  className="placeholder col-12 mb-2"
                  style={{ height: "38px" }}
                ></span>
                <span
                  className="placeholder col-12 mb-2"
                  style={{ height: "38px" }}
                ></span>
                <span
                  className="placeholder col-12"
                  style={{ height: "38px" }}
                ></span>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </section>
    );
  }

  if (user && (user.role === "admin" || user.role === "superAdmin")) {
    return (
      <section
        id="admin-warning"
        className="d-flex justify-content-center align-items-center vh-100"
      >
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="text-center shadow p-4">
                <Card.Body>
                  <Alert variant="warning">
                    <Alert.Heading
                      as="h3"
                      className="text-danger section-title"
                    >
                      Perhatian untuk{" "}
                      {user.role === "superAdmin" ? "Super Admin" : "Admin"}
                    </Alert.Heading>
                    <p>
                      Halaman ini ditujukan untuk presensi anggota. Mohon
                      gunakan email pribadi Anda untuk melakukan presensi.
                    </p>
                    <hr />
                    <p className="mb-0">Terima kasih.</p>
                  </Alert>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate("/admin")}
                  >
                    Kembali ke Dashboard
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    );
  }

  return (
    <section
      id="userprofile"
      className="d-flex justify-content-center align-items-center vh-100"
    >
      <Container className="my-2">
        <Card className="shadow p-4">
          <Card.Header className="border-0 text-center">
            <h2 className="section-title mb-0">Formulir Presensi Kegiatan</h2>
          </Card.Header>
          <Card.Body className="p-0">
            <Form onSubmit={handleSubmit} className="my-2">
              <Form.Group className="mb-3">
                <Form.Label>*Pilih Kegiatan</Form.Label>
                <Form.Select
                  value={selectedKegiatan}
                  onChange={(e) => setSelectedKegiatan(e.target.value)}
                  required
                  className="form-select text-center"
                >
                  <option value="" disabled>
                    -- Pilih Kegiatan yang Akan Diikuti --
                  </option>
                  {kegiatanList.map((k) => (
                    <option key={k._id} value={k._id}>
                      {k.nama} - (
                      {new Date(k.tanggal).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                      )
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {selectedKegiatan && (isPresensiOpen || countdown) && (
                <>
                  <hr />
                  <Row>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>*Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={user?.email || ""}
                          placeholder={!user ? "Klik di sini untuk Login" : ""}
                          readOnly
                          onClick={handleEmailClick}
                          style={{
                            cursor: user ? "not-allowed" : "pointer",
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>*Nama Lengkap/Asli</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Masukkan nama lengkap Anda..."
                          value={namaLengkap}
                          onChange={(e) => setNamaLengkap(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          *Jabatan Terverifikasi (Otomatis Terisi)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={jabatan || "Isi Nama Anda dengan Benar"}
                          readOnly
                          style={{
                            cursor: "not-allowed",
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>*Konfirmasi Kehadiran</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder='Ketik "HADIR"'
                          value={konfirmasi}
                          onChange={(e) => setKonfirmasi(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="text-center mt-4">
                    {isPresensiOpen ? (
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-50"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Spinner size="sm" /> : "HADIR"}
                      </Button>
                    ) : (
                      <Alert variant="warning">
                        {countdown.includes(":")
                          ? `Presensi akan terbuka dalam: ${countdown}`
                          : countdown}
                      </Alert>
                    )}
                  </div>
                </>
              )}
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </section>
  );
};

export default Presensi;
