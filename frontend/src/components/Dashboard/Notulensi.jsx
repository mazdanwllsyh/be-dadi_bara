import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Card,
  Button,
  Spinner,
  Modal,
  Form,
  Row,
  Col,
  Pagination,
} from "react-bootstrap";
import Table from "react-bootstrap/Table";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaFileImage,
  FaFileAlt,
  FaFilePdf,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { AppContext } from "../LandingPage/AppContext";
import instance from "../../utils/axios";
import useCustomSwals from "./useCustomSwals";

const Notulensi = () => {
  const { data, theme } = useContext(AppContext);
  const [kegiatanList, setKegiatanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const { showConfirmSwal, showSuccessSwal, showErrorSwal } = useCustomSwals();

  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showTextViewModal, setShowTextViewModal] = useState(false);
  const [selectedKegiatanForView, setSelectedKegiatanForView] = useState(null);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [modalContent, setModalContent] = useState({
    url: null,
    type: null,
    text: "",
  });
  const [notulenFile1, setNotulenFile1] = useState(null);
  const [notulenFile2, setNotulenFile2] = useState(null);

  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [originalTimestamp, setOriginalTimestamp] = useState(null);
  const [notulenText, setNotulenText] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const fetchKegiatan = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await instance.get("/jadwal-kegiatan");
      const sortedData = (response.data || []).sort((a, b) => {
        const dateTimeB = new Date(`${b.tanggal.substring(0, 10)}T${b.waktu}`);
        const dateTimeA = new Date(`${a.tanggal.substring(0, 10)}T${a.waktu}`);

        return dateTimeB - dateTimeA;
      });
      setKegiatanList(sortedData);
    } catch (error) {
      toast.error("Gagal memuat data kegiatan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKegiatan();
  }, [fetchKegiatan]);

  const handleEditClick = (kegiatan) => {
    setSelectedKegiatan(kegiatan);
    setOriginalTimestamp(kegiatan.updatedAt);
    setNotulenText(kegiatan.notulen || "");
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedKegiatan(null);
  };

  const handleViewNotulen = (kegiatan, type, docIndex = 0) => {
    setSelectedKegiatanForView(kegiatan);

    if (type === "text") {
      if (!kegiatan.notulen) return toast.warn("Tidak ada catatan teks.");
      setModalContent({ text: kegiatan.notulen, nama: kegiatan.nama });
      setShowTextViewModal(true);
    } else if (type === "document") {
      setSelectedDocIndex(docIndex);
      setShowDocumentModal(true);
    }
  };

  const handleCloseViewModals = () => {
    setShowDocumentModal(false);
    setShowTextViewModal(false);
    setSelectedKegiatanForView(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedKegiatan) return;

    if (!notulenText && !notulenFile1 && !notulenFile2) {
      return toast.warn(
        "Harap isi catatan notulensi atau unggah setidaknya satu dokumen."
      );
    }

    if (notulenText && notulenText.length < 45) {
      return toast.warn(
        `Catatan notulensi terlalu pendek. Minimal 45 karakter (saat ini: ${notulenText.length}).`
      );
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("notulen", notulenText);
    formData.append("originalTimestamp", originalTimestamp);

    if (notulenFile1) {
      formData.append("document1", notulenFile1);
    } else if (notulenFile2) {
      formData.append("document1", notulenFile2);
    }

    if (notulenFile1 && notulenFile2) {
      formData.append("document2", notulenFile2);
    }

    try {
      await instance.put(`/notulensi/${selectedKegiatan._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      toast.success("Notulensi berhasil disimpan!");
      fetchKegiatan();
      handleCloseEditModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menyimpan notulensi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotulensi = async (kegiatanId) => {
    const isConfirmed = await showConfirmSwal(
      "Yakin ingin menghapus?",
      "Apakah Anda yakin ingin menghapus Notulensi Kegiatan ini (Kegiatan tidak akan terhapus)?"
    );

    if (isConfirmed) {
      setDeletingId(kegiatanId);
      try {
        await instance.delete(`/notulensi/${kegiatanId}`, {
          withCredentials: true,
        });
        showSuccessSwal("Notulensi berhasil dihapus.");
        fetchKegiatan();
      } catch (error) {
        showErrorSwal(
          error.response?.data?.message || "Gagal menghapus notulensi."
        );
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filteredList = useMemo(() => {
    if (!searchTerm) return kegiatanList;
    return kegiatanList.filter((kegiatan) =>
      kegiatan.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, kegiatanList]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesPerPage]);

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredList.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  const totalPages = Math.ceil(filteredList.length / entriesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Card className="shadow w-100 my-3">
        <Card.Header>
          <h3 className="mb-0 section-title">
            Arsip Notulensi Kegiatan {data.namaOrganisasi}
          </h3>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3 align-items-center justify-content-between g-3">
            <Col xs={12} md="auto" className="order-1">
              <div className="d-flex justify-content-center justify-content-md-start align-items-center">
                <span className="me-2">Tampilkan</span>
                <Form.Select
                  style={{ width: "80px" }}
                  value={entriesPerPage}
                  onChange={handleEntriesPerPageChange}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Form.Select>
                <span className="ms-2">entri</span>
              </div>
            </Col>

            {/* Pagination */}
            <Col
              xs={12}
              md="auto"
              className="order-2 order-md-3 d-flex justify-content-center"
            >
              {totalPages > 1 && (
                <Pagination className="mb-0">
                  <Pagination.Prev
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {[...Array(totalPages).keys()].map((num) => (
                    <Pagination.Item
                      key={num + 1}
                      active={num + 1 === currentPage}
                      onClick={() => paginate(num + 1)}
                    >
                      {num + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              )}
            </Col>

            {/* Search Box */}
            <Col xs={12} md={5} lg={4} className="order-3 order-md-3">
              <Form.Control
                type="search"
                placeholder="Cari nama kegiatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
          </Row>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nama Kegiatan</th>
                <th>Waktu Kegiatan</th>
                <th style={{ maxWidth: "150px" }}>Dokumen</th>
                <th style={{ width: "140px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.map((kegiatan) => (
                <tr key={kegiatan._id}>
                  <td>{kegiatan.nama}</td>
                  <td>{`${new Date(kegiatan.tanggal).toLocaleDateString(
                    "id-ID",
                    { day: "2-digit", month: "long", year: "numeric" }
                  )}, ${kegiatan.waktu}`}</td>
                  <td className="align-middle">
                    <div className="d-flex flex-column gap-2 align-items-center">
                      {kegiatan.notulen && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleViewNotulen(kegiatan, "text")}
                        >
                          <FaFileAlt className="me-1" /> Lihat Teks
                        </Button>
                      )}
                      {kegiatan.documents?.[0]?.documentUrl && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            handleViewNotulen(kegiatan, "document", 0)
                          }
                        >
                          {kegiatan.documents[0].documentType === "image" ? (
                            <FaFileImage className="me-1" />
                          ) : (
                            <FaFilePdf className="me-1" />
                          )}
                          Lihat Dokumen 1
                        </Button>
                      )}
                      {kegiatan.documents?.[1]?.documentUrl && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            handleViewNotulen(kegiatan, "document", 1)
                          }
                        >
                          {kegiatan.documents[1].documentType === "image" ? (
                            <FaFileImage className="me-1" />
                          ) : (
                            <FaFilePdf className="me-1" />
                          )}
                          Lihat Dokumen 2
                        </Button>
                      )}
                      {!kegiatan.notulen &&
                        (!kegiatan.documents ||
                          kegiatan.documents.length === 0) && (
                          <div className="text-center w-100">-</div>
                        )}
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-column gap-2">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEditClick(kegiatan)}
                        disabled={deletingId !== null}
                      >
                        <FaEdit /> Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteNotulensi(kegiatan._id)}
                        disabled={
                          !kegiatan.notulen &&
                          (!kegiatan.documents ||
                            kegiatan.documents.length === 0)
                        }
                      >
                        <FaTrash /> Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal untuk Edit Notulensi */}
      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        centered
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title className="section-title">
            Edit Notulensi: <br /> "{selectedKegiatan?.nama}"
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Catatan / Ringkasan Notulensi</Form.Label>
              <Form.Control
                className="text-justify"
                as="textarea"
                rows={8}
                placeholder="Tuliskan hasil rapat atau ringkasan kegiatan di sini..."
                value={notulenText}
                onChange={(e) => setNotulenText(e.target.value)}
                minLength={45}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Unggah Dokumen 1 (Gambar/PDF)</Form.Label>
              {selectedKegiatan?.documents?.[0]?.documentUrl && (
                <Form.Text className="d-flex text-muted mb-1">
                  File saat ini:{" "}
                  <Button
                    variant="link"
                    className="p-0 text-decoration-underline"
                    onClick={() =>
                      handleViewNotulen(selectedKegiatan, "document", 0)
                    }
                  >
                    Lihat File
                  </Button>
                </Form.Text>
              )}
              <Form.Control
                type="file"
                onChange={(e) => setNotulenFile1(e.target.files[0])}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Unggah Dokumen 2 (Gambar/PDF)</Form.Label>
              {selectedKegiatan?.documents?.[1]?.documentUrl && (
                <Form.Text className="d-flex text-muted mb-1">
                  File saat ini:{" "}
                  <Button
                    variant="link"
                    className="p-0 text-decoration-underline"
                    onClick={() =>
                      handleViewNotulen(selectedKegiatan, "document", 1)
                    }
                  >
                    Lihat File
                  </Button>
                </Form.Text>
              )}
              <Form.Control
                type="file"
                onChange={(e) => setNotulenFile2(e.target.files[0])}
                disabled={
                  !selectedKegiatan?.documents?.[0]?.documentUrl &&
                  !notulenFile1
                }
              />
              {!selectedKegiatan?.documents?.[0]?.documentUrl &&
                !notulenFile1 && (
                  <Form.Text className="text-muted">
                    Harap isi atau unggah Dokumen 1 terlebih dahulu.
                  </Form.Text>
                )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseEditModal}
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
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showTextViewModal} onHide={handleCloseViewModals} centered>
        <Modal.Header closeButton>
          <Modal.Title className="section-title">
            Catatan Notulensi: {modalContent.nama}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ whiteSpace: "pre-wrap" }}>{modalContent.text}</p>
        </Modal.Body>
      </Modal>

      <Modal
        show={showDocumentModal}
        onHide={handleCloseViewModals}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="section-title">
            Pratinjau Dokumen: {modalContent.nama}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              minHeight: "80vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {selectedKegiatanForView?.documents?.[selectedDocIndex]
              ?.documentType === "image" && (
              <img
                src={
                  selectedKegiatanForView.documents[selectedDocIndex]
                    .documentUrl
                }
                alt="Dokumen"
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            )}
            {selectedKegiatanForView?.documents?.[selectedDocIndex]
              ?.documentType === "pdf" && (
              <div
                className={`shadow pdf-viewer-container ${
                  theme === "dark" ? "rpv-core__viewer--dark" : ""
                }`}
                style={{
                  border: "1px solid #ddd",
                  height: "80vh",
                  width: "90%",
                }}
              >
                <Worker workerUrl="/workers/pdf.worker.min.js">
                  <Viewer
                    fileUrl={
                      selectedKegiatanForView.documents[selectedDocIndex]
                        .documentUrl
                    }
                    plugins={[defaultLayoutPluginInstance]}
                  />
                </Worker>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Notulensi;
