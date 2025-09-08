import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Image,
  Spinner,
  InputGroup,
  Modal,
} from "react-bootstrap";
import {
  FaSignOutAlt,
  FaHome,
  FaSave,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaTimesCircle,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { UserContext } from "../UserContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import instance from "../../../utils/axios.js";
import { AppContext } from "../AppContext.jsx";
import useCustomSwals from "../../Dashboard/useCustomSwals.jsx";

const Profile = () => {
  const { user, setUser, loading, logout } = useContext(UserContext);
  const { showSuccessSwal, showErrorSwal, showInfoSwal } =
    useCustomSwals();

  const { theme } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = location.state?.from;
  let backButton = null;

  if (fromPath === "/gallery") {
    backButton = {
      text: "Kembali menjelajahi Galeri?",
      path: "/gallery",
    };
  } else if (fromPath === "/presensi") {
    backButton = {
      text: "Kembali ke menu Presensi",
      path: "/presensi",
    };
  } else if (fromPath === "/pendaftaran") {
    backButton = {
      text: "Ingin Melanjutkan Pendaftaran?",
      path: "/pendaftaran",
    };
  }

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (
        file.type !== "image/jpeg" &&
        file.type !== "image/png" &&
        file.type !== "image/webp"
      ) {
        showInfoSwal("Format file harus .jpg, .png, atau .webp!");
        return;
      }

      if (file.size > 4 * 1024 * 1024) {
        showErrorSwal("Ukuran gambar tidak boleh lebih dari 4MB!");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const [showNavButton, setShowNavButton] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    password: "",
  });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (location.state?.needsReload) {
      navigate(location.pathname, { replace: true, state: {} });
      window.location.reload();
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        address:
          user.address || "Desa Bejalen, Bejalen Barat/Timur RT 00 RW 00",
      });
    }
  }, [user]);

  useEffect(() => {
    setShowNavButton(true);

    if (user && user.role === "user") {
      const timer = setTimeout(() => {
        setShowNavButton(false);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name === "phone") {
      if (value.startsWith("0")) {
        value = "62" + value.substring(1);
      }
    }
    setProfileData({ ...profileData, [name]: value });
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      return showErrorSwal("Harap masukkan password Anda untuk konfirmasi.");
    }
    setIsUpdating(true); // Gunakan state loading yang sama
    try {
      const response = await instance.delete("/auth/profile", {
        data: { password: deletePassword },
        withCredentials: true,
      });
      showSuccessSwal(response.data.message);
      setUser(null); // Logout user
      navigate("/"); // Arahkan ke beranda
    } catch (error) {
      showErrorSwal(error.response?.data?.message || "Gagal menghapus akun.");
    } finally {
      setIsUpdating(false);
      setShowDeleteModal(false);
    }
  };

  const isAccountOldEnough =
    user && (new Date() - new Date(user.updatedAt)) / (1000 * 60 * 60 * 24) > 7;

  const handleSaveChanges = async () => {
    const updatePayload = { ...profileData };

    if (oldPassword || newPassword) {
      if (!oldPassword || !newPassword) {
        showErrorSwal("Sandi Lama dan Sandi Baru harus diisi!");
        return;
      }
      if (newPassword.length < 8) {
        showInfoSwal("Kata sandi baru minimal 8 karakter!");
        return;
      }
      updatePayload.oldPassword = oldPassword;
      updatePayload.password = newPassword;
    }

    const formData = new FormData();

    formData.append("fullName", profileData.fullName);
    formData.append("email", profileData.email);
    formData.append("phone", profileData.phone);
    formData.append("gender", profileData.gender);
    formData.append("address", profileData.address);

    if (oldPassword && newPassword) {
      formData.append("oldPassword", oldPassword);
      formData.append("password", newPassword);
    }

    if (imageFile) {
      formData.append("profilePicture", imageFile);
    }

    setIsUpdating(true);

    try {
      const response = await instance.put("/auth/profile", formData, {
        withCredentials: true,
      });

      setUser(response.data.user);
      toast.success(
        <div>
          Profil berhasil diperbarui!
          <br />
          Halaman akan dimuat ulang...
        </div>,
        { theme: theme }
      );
      setIsEditing(false);
      setImageFile(null);
      setImagePreview("");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      showErrorSwal(
        error.response?.data?.message || "Gagal memperbarui profil."
      );
    } finally {
      setIsUpdating(false);
    }
    setTimeout(() => {
      window.location.reload();
    }, 2050);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileData({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      gender: user.gender || "",
      address: user.address || "Desa Bejalen, Bejalen Barat/Timur RT 00 RW 00",
    });
    setImageFile(null);
    setImagePreview("");
    setOldPassword("");
    setNewPassword("");
  };

  const handleSignOut = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      <section
        id="userprofile"
        className="d-flex my-4 align-items-center justify-content-center"
      >
        <Container>
          <ToastContainer position="bottom-center" autoClose={3000} />
          <Row className="justify-content-md-center">
            <Col xs={12} lg={4} className="mb-4 mb-lg-0 order-lg-1">
              <Card className="p-4 align-items-center shadow-sm text-center">
                <h2 className="section-title">Foto Profil</h2>
                <hr className="w-100" />
                <div className="profile-image-container border-black-emphasis">
                  <Image
                    src={
                      imagePreview ||
                      (user?.profilePicture
                        ? user.profilePicture
                        : "/default-avatar.png")
                    }
                    alt="FotoProfil"
                  />
                </div>

                {isEditing ? (
                  <>
                    <Form.Group controlId="formFile" className="mb-2 w-100">
                      <Form.Label>
                        Pastikan ukuran <strong>tidak melebihi 4MB</strong>
                      </Form.Label>
                      <Form.Control
                        type="file"
                        onChange={handleFileChange}
                        style={{ cursor: "pointer" }}
                        accept="image/jpeg, image/png, image/webp"
                      />
                    </Form.Group>
                  </>
                ) : (
                  <small className="text-muted small">
                    "Edit Data" untuk mengubah data dan foto profil.
                  </small>
                )}
              </Card>

              {showNavButton && (
                <div className="text-center mt-3">
                  {user.role === "admin" || user.role === "superAdmin" ? (
                    <Button
                      className="btn-role w-100 section-subtitle text-light shadow-sm"
                      onClick={() => navigate("/admin")}
                    >
                      <MdDashboard className="me-2" /> Ke Dashboard
                    </Button>
                  ) : (
                    <Button
                      as="a"
                      href="/"
                      className="btn-role d-block d-lg-none w-100 section-subtitle text-light shadow-sm"
                    >
                      <FaHome className="me-2" /> Ke Beranda
                    </Button>
                  )}
                </div>
              )}

              {backButton && user?.role === "user" && (
                <div className="text-center mt-3">
                  <Button
                    variant="info"
                    className="w-100 text-light border-0"
                    as="a"
                    href={backButton.path}
                  >
                    {backButton.text}
                  </Button>
                </div>
              )}

              <div className="d-none d-lg-block text-center mt-3">
                <Button
                  variant="danger"
                  className="btn-logout section-subtitle text-light w-100"
                  onClick={handleSignOut}
                >
                  <FaSignOutAlt className="m-2" />
                  Logout
                </Button>
              </div>
            </Col>

            <Col xs={12} lg={8} className="order-lg-3">
              <Card className="p-4 shadow-sm">
                <h2 className="section-title">Data Diri</h2>
                <hr />
                <Form>
                  <Form.Group className="mb-2" controlId="formName">
                    <Form.Label>Nama Lengkap:</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                    />
                  </Form.Group>
                  <Row>
                    <Col xs={12} md={6}>
                      <Form.Group className="mb-2" controlId="formEmail">
                        <Form.Label>Email:</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="text"
                            name="email"
                            value={
                              isEditing && showEmail
                                ? profileData.email
                                : "•••••••"
                            }
                            readOnly={!isEditing}
                            className={
                              !isEditing || !showEmail ? "password-mask" : ""
                            }
                          />
                          {isEditing && (
                            <Button
                              variant="outline-secondary"
                              onClick={() => setShowEmail(!showEmail)}
                            >
                              {showEmail ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                          )}
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col xs={12} md={6}>
                      <Form.Group className="mb-2" controlId="formPhone">
                        <Form.Label>Nomor Telepon:</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          readOnly={!isEditing}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-2" controlId="formGender">
                    <Form.Label>Jenis Kelamin:</Form.Label>
                    <Form.Select
                      name="gender"
                      value={profileData.gender || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="text-center"
                    >
                      <option value="" disabled>
                        -- Pilih Jenis Kelamin --
                      </option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-2" controlId="formAddress">
                    <Form.Label>Alamat:</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                    />
                  </Form.Group>

                  {isEditing ? (
                    <>
                      <hr />
                      <p className="text-muted small">
                        Isi jika Anda ingin mengubah kata sandi.
                      </p>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-2" controlId="formPassword">
                            <Form.Label>Kata Sandi Lama:</Form.Label>
                            <Form.Control
                              type="password"
                              placeholder="Masukkan sandi lama"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group
                            className="mb-2"
                            controlId="formNewPassword"
                          >
                            <Form.Label>Kata Sandi Baru:</Form.Label>
                            <InputGroup>
                              <Form.Control
                                type={showPassword ? "text" : "password"}
                                placeholder="Minimal 8 karakter"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </Button>
                            </InputGroup>
                          </Form.Group>
                        </Col>
                      </Row>
                    </>
                  ) : (
                    <Form.Group className="mb-2" controlId="formPassword">
                      <Form.Label>Kata Sandi:</Form.Label>
                      <Form.Control type="password" value="********" readOnly />
                    </Form.Group>
                  )}

                  <div className="text-center justify-content-center mt-4">
                    {isEditing ? (
                      <Row className="justify-content-center g-2">
                        <Col xs={12} md="auto">
                          <Button
                            variant="warning"
                            onClick={handleCancelEdit}
                            className="w-100"
                            disabled={isUpdating}
                          >
                            <FaTimesCircle className="me-2" />
                            Batal Edit
                          </Button>
                        </Col>
                        <Col xs={12} md="auto">
                          <Button
                            variant="success"
                            onClick={handleSaveChanges}
                            className="w-100"
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Spinner size="sm" className="me-2" />
                            ) : (
                              <FaSave className="me-2" />
                            )}
                            Simpan Perubahan
                          </Button>
                        </Col>
                      </Row>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => setIsEditing(true)}
                        className="w-100"
                      >
                        <FaEdit className="me-2" />
                        Edit Data
                      </Button>
                    )}

                    {isEditing &&
                      (user.role === "admin" || user.role === "superAdmin") &&
                      isAccountOldEnough && (
                        <Button
                          variant="danger"
                          onClick={() => setShowDeleteModal(true)}
                          className="w-75 mt-2"
                          disabled={isUpdating}
                        >
                          Hapus Akun?
                        </Button>
                      )}

                    {!isEditing && (
                      <div className="d-lg-none text-center mt-3">
                        <Button
                          variant="danger"
                          className="btn-logout section-subtitle text-light w-100"
                          onClick={handleSignOut}
                        >
                          <FaSignOutAlt className="m-2" />
                          Logout
                        </Button>
                      </div>
                    )}
                  </div>
                </Form>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-danger">
            Konfirmasi Hapus Akun
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Tindakan ini **tidak bisa dibatalkan**. Semua data Anda akan dihapus
            secara permanen.
          </p>
          <p>Untuk melanjutkan, silakan masukkan password Anda saat ini:</p>
          <Form.Control
            type="password"
            placeholder="Masukkan password..."
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={isUpdating}
          >
            {isUpdating ? <Spinner size="sm" /> : "Ya, Hapus Akun Saya"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Profile;
