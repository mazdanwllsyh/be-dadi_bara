import React, { useState, useEffect, useContext } from "react";
import { Modal, Button, FloatingLabel, Form, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { AppContext } from "./AppContext";
import instance from "../../utils/axios.js";
import useCustomSwals from "../Dashboard/useCustomSwals.jsx";

const VerificationPage = ({ show, handleClose }) => {
  const { data } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const { showSuccessSwal, showErrorSwal, showInfoSwal } = useCustomSwals();

  const [email, setEmail] = useState(
    () =>
      location.state?.email || localStorage.getItem("verificationEmail") || ""
  );
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);

  useEffect(() => {
    if (location.state?.email) {
      localStorage.setItem("verificationEmail", location.state.email);
    }
  }, [location.state?.email]);

  const onVerifySuccess = (userData) => {
    setUser(userData.user);
    localStorage.removeItem("verificationEmail");
    if (handleClose) handleClose();
    navigate("/profile", { state: { needsReload: true } });
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await instance.post(
        "/auth/register-verify",
        { email, verificationCode },
        { withCredentials: true }
      );
      showSuccessSwal("Verifikasi berhasil! Selamat datang.");
      onVerifySuccess(response.data);
    } catch (error) {
      showErrorSwal(error.response?.data?.message || "Verifikasi gagal.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    try {
      const nextCooldown = Math.min(30 * 2 ** resendAttempts, 120);
      setResendAttempts(resendAttempts + 1);
      setCooldown(nextCooldown);
      await instance.post("/auth/resend-verification", { email });
      showSuccessSwal("Email verifikasi baru telah dikirim.");
    } catch (error) {
      showErrorSwal(error.response?.data?.message || "Gagal mengirim ulang.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title className="section-title">
          <img src={data.logoDadiBara} alt="Logo" width="50" className="me-2" />
          Verifikasi Akun Anda
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleVerify}>
          <p className="text-center">
            Masukkan kode 6 digit yang dikirim ke <strong>{email}</strong>.
          </p>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="mb-0 small">Tidak menerima kode?</p>
            <Button
              variant="link"
              className="p-0 text-decoration-underline"
              onClick={handleResend}
              disabled={cooldown > 0 || isLoading}
              style={{ fontSize: "inherit" }}
            >
              {cooldown > 0 ? `Kirim Ulang (${cooldown}s)` : "Kirim Ulang"}
            </Button>
          </div>
          <FloatingLabel label="Kode Verifikasi">
            <Form.Control
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              required
            />
          </FloatingLabel>
          <Button type="submit" className="w-100 mt-3" disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : "Verifikasi & Masuk"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default VerificationPage;
