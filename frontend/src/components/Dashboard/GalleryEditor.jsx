import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Form,
  Row,
  Col,
  Image,
  Spinner,
  Pagination,
} from "react-bootstrap";
import TestimonialsDashboard from "./TestimonialsDashboard";
import { FaEdit, FaTrash, FaPlus, FaSave, FaUndo } from "react-icons/fa";
import { toast } from "react-toastify";
import instance from "../../utils/axios.js";
import { usePagination, DOTS } from "../usePagination.jsx";
import useCustomSwals from "./useCustomSwals.jsx";

const GalleryEditor = () => {
  const [images, setImages] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editedImage, setEditedImage] = useState({
    _id: null,
    src: "",
    title: "",
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const { showConfirmSwal, showSuccessSwal, showErrorSwal } = useCustomSwals();
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(3);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageTitle, setNewImageTitle] = useState("");
  const [newImageDescription, setNewImageDescription] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await instance.get("/gallery");
      setImages(response.data);
    } catch (error) {
      toast.error("Gagal memuat gambar galeri.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fetchImages]);

  const handleEdit = (image) => {
    setIsEditing(image._id);
    setEditedImage({ ...image });
    setImagePreview(image.src);
    setNewImageFile(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setImagePreview(null);
    setNewImageFile(null);
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        showErrorSwal("Ukuran file tidak boleh melebihi 5MB.");
        e.target.value = null;
        return;
      }
      setNewImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedImage({ ...editedImage, [name]: value });
  };

  const handleSave = async () => {
    setIsSavingEdit(true);

    if (newImageFile && newImageFile.size > 5 * 1024 * 1024) {
      showErrorSwal("Gagal menyimpan. Ukuran file melebihi 5MB.");
      setIsSavingEdit(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", editedImage.title);
    formData.append("description", editedImage.description);
    if (newImageFile) {
      formData.append("image", newImageFile);
    }

    try {
      await instance.put(`/gallery/${editedImage._id}`, formData, {
        withCredentials: true,
      });
      showSuccessSwal("Gambar berhasil diperbarui!");
      fetchImages();
      setIsEditing(null);
      setNewImageFile(null);
    } catch (error) {
      showErrorSwal("Gagal memperbarui gambar.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (imageId) => {
    const isConfirmed = await showConfirmSwal(
      "Yakin ingin menghapus?",
      "Apakah Anda yakin ingin menghapus Gambar dari Galeri?"
    );

    if (isConfirmed) {
      try {
        await instance.delete(`/gallery/${imageId}`, {
          withCredentials: true,
        });
        showSuccessSwal("Gambar berhasil dihapus.");
        fetchImages();
      } catch (error) {
        showErrorSwal("Gagal menghapus gambar.");
      }
    }
  };

  const handleAddNewImage = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", newImageTitle);
    formData.append("description", newImageDescription);

    if (newImageFile) {
      formData.append("image", newImageFile);
    } else if (newImageUrl) {
      formData.append("src", newImageUrl);
    } else {
      showErrorSwal("Harap pilih file .jpg .png.");
      return;
    }

    try {
      await instance.post("/gallery", formData, { withCredentials: true });
      showSuccessSwal("Gambar berhasil ditambahkan!");
      fetchImages();
      setNewImageFile(null);
      setNewImageUrl("");
      setNewImageTitle("");
      setNewImageDescription("");
    } catch (error) {
      showErrorSwal("Gagal menambahkan gambar. Periksa Ukurannya!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredImages = useMemo(() => {
    return images.filter(
      (image) =>
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (image.description &&
          image.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, images]);

  const paginationRange = usePagination({
    currentPage,
    totalCount: filteredImages.length,
    siblingCount: 1,
    pageSize: entriesPerPage,
  });

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentImages = filteredImages.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  const previewStyle = {
    maxWidth: isMobile ? "100%" : "60%",
    maxHeight: isMobile ? "250px" : "250px",
    objectFit: "cover",
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "90vh" }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container className="dashboard-container my-4">
      <Card className="shadow">
        <Card.Header>
          <h5 className="mb-0 section-title">Manajemen Galeri</h5>
        </Card.Header>
        <Card.Body className="p-3">
          <Row className="justify-content-between align-items-center mb-3 g-3">
            {/* Kolom Tampilkan Entri */}
            <Col xs={12} md="auto" className="order-1">
              <div className="d-flex justify-content-center justify-content-md-start align-items-center">
                <Form.Label className="mb-0 me-2">Tampilkan</Form.Label>
                <Form.Select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{ width: "80px" }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </Form.Select>
                <span className="ms-2">entri</span>
              </div>
            </Col>

            <Col xs={12} md={5} lg={4} className="order-2 order-md-3">
              <Form.Control
                type="search"
                placeholder="Cari judul atau deskripsi..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </Col>

            <Col
              xs={12}
              md
              className="order-3 order-md-2 d-flex justify-content-center"
            >
              {paginationRange && paginationRange.length > 1 && (
                <Pagination className="mb-0">
                  <Pagination.First
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  />

                  {paginationRange.map((pageNumber, index) => {
                    if (pageNumber === DOTS) {
                      return (
                        <Pagination.Ellipsis key={`dots-${index}`} disabled />
                      );
                    }
                    return (
                      <Pagination.Item
                        key={pageNumber}
                        active={pageNumber === currentPage}
                        onClick={() => paginate(pageNumber)}
                      >
                        {pageNumber}
                      </Pagination.Item>
                    );
                  })}

                  <Pagination.Next
                    onClick={() => paginate(currentPage + 1)}
                    disabled={
                      currentPage ===
                      paginationRange[paginationRange.length - 1]
                    }
                  />
                  <Pagination.Last
                    onClick={() =>
                      paginate(paginationRange[paginationRange.length - 1])
                    }
                    disabled={
                      currentPage ===
                      paginationRange[paginationRange.length - 1]
                    }
                  />
                </Pagination>
              )}
            </Col>
          </Row>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th className="th-short">#</th>
                <th>Pratinjau</th>
                <th>Judul</th>
                <th className="th-long">Deskripsi</th>
                <th className="w-auto">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentImages.map((image, index) => (
                <tr key={image._id}>
                  <td className="align-middle text-center">
                    {indexOfFirstEntry + index + 1}
                  </td>
                  <td className="align-middle text-center">
                    {isEditing === image._id ? (
                      <>
                        {imagePreview && (
                          <Image
                            src={imagePreview}
                            alt="Pratinjau baru"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "80px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <Form.Control
                          type="file"
                          size="sm"
                          className="mt-2"
                          onChange={handleEditFileChange}
                        />
                      </>
                    ) : (
                      <Image
                        src={image.src}
                        alt={image.title}
                        style={{
                          maxWidth: "100px",
                          maxHeight: "80px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </td>
                  <td className="align-middle text-center">
                    {isEditing === image._id ? (
                      <Form.Control
                        type="textarea"
                        name="title"
                        value={editedImage.title}
                        onChange={handleInputChange}
                        className="w-100"
                      />
                    ) : (
                      image.title
                    )}
                  </td>
                  <td className="align-middle text-center">
                    {isEditing === image._id ? (
                      <Form.Control
                        as="textarea"
                        name="description"
                        value={editedImage.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-100"
                      />
                    ) : (
                      image.description
                    )}
                  </td>
                  <td className="align-middle text-center">
                    {isEditing === image._id ? (
                      <div className="d-flex flex-column gap-2">
                        <Button
                          variant="success"
                          onClick={handleSave}
                          className="w-100"
                          size="sm"
                          disabled={isSavingEdit}
                        >
                          {isSavingEdit ? (
                            <Spinner size="sm" />
                          ) : (
                            <>
                              <FaSave className="me-1" /> Simpan
                            </>
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={handleCancelEdit}
                          className="w-100"
                          size="sm"
                        >
                          <FaUndo className="me-1" /> Batal
                        </Button>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleEdit(image)}
                          className="w-100 d-flex align-items-center justify-content-center"
                        >
                          <FaEdit className="me-2" /> Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(image._id)}
                          className="w-100 d-flex align-items-center justify-content-center"
                        >
                          <FaTrash className="me-2" /> Hapus
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <h3 className="mt-4 mb-3 text-custom text-center fw-bold">
            Tambah Gambar Baru
          </h3>
          <Form onSubmit={handleAddNewImage}>
            {newImageFile && (
              <div className="text-center mb-3">
                <p className="mb-1 text-muted">Pratinjau Gambar:</p>
                <Image
                  src={URL.createObjectURL(newImageFile)}
                  alt="Pratinjau"
                  thumbnail
                  style={previewStyle}
                  className="shadow"
                />
              </div>
            )}
            <Row>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label className="text-custom fw-bold">
                    Tambah Gambar:
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewImageFile(e.target.files[0])}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label className="text-custom fw-bold">Judul</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Masukkan judul gambar"
                    value={newImageTitle}
                    onChange={(e) => setNewImageTitle(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <Form.Group className="mb-3">
                  <Form.Label className="text-custom fw-bold">
                    Deskripsi
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Masukkan deskripsi gambar"
                    value={newImageDescription}
                    onChange={(e) => setNewImageDescription(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-center">
              <Button
                type="submit"
                className="btn-success w-50 align-content-center section-subtitle text-light"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <FaPlus className="me-2" /> Tambah Gambar
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <TestimonialsDashboard />
    </Container>
  );
};

export default GalleryEditor;
