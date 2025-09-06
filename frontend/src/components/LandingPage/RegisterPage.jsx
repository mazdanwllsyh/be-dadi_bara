import React, { useState, useContext, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Button,
  Form,
  Modal,
  FloatingLabel,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import VerificationStep from "./VerificationStep";
import { AppContext } from "./AppContext";
import { UserContext } from "./UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import instance from "../../utils/axios.js";

const RegisterPage = ({ show, handleClose, handleShowLogin }) => {
  const { data } = useContext(AppContext);
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === "phone" && value.startsWith("0")) {
      value = "62" + value.substring(1);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Password dan konfirmasi tidak cocok!");
    }
    if (formData.password.length < 8) {
      return toast.error("Password minimal 8 karakter!");
    }

    setIsLoading(true);
    try {
      const response = await instance.post("/auth/register-request", formData, {
        withCredentials: true,
      });
      toast.success(response.data.message);
      handleClose();
      navigate("/verification", { state: { email: formData.email } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Register Akun gagal.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = (data) => {
    setUser(data.user);
    handleClose();
    navigate("/profile");
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Helmet>
        <title>Register Akun | Karang Taruna Dadi Bara</title>
        <link rel="canonical" href="https://dadibara.bejalen.com/register" />
        <meta
          name="description"
          content="Buat akun baru dan bergabunglah dengan Karang Taruna DADI BARA Bejalen untuk ikut serta dalam kegiatan kepemudaan dan sosial."
        />
        <meta name="robots" content="noindex, follow" />

        <meta
          property="og:title"
          content="Register | Karang Taruna Dadi Bara"
        />
        <meta
          property="og:description"
          content="Jadi bagian dari kami! Daftar sekarang untuk berpartisipasi dalam program kerja KARTAR DADI BARA."
        />
        <meta
          property="og:url"
          content="https://dadibara.bejalen.com/register"
        />
        <meta
          property="og:image"
          content="https://dadibara.bejalen.com/path/ke/gambar_register_preview.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Modal.Header closeButton>
        <Modal.Title className="section-title">
          <img src={data.logoDadiBara} alt="Logo" width="50" className="me-2" />
          Register Akun
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleRegister}>
          <FloatingLabel label="Nama Lengkap" className="mb-3">
            <Form.Control
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </FloatingLabel>
          <FloatingLabel label="Email" className="mb-3">
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </FloatingLabel>
          <FloatingLabel label="Nomor Telepon" className="mb-3">
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </FloatingLabel>
          <InputGroup className="mb-3" controlId="formPassword">
            <FloatingLabel label="Password">
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={8}
              />
            </FloatingLabel>
            <Button
              variant="outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>

          <InputGroup className="mb-3" controlId="formConfirmPassword">
            <FloatingLabel label="Konfirmasi Password">
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
            <Button
              variant="outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
          <Button
            type="submit"
            variant="secondary"
            className="w-100"
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" /> : "Daftar"}
          </Button>
          <div className="text-center my-2">Atau</div>
          <Button
            variant="outline-danger"
            className="w-100"
            onClick={handleShowLogin}
          >
            Saya sudah memiliki Akun
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RegisterPage;
