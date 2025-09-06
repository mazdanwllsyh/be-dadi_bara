import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Card,
  Button,
  Spinner,
  Modal,
  Form,
  Row,
  Col,
  Image,
} from "react-bootstrap";
import Sidebar from "./Sidebar";
import DataTable from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaWhatsapp,
  FaInstagram,
  FaPlus,
} from "react-icons/fa";
import SKDashboard from "./SKDashboard";
import Notulensi from "./Notulensi";
import { AppContext } from "../LandingPage/AppContext";
import { toast } from "react-toastify";
import instance from "../../utils/axios";
import useCustomSwals from "./useCustomSwals";

export const customJabatanSort = (rowA, rowB) => {
  const titleA = rowA.title.split("_")[0];
  const titleB = rowB.title.split("_")[0];

  const indexA = jabatanHierarchy.indexOf(titleA);
  const indexB = jabatanHierarchy.indexOf(titleB);

  // Jika jabatan utama sama, urutkan berdasarkan title asli (misal: ketua_1 sebelum ketua_2)
  if (indexA === indexB) {
    return rowA.title.localeCompare(rowB.title);
  }

  return indexA - indexB;
};

export const jabatanHierarchy = [
  "ketua",
  "sekretaris",
  "bendahara",
  "seksi_kerohanian",
  "seksi_umum",
  "seksi_humas",
  "seksi_tekno",
  "seksi_sosbud",
  "seksi_olahraga",
];

const customStyles = {
  tableWrapper: {
    style: {
      borderRadius: "12px",
      overflow: "hidden",
    },
  },
  headRow: {
    style: {
      backgroundColor: "rgb(172, 172, 172)",
      borderBottom: "2px solid #dee2e6",
    },
  },
  headCells: {
    style: {
      color: "black",
      fontFamily: "SF UI Display",
      fontSize: "1.2rem",
      fontWeight: "bold",
      justifyContent: "center",
      borderRight: "1px solid #dee2e6",
      "&:first-of-type": {
        borderLeft: "1px solid #dee2e6",
      },
    },
  },
  rows: {
    style: {
      borderBottom: "1px solid #dee2e6",
    },
  },
  cells: {
    style: {
      fontSize: "14px",
      borderRight: "1px solid #dee2e6",
      "&:first-of-type": {
        borderLeft: "1px solid #dee2e6",
      },
      justifyContent: "center",
      alignItems: "center",
    },
  },
  pagination: {
    style: {
      justifyContent: "flex-end",
      padding: "10px 0",
    },
    select: {
      style: {
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "5px",
        backgroundColor: "rgba(196, 176, 176, 0.9) !important",
        marginRight: "10px",
      },
    },
  },
  noData: {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--bs-secondary-color)",
      backgroundColor: "var(--bs-body-bg)",
      padding: "24px",
    },
  },
};

