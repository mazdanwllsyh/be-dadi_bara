import React, { useState, useContext, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Button,
  Form,
  Modal,
  FloatingLabel,
  Row,
  Col,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import VerificationStep from "./VerificationStep";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AppContext } from "./AppContext";
import { UserContext } from "./UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import instance from "../../utils/axios.js";
import GoogleSignIn from "./GoogleSignIn.jsx";

const LoginPage = ({ show, handleClose, handleShowRegister }) => {
  const { data, theme } = useContext(AppContext);
  const { user, setUser } = useContext(UserContext);
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validated, setValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [showVerification, setShowVerification] = useState(false);

  const navigate = useNavigate();

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    toast.success(`Login berhasil! Selamat datang, ${userData.fullName}`);
    handleClose();

    if (userData.role === "admin" || userData.role === "superAdmin") {
      return navigate("/admin");
    }

    const fromPath = location.state?.background?.pathname;

    if (fromPath === "/presensi" || fromPath === "/pendaftaran") {
    } else if (fromPath === "/gallery") {
      if (Math.random() > 0.5) {
        navigate("/profile", { state: { from: fromPath } });
      }
    } else {
      navigate("/profile");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setIsLoading(true);
    setValidated(true);

    try {
      const response = await instance.post(
        "/auth/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      handleLoginSuccess(response.data.user);
    } catch (error) {
      const message =
        error.response?.data?.message || "Terjadi kesalahan. Coba Lagi Nanti!";
      toast.error(message, { theme: theme });
      if (message.includes("belum diverifikasi")) {
        handleClose();
        navigate("/verification", { state: { email: email } });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    if (show && !user) {
      if ("credentials" in navigator && navigator.credentials.get) {
        const handleAutoLogin = async () => {
          setIsGoogleLoading(true);
          try {
            const credential = await navigator.credentials.get({
              signal: controller.signal,
              identity: {
                providers: [
                  {
                    configURL: "https://accounts.google.com/gsi/fedcm.json",
                    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                  },
                ],
              },
              mediation: "optional",
            });

            if (credential && credential.token) {
              const response = await instance.post("/auth/google", {
                credential: credential.token,
              });
              handleLoginSuccess(response.data.user);
            }
          } catch (error) {
            if (error.name === "AbortError") {
              console.log(
                "FedCM dibatalkan karena pengguna login dengan cara lain."
              );
            } else {
              console.log(
                "FedCM auto-login dilewati atau dibatalkan oleh pengguna."
              );
            }
          } finally {
            setIsGoogleLoading(false);
          }
        };

        handleAutoLogin();
      }
    }
    return () => {
      controller.abort();
    };
  }, [show, user]);

  const handleVerificationSuccess = (data) => {
    setUser(data.user);
    handleClose();
    navigate("/profile");
  };

  return (
    <>
      <Helmet>
        <title>Login Akun | Karang Taruna Dadi Bara</title>
        <link rel="canonical" href="https://dadibara.bejalen.com/login" />
        <meta
          name="description"
          content="Login ke akun Anda untuk menambahkan testimoni dan fitur khusus anggota Karang Taruna DADI BARA Bejalen."
        />
        <meta name="robots" content="noindex, follow" />

        <meta property="og:title" content="Login | Karang Taruna Dadi Bara" />
        <meta
          property="og:description"
          content="Akses dashboard Anda dan kelola profil sebagai pengguna aktif KARTAR DADI BARA."
        />
        <meta property="og:url" content="https://dadibara.bejalen.com/login" />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/dr7olcn4r/image/upload/v1754596459/landing-page-logos/landing-page-logos-LogoKartar-1754596456138.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className="section-title fw-bold">
            <img
              src={data.logoDadiBara}
              alt="Logo"
              width="50"
              className="me-2"
            />
            {showVerification ? "Verifikasi Email" : "Login"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showVerification ? (
            <VerificationStep
              email={email}
              onVerifySuccess={handleVerificationSuccess}
            />
          ) : (
            <Form noValidate validated={validated} onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="formEmail">
                <FloatingLabel label="Masukkan Email">
                  <Form.Control
                    type="email"
                    placeholder="Masukkan Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FloatingLabel>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formPassword">
                <InputGroup hasValidation>
                  <FloatingLabel label="Masukkan Password">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </FloatingLabel>
                  <Button
                    variant="outline-secondary"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Button
                variant="secondary"
                type="submit"
                className="w-100 mb-3 section-subtitle text-light"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  "Masuk"
                )}
              </Button>

              <div className="d-flex align-items-center justify-content-center my-3">
                <div className="flex-grow-1 border-top"></div>
                <div className="mx-3 fw-bold opacity-50 section-subtitle">
                  Atau
                </div>
                <div className="flex-grow-1 border-top"></div>
              </div>

              <GoogleSignIn onLoginSuccess={handleLoginSuccess} />

              <Row className="justify-content-center align-items-baseline mt-3 section-subtitle">
                <Col xs="auto" className="pe-1">
                  Belum punya akun?
                </Col>
                <Col xs="auto" className="ps-0">
                  <Button
                    variant="link"
                    onClick={handleShowRegister}
                    disabled={isLoading}
                    className="fw-bold p-0 text-decoration-underline"
                    style={{ fontSize: "inherit" }}
                  >
                    Daftar di sini
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default LoginPage;
