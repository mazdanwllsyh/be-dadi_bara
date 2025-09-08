import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  CardHeader,
  Spinner,
  Modal,
  InputGroup,
} from "react-bootstrap";
import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaWhatsapp,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaUndo,
} from "react-icons/fa";
import { UserContext } from "../LandingPage/UserContext.jsx";
import { toast } from "react-toastify";
import instance from "../../utils/axios.js";
import useCustomSwals from "./useCustomSwals.jsx";

const AdminDashboard = () => {
  const { user } = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(true);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [editingAdmin, setEditingAdmin] = useState(null);
  const { showConfirmSwal, showSuccessSwal, showErrorSwal, showInfoSwal, } = useCustomSwals();
  const [showPassword, setShowPassword] = useState({});
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const response = await instance.get("/auth/management/users", {
        withCredentials: true,
      });
      setSuperAdmins(response.data.superAdmins);
      setAdmins(response.data.admins);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memuat data admin.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "superAdmin") {
      fetchAdminData();
    } else if (user) {
      setIsLoading(false);
    }
  }, [user]);

  const handleNewAdminInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === "phone" && value.startsWith("0")) {
      finalValue = `62${value.substring(1)}`;
    }
    setNewAdminData((prevState) => ({ ...prevState, [name]: finalValue }));
  };

  const handleSaveNewAdmin = async () => {
    if (
      !newAdminData.fullName ||
      !newAdminData.email ||
      !newAdminData.password ||
      !newAdminData.phone
    ) {
      return showInfoSwal("Semua field wajib diisi!");
    }
    try {
      await instance.post("/auth/admins", newAdminData, {
        withCredentials: true,
      });
      showSuccessSwal("Admin baru berhasil ditambahkan!");
      setShowAddAdminModal(false);
      setNewAdminData({ fullName: "", email: "", password: "", phone: "" });
      fetchAdminData();
    } catch (error) {
      showErrorSwal(error.response?.data?.message || "Gagal menambah admin.");
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    const isConfirmed = await showConfirmSwal(
      "Yakin ingin menghapus?",
      "Admin ini akan dihapus secara permanen!"
    );

    if (isConfirmed) {
      try {
        await instance.delete(`/auth/admins/${adminId}`, {
          withCredentials: true,
        });
        showSuccessSwal("Admin berhasil dihapus.");
        fetchAdminData();
      } catch (error) {
        showErrorSwal(error.response?.data?.message || "Gagal menghapus admin.");
      }
    }
  };

  const handleEditClick = (admin) => {
    setEditingAdmin({ ...admin, password: "" }); 
  };

  const handleCancelEdit = () => {
    setEditingAdmin(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return;
    try {
      const { _id, fullName, password } = editingAdmin;
      const updateData = { fullName };
      if (password) {
        updateData.password = password;
      }

      await instance.put(`/auth/admins/${_id}`, updateData, {
        withCredentials: true,
      });
      showSuccessSwal(`Data ${editingAdmin.fullName} berhasil diperbarui.`);
      setEditingAdmin(null);
      fetchAdminData();
    } catch (error) {
      showErrorSwal(error.response?.data?.message || "Gagal memperbarui admin.");
    }
  };

  const maskEmail = (email) =>
    email
      ? `${email.substring(0, 2)}****${email.substring(email.indexOf("@"))}`
      : "";

  const memoizedSuperAdmins = useMemo(() => superAdmins, [superAdmins]);
  const memoizedAdmins = useMemo(() => admins, [admins]);

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "90vh" }}
      >
        <Spinner />
      </div>
    );
  }

  if (user?.role !== "superAdmin") {
    return (
      <Container
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "90vh" }}
      >
        <h2 className="text-danger section-title">Akses Ditolak</h2>
        <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      </Container>
    );
  }

  return (
    <Container className="dashboard-container my-3">
      <Row>
        <Col md={12} className="mb-4">
          <Card className="shadow-sm">
            <CardHeader>
              <h3 className="section-title mb-0">Data Super Admin</h3>
            </CardHeader>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th className="th-short align-middle text-center">#</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th className="align-middle text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {memoizedSuperAdmins.map((sa, index) => (
                    <tr key={sa._id}>
                      <td className="align-middle text-center">{index + 1}</td>
                      <td className="align-middle">{sa.fullName}</td>
                      <td className="align-middle">{maskEmail(sa.email)}</td>
                      <td className="align-middle text-center">
                        <Button
                          as="a"
                          href={`https://wa.me/${sa.phone}`}
                          target="_blank"
                          size="sm"
                          style={{ backgroundColor: "#25D366", border: "none" }}
                          disabled={!sa.phone}
                        >
                          <FaWhatsapp /> Hubungi
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {/* Komponen pagination dihapus dari sini */}
            </Card.Body>
          </Card>
        </Col>

        <Col md={12}>
          <Card className="shadow-sm">
            <CardHeader>
              <h3 className="mb-0 section-title">Data Admin</h3>
            </CardHeader>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th className="th-short align-middle text-center">#</th>
                    <th style={{ minWidth: "155px" }}>Nama</th>
                    <th className="align-middle text-center">Email</th>
                    <th style={{ minWidth: "125px" }}>Password</th>
                    <th className="align-middle text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {memoizedAdmins.map((admin, index) => (
                    <tr key={admin._id}>
                      <td className="align-middle text-center">{index + 1}</td>
                      <td className="align-middle">
                        {editingAdmin?._id === admin._id ? (
                          <Form.Control
                            type="text"
                            name="fullName"
                            value={editingAdmin.fullName}
                            onChange={handleEditInputChange}
                          />
                        ) : (
                          admin.fullName
                        )}
                      </td>
                      <td className="align-middle">{admin.email}</td>
                      <td className="align-middle">
                        {editingAdmin?._id === admin._id ? (
                          <InputGroup>
                            <Form.Control
                              type={
                                showPassword[admin._id] ? "text" : "password"
                              }
                              name="password"
                              placeholder="Password Baru (opsional)"
                              onChange={handleEditInputChange}
                            />
                            <Button
                              variant="outline-secondary"
                              onClick={() =>
                                setShowPassword((p) => ({
                                  ...p,
                                  [admin._id]: !p[admin._id],
                                }))
                              }
                            >
                              {showPassword[admin._id] ? (
                                <FaEyeSlash />
                              ) : (
                                <FaEye />
                              )}
                            </Button>
                          </InputGroup>
                        ) : (
                          "********"
                        )}
                      </td>
                      <td className="align-middle">
                        <div className="d-flex justify-content-center align-items-center">
                          {editingAdmin?._id === admin._id ? (
                            <div className="d-flex gap-2">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={handleUpdateAdmin}
                              >
                                <FaSave />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleCancelEdit}
                              >
                                <FaUndo />
                              </Button>
                            </div>
                          ) : (
                            <div className="d-flex gap-2">
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleEditClick(admin)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                as="a"
                                href={`https://wa.me/${admin.phone}`}
                                target="_blank"
                                style={{
                                  backgroundColor: "#25D366",
                                  border: "none",
                                }}
                                size="sm"
                              >
                                <FaWhatsapp />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteAdmin(admin._id)}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
            {admins.length < 7 && (
              <Card.Footer className="text-center">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddAdminModal(true)}
                  className="w-50"
                >
                  <FaPlus className="me-2" />
                  Tambah Admin Baru (Sisa {7 - admins.length})
                </Button>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        show={showAddAdminModal}
        onHide={() => setShowAddAdminModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="section-title">
            Tambah Admin {admins.length + 1}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nama Lengkap</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={newAdminData.fullName}
                onChange={handleNewAdminInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={newAdminData.email}
                onChange={handleNewAdminInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nomor Handphone</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                placeholder="Awali dengan 62"
                value={newAdminData.phone}
                onChange={handleNewAdminInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showNewPassword ? "text" : "password"}
                  name="password"
                  value={newAdminData.password}
                  onChange={handleNewAdminInputChange}
                  placeholder="Pastikan Password yang kuat"
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddAdminModal(false)}
          >
            Batal
          </Button>
          <Button variant="primary" onClick={handleSaveNewAdmin}>
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