const Keanggotaan = () => {
  const { data: appData } = useContext(AppContext);

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { showConfirmSwal, showSuccessSwal, showErrorSwal } = useCustomSwals();
  const [currentRow, setCurrentRow] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentRow(null);
    setImagePreview(null);
  };

  const handleShowModal = async (row = null) => {
    if (row) {
      setIsEditing(true);
      try {
        const response = await instance.get(`/members/${row._id}`);
        const memberData = response.data;

        const titleParts = memberData.title.split("_");
        const mainTitle = titleParts[0];
        setCurrentRow({
          ...memberData,
          title: mainTitle,
          subTitle: memberData.title,
        });

        if (response.data.foto) {
          setImagePreview(response.data.foto);
        }
      } catch (error) {
        toast.error("Gagal mengambil data pengurus.");
        return;
      }
    } else {
      setIsEditing(false);
      setCurrentRow({
        nama: "",
        title: "",
        whatsapp: "",
        instagram: "",
        foto: null,
      });
    }
    setShowModal(true);
  };

  useEffect(() => {
    const result = data.filter((row) => {
      const titleLabel = row.titleLabel || "";
      const nama = row.nama || "";
      return (
        nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        titleLabel.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredData(result);
  }, [searchTerm, data]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await instance.get("/members");
      setData(response.data);
    } catch (error) {
      toast.error("Gagal memuat data keanggotaan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = async (memberId) => {
    const isConfirmed = await showConfirmSwal(
      "Yakin ingin menghapus?",
      "Pengurus ini akan dihapus secara permanen!"
    );

    if (isConfirmed) {
      try {
        await instance.delete(`/members/${memberId}`, {
          withCredentials: true,
        });

        showSuccessSwal("Pengurus berhasil dihapus.");
        fetchMembers();
      } catch (error) {
        showErrorSwal(
          error.response?.data?.message || "Gagal menghapus pengurus."
        );
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        setImagePreview(URL.createObjectURL(file));
        setCurrentRow((prevState) => ({ ...prevState, [name]: file }));
      }
    } else {
      let updatedValue = value;
      if (name === "whatsapp" && value.startsWith("0")) {
        updatedValue = "62" + value.substring(1);
      }

      // Update state utama
      setCurrentRow((prevState) => ({ ...prevState, [name]: updatedValue }));

      if (name === "title") {
        setCurrentRow((prevState) => ({ ...prevState, subTitle: "" }));
      }
    }
  };

  const jabatanUtamaOptions = [
    { value: "ketua", label: "Ketua" },
    { value: "sekretaris", label: "Sekretaris" },
    { value: "bendahara", label: "Bendahara" },
    { value: "seksi_kerohanian", label: "Sie Kerohanian" },
    { value: "seksi_umum", label: "Sie Umum" },
    { value: "seksi_humas", label: "Hubungan Masyarakat" },
    { value: "seksi_tekno", label: "Sie Teknologi dan Informatika" },
    { value: "seksi_sosbud", label: "Sie Sosial Budaya" },
    { value: "seksi_olahraga", label: "Olahraga Kepemudaan" },
  ];

  const subJabatanOptions = {
    ketua: [
      { value: "ketua_1", label: "Ketua 1" },
      { value: "ketua_2", label: "Ketua 2" },
    ],
    sekretaris: [
      { value: "sekretaris_1", label: "Sekretaris 1" },
      { value: "sekretaris_2", label: "Sekretaris 2" },
    ],
    bendahara: [
      { value: "bendahara_1", label: "Bendahara 1" },
      { value: "bendahara_2", label: "Bendahara 2" },
    ],
    seksi_kerohanian: [
      { value: "rohani_kristen", label: "Kerohanian Kristen" },
      { value: "rohani_islam", label: "Kerohanian Islam" },
      { value: "rohani_katholik", label: "Kerohanian Katholik" },
    ],
  };

  const handleSaveChanges = async () => {
    const allJabatanOptions = [
      ...jabatanUtamaOptions,
      ...Object.values(subJabatanOptions).flat(),
    ];
    let jabatanFinalValue = currentRow.title;
    if (currentRow.subTitle) jabatanFinalValue = currentRow.subTitle;
    const selectedJabatan = allJabatanOptions.find(
      (opt) => opt.value === jabatanFinalValue
    );
    const jabatanLabel = selectedJabatan
      ? selectedJabatan.label
      : jabatanFinalValue;

    // Siapkan data untuk dikirim
    const formData = new FormData();
    formData.append("nama", currentRow.nama);
    formData.append("title", jabatanFinalValue);
    formData.append("titleLabel", jabatanLabel);
    formData.append("whatsapp", currentRow.whatsapp);
    formData.append("instagram", currentRow.instagram);
    if (currentRow.foto instanceof File) {
      formData.append("foto", currentRow.foto);
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        // Logika Edit
        await instance.put(`/members/${currentRow._id}`, formData, {
          withCredentials: true,
        });
        toast.success("Data pengurus berhasil diperbarui!");
      } else {
        // Logika Tambah
        await instance.post("/members", formData, { withCredentials: true });
        toast.success("Anggota baru berhasil ditambahkan!");
      }
      fetchMembers();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { name: "#", selector: (row, index) => index + 1, width: "60px" },
    {
      name: "Foto",
      cell: (row) => (
        <img
          src={row.foto}
          width="80"
          height="80"
          alt={row.nama}
          style={{ borderRadius: "20%", margin: "5px", objectFit: "cover" }}
        />
      ),
      width: "120px",
    },
    { name: "Nama", selector: (row) => row.nama, sortable: true },
    {
      name: "Jabatan",
      selector: (row) => row.titleLabel,
    },
    {
      name: "Whatsapp",
      cell: (row) =>
        row.whatsapp ? (
          <Button
            variant="success"
            size="sm"
            href={`https://wa.me/${row.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="d-flex align-items-center w-100 text-white text-decoration-none"
            style={{ backgroundColor: "#25D366", border: "none" }}
          >
            <FaWhatsapp className="me-2" /> Hubungi
          </Button>
        ) : null,
      width: "150px",
    },
    {
      name: "Instagram",
      cell: (row) =>
        row.instagram ? (
          <Button
            variant="primary"
            size="sm"
            href={`https://instagram.com/${row.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="d-flex align-items-center w-100 text-white text-decoration-none"
            style={{
              background:
                "linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#E522A7FF 100%)",
              border: "none",
            }}
          >
            <FaInstagram className="me-2" /> Kunjungi
          </Button>
        ) : null,
      width: "150px",
    },
    {
      name: "Aksi",
      cell: (row) => (
        <div className="d-flex flex-column gap-2">
          <Button
            variant="warning"
            size="sm"
            onClick={() => handleShowModal(row)}
            className="d-flex align-items-center w-100" // Tambahkan w-100 untuk lebar
          >
            <FaEdit className="me-2" /> Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row._id)}
            className="d-flex align-items-center w-100" // Tambahkan w-100 untuk lebar
          >
            <FaTrash className="me-2" /> Hapus
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      width: "120px",
    },
  ];

  return (
    <>
      <Container fluid className="dashboard-container py-4 my-3">
        <Card className="shadow">
          <Card.Header>
            <h3 className="section-title mb-0">
              Pengurus {appData.namaOrganisasi}
            </h3>
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col className="d-flex justify-content-end">
                <Form.Control
                  type="search"
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ maxWidth: "300px" }}
                />
              </Col>
            </Row>
            <DataTable
              columns={columns}
              data={filteredData}
              progressPending={isLoading}
              highlightOnHover
              customStyles={customStyles}
              pagination
              paginationPerPage={5}
              paginationRowsPerPageOptions={[10, 25, 50]}
              progressComponent={
                <div className="my-4">
                  <Spinner />
                </div>
              }
              paginationComponentOptions={{
                rowsPerPageText: "Baris per halaman:",
                rangeSeparatorText: "dari",
              }}
              pointerOnHover
              noDataComponent={
                <div className="text-center my-3">
                  <h3 className="SF-UIDisplay text-danger">
                    Tidak Ada Data untuk Ditampilkan
                  </h3>
                  <p>
                    Saat ini belum ada data yang tersedia di dalam tabel ini.
                  </p>
                </div>
              }
            />
          </Card.Body>
          <Card.Footer>
            <div className="text-center">
              <Button
                variant="secondary"
                onClick={() => handleShowModal()}
                className="w-50"
              >
                <FaPlus className="me-2" /> Tambahkan Pengurus
              </Button>
            </div>
          </Card.Footer>
        </Card>
        <Notulensi />
        <SKDashboard />
      </Container>

      {/* Modal untuk Tambah/Edit Pengurus */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title className="section-title">
            {isEditing ? "Edit" : "Tambah"} Pengurus
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {imagePreview && (
              <div className="text-center mb-3">
                <p className="mb-1">Pratinjau Gambar:</p>
                <Image
                  src={imagePreview}
                  thumbnail
                  alt="Pratinjau"
                  style={{
                    width: "250px",
                    height: "250px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    boxShadow: "2px 2px 3px rgba(0, 0, 0, 0.3)",
                  }}
                />
              </div>
            )}

            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>
                {isEditing ? "Ganti Foto" : "Upload Foto"}
              </Form.Label>
              <Form.Control
                type="file"
                name="foto"
                onChange={handleFormChange}
                accept="image/*" // Hanya menerima file gambar
                required
              />
              <p className="text-muted text-center">
                Pastikan ukuran <strong>tidak melebihi 4.99MB</strong>
              </p>
            </Form.Group>

            {/* Input Nama Lengkap */}
            <Form.Group className="mb-3" controlId="formNama">
              <Form.Label>Nama Lengkap:</Form.Label>
              <Form.Control
                type="text"
                name="nama"
                placeholder="Masukkan nama"
                value={currentRow?.nama || ""}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Jabatan:</Form.Label>
              <Form.Select
                name="title"
                value={currentRow?.title || ""}
                onChange={handleFormChange}
                required
                className="text-center"
              >
                <option value="" disabled>
                  -- Pilih Jabatan --
                </option>
                {jabatanUtamaOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Dropdown SUB-JABATAN yang muncul secara kondisional */}
            {subJabatanOptions[currentRow?.title] && (
              <Form.Group className="mb-3" controlId="formSubTitle">
                <Form.Label>Detail Jabatan:</Form.Label>
                <Form.Select
                  name="subTitle"
                  value={currentRow?.subTitle || ""}
                  onChange={handleFormChange}
                  required
                  className="text-center"
                >
                  <option value="" selected disabled>
                    -- Pilih Detail --
                  </option>
                  {subJabatanOptions[currentRow.title].map((sub) => {
                    const isTaken = data.some(
                      (p) => p.title === sub.value && p._id !== currentRow?._id
                    );
                    return (
                      <option
                        key={sub.value}
                        value={sub.value}
                        disabled={
                          ["ketua", "sekretaris", "bendahara"].includes(
                            currentRow.title
                          ) && isTaken
                        }
                      >
                        {sub.label}{" "}
                        {["ketua", "sekretaris", "bendahara"].includes(
                          currentRow.title
                        ) &&
                          isTaken &&
                          "(Sudah Terisi)"}
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="whatsapp">
                  <Form.Label>Whatsapp:</Form.Label>
                  <Form.Control
                    name="whatsapp"
                    type="number"
                    placeholder="Contoh: 6281234567890"
                    value={currentRow?.whatsapp || ""}
                    onChange={handleFormChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="instagram">
                  <Form.Label>Instagram:</Form.Label>
                  <Form.Control
                    name="instagram"
                    type="text"
                    placeholder="Contoh: budi.santoso"
                    value={currentRow?.instagram || ""}
                    onChange={handleFormChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseModal}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveChanges}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : isEditing ? (
              "Simpan Perubahan"
            ) : (
              "Tambahkan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Keanggotaan;
