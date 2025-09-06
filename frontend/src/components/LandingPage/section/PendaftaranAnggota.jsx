import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Toast,
  CardHeader,
  Spinner,
  Alert,
} from "react-bootstrap";
import { AppContext } from "../AppContext";
import { UserContext } from "../UserContext.jsx";
import instance from "../../../utils/axios.js";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const PendaftaranAnggota = () => {
  const { data } = useContext(AppContext);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    phone: "",
    address: "",
    position: "",
    birthDate: "",
    education: "",
    interests: "",
  });
  const [age, setAge] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [ageError, setAgeError] = useState("");
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // State baru

  const handleEmailClick = () => {
    if (!user) {
      navigate("/login", { state: { background: location } });
    }
  };

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "Desa Bejalen, Bejalen Barat/Timur RT 00 RW 00",
        gender:
          user.gender || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      setAge(age);

      if (age < 13) {
        setAgeError("Minimal umur pendaftar adalah 13 tahun.");
      } else if (age > 45) {
        setAgeError("Maksimal umur pendaftar adalah 45 tahun.");
      } else {
        setAgeError("");
      }
    }
  }, [birthDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "phone" && value.startsWith("0")) {
      newValue = "62" + value.slice(1);
    }

    if (name === "birthDate") {
      setBirthDate(value);
    }

    setFormData((prevFormData) => ({ ...prevFormData, [name]: newValue }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!birthDate) {
      toast.warn("Harap isi tanggal lahir Anda.");
      return;
    }

    if (ageError) {
      toast.error(ageError);
      return;
    }

    const alamatLower = formData.address.toLowerCase();
    const mengandungBejalen = alamatLower.includes("bejalen");
    const rtMatch = alamatLower.match(/rt\s*0?([1-9]|10)\b/);
    const isRtValid = rtMatch !== null;
    const rwMatch = alamatLower.match(/rw\s*0?([1-4])\b/);
    const isRwValid = rwMatch !== null;

    if (!mengandungBejalen) {
      toast.error(
        "Alamat tidak valid. Pastikan Alamat asli anda adalah 'Bejalen'."
      );
      return;
    }
    if (!isRtValid) {
      toast.error("Format RT tidak valid. Pastikan RT 1 sampai 10.");
      return;
    }
    if (!isRwValid) {
      toast.error("Format RW tidak valid. Pastikan RW 01 sampai 04.");
      return;
    }

    if (user?.hasRegistered) {
      toast.info("Anda sudah terdaftar, tunggu kabar dari kami.");
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = { ...formData, birthDate: birthDate };
      await instance.post("/pendaftaran", submissionData);
      toast.success("Pendaftaran berhasil! Kami akan segera menghubungi Anda.");

      setUser((prevUser) => ({ ...prevUser, hasRegistered: true }));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal mendaftar. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user && (user.role === "admin" || user.role === "superAdmin")) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Alert variant="info" className="text-center shadow p-4">
                <Alert.Heading as="h3" className="section-title text-danger">
                  Akses Tidak Diperlukan
                </Alert.Heading>
                <p className="section-subtitle my-3">
                  Anda sudah menjadi bagian dari "{data.namaOrganisasi}".
                </p>
                <hr />
                <Button as={Link} to="/admin" variant="outline-secondary">
                  Kembali ke Dashboard
                </Button>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (user?.hasRegistered) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Alert variant="success" className="text-center shadow-sm p-4">
                <Alert.Heading as="h3" className="section-title">
                  Terima Kasih!
                </Alert.Heading>
                <p className="section-subtitle my-3">
                  Anda sudah terdaftar sebagai calon anggota.
                  <br />
                  Kami akan segera menghubungi Anda untuk informasi lebih
                  lanjut.
                </p>
                <hr />
                <Link to="/" className="btn btn-outline-success">
                  Kembali ke Beranda
                </Link>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <section
      id="userprofile"
      className="d-flex my-4 align-items-center justify-content-center"
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} lg={8} className="order-lg-3">
            <Card className="p-4 shadow">
              <CardHeader className="d-flex align-items-center justify-content-center">
                <img
                  src={data.logoDadiBara}
                  alt="Logo"
                  width="100"
                  className="me-3"
                />
                <h2 className="section-title mb-0">
                  Formulir Pendaftaran
                  <br />
                  Karang Taruna {data.namaOrganisasi}
                </h2>
              </CardHeader>
              <Form onSubmit={handleSubmit} className="my-2">
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label>Nama Lengkap:</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    minLength={5}
                    required
                  />
                </Form.Group>
                <Row>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3" controlId="formEmail">
                      <Form.Label>Email:</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        placeholder={!user ? "Klik di sini untuk Login" : ""}
                        onChange={handleInputChange}
                        required
                        readOnly
                        onClick={handleEmailClick}
                        style={{
                          cursor: user ? "not-allowed" : "pointer",
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3" controlId="formPhone">
                      <Form.Label>
                        Nomor Telepon: (yang bisa dihubungi)
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        minLength={10}
                        required
                        placeholder="selalu awali dengan 62"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3" controlId="formGender">
                  <Form.Label>Jenis Kelamin:</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="form-select w-100 text-center"
                    required
                  >
                    <option selected disabled value="">
                      -- Pilih Jenis Kelamin Anda --
                    </option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formAddress">
                  <Form.Label>Alamat Lengkap:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    minLength={15}
                    required
                  />
                </Form.Group>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="formBirthDate">
                      <Form.Label>Tanggal Lahir:</Form.Label>
                      <Form.Control
                        type="date"
                        name="birthDate"
                        value={birthDate}
                        onChange={handleInputChange}
                        className="form-control"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formAge" className="mt-md-0 mt-3">
                      <Form.Label>Umur: (terisi otomatis)</Form.Label>
                      <Form.Control
                        type="text"
                        name="age"
                        value={age ? `${age} tahun` : ""}
                        readOnly
                        className="form-control"
                        required
                      />
                      {ageError && (
                        <Form.Text className="text-danger-emphasis">
                          {ageError}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3" controlId="formEducation">
                  <Form.Label>Pendidikan Terakhir:</Form.Label>
                  <Row>
                    <Col md={6} className="mb-0">
                      <Form.Check
                        type="radio"
                        name="education"
                        id="sd"
                        label="Sekolah Dasar"
                        value="sd"
                        checked={formData.education === "sd"}
                        onChange={handleInputChange}
                        required
                      />
                      <Form.Check
                        type="radio"
                        name="education"
                        id="smp"
                        label="Sekolah Menengah Pertama"
                        value="smp"
                        checked={formData.education === "smp"}
                        onChange={handleInputChange}
                        required
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Check
                        type="radio"
                        name="education"
                        id="smak"
                        label="Sekolah Menengah Atas / Kejuruan"
                        value="smak"
                        checked={formData.education === "smak"}
                        onChange={handleInputChange}
                        required
                      />
                      <Form.Check
                        type="radio"
                        name="education"
                        id="kuliah"
                        label="Universitas atau Sekolah Tinggi"
                        value="kuliah"
                        checked={formData.education === "kuliah"}
                        onChange={handleInputChange}
                        required
                      />
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPosition">
                  <Form.Label>Posisi yang Ingin Didaftar:</Form.Label>
                  <Form.Select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="form-select w-100 text-center"
                    required
                  >
                    <option disabled selected value="">
                      -- Pilih Posisi --
                    </option>
                    <option value="ketua" className="text-center">
                      Ketua
                    </option>
                    <option value="sekretaris" className="text-center">
                      Sekretaris
                    </option>
                    <option value="bendahara" className="text-center">
                      Bendahara
                    </option>
                    <option value="bidang_rohani" className="text-center">
                      Bidang Kerohanian
                    </option>
                    <option value="bidang_umum" className="text-center">
                      Bidang Kesekretariatan & Umum
                    </option>
                    <option value="bidang_humas" className="text-center">
                      Bidang Hubungan Masyarakat
                    </option>
                    <option value="bidang_tekno" className="text-center">
                      Bidang Teknologi & Informasi
                    </option>
                    <option value="bidang_sosbud" className="text-center">
                      Bidang Sosial & Budaya
                    </option>
                    <option value="bidang_olahraga" className="text-center">
                      Bidang Olahraga & Kepemudaan
                    </option>
                    <option value="anggota" className="text-center">
                      Anggota
                    </option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formInterests">
                  <Form.Label>
                    Minat dan Bakat <b>(Opsional)</b>:
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <div className="text-center justify-content-center mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-50 section-subtitle"
                    disabled={isSubmitting || !!ageError}
                  >
                    {isSubmitting ? (
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : (
                      "Kirim Pendaftaran"
                    )}
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>  
  );
};

export default PendaftaranAnggota;
