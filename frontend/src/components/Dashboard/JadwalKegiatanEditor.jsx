import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  FloatingLabel,
  CardHeader,
  Spinner,
  Pagination,
  InputGroup,
} from "react-bootstrap";
import Table from "react-bootstrap/Table";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaWhatsapp,
  FaSave,
  FaUndo,
} from "react-icons/fa";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { toast } from "react-toastify";
import instance from "../../utils/axios";
import useCustomSwals from "./useCustomSwals";

const JadwalKegiatanEditor = () => {
  const [kegiatanList, setKegiatanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKegiatan, setNewKegiatan] = useState({
    nama: "",
    tempat: "",
    tanggal: "",
    waktu: "",
    keterangan: "",
  });

  const formatTanggal = (tanggalISO) => {
    const date = new Date(tanggalISO);
    if (isNaN(date.getTime())) {
      return "Tanggal tidak valid";
    }
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("id-ID", options);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(3);
  const { showConfirmSwal, showSuccessSwal, showErrorSwal } = useCustomSwals();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchJadwalKegiatan = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await instance.get("/jadwal-kegiatan");
      const initialList = response.data || [];
      setKegiatanList(initialList);
    } catch (error) {
      toast.error("Gagal mengambil data jadwal kegiatan.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJadwalKegiatan();
  }, [fetchJadwalKegiatan]);

  const sortedList = useMemo(() => {
    return [...kegiatanList].sort((a, b) => {
      const dateTimeB = new Date(`${b.tanggal.substring(0, 10)}T${b.waktu}`);
      const dateTimeA = new Date(`${a.tanggal.substring(0, 10)}T${a.waktu}`);

      return dateTimeB - dateTimeA;
    });
  }, [kegiatanList]);

  const filteredList = useMemo(() => {
    if (!searchTerm) {
      return sortedList;
    }
    return sortedList.filter(
      (kegiatan) =>
        kegiatan.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kegiatan.tempat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (kegiatan.keterangan &&
          kegiatan.keterangan.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, sortedList]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, entriesPerPage]);

  const handleInputChange = (e, itemId = null) => {
    const { name, value } = e.target;
    if (!itemId) {
      setNewKegiatan({ ...newKegiatan, [name]: value });
    } else {
      const updatedList = kegiatanList.map((item) =>
        item._id === itemId ? { ...item, [name]: value } : item
      );
      setKegiatanList(updatedList);
    }
  };

  const handleAddKegiatan = async () => {
    if (
      newKegiatan.nama &&
      newKegiatan.tempat &&
      newKegiatan.tanggal &&
      newKegiatan.waktu
    ) {
      try {
        await instance.post("/jadwal-kegiatan", newKegiatan, {
          withCredentials: true,
        });

        showSuccessSwal("Kegiatan berhasil ditambahkan!");
        fetchJadwalKegiatan();
        setNewKegiatan({
          nama: "",
          tempat: "",
          tanggal: "",
          waktu: "",
          keterangan: "",
        });
      } catch (error) {
        showErrorSwal(
          error.response?.data?.message || "Gagal menambah kegiatan."
        );
      }
    } else {
      showErrorSwal("Harap isi semua kolom untuk menambahkan kegiatan.");
    }
  };

  const handleEditKegiatan = (itemId) => {
    setEditingItemId(itemId);
  };

  const handleCancelEdit = () => {
    fetchJadwalKegiatan();
    setEditingItemId(null);
  };

  const handleSaveKegiatan = async (item) => {
    setIsSubmitting(true);
    try {
      await instance.put(`/jadwal-kegiatan/${item._id}`, item, {
        withCredentials: true,
      });

      showSuccessSwal("Perubahan kegiatan berhasil disimpan!");
      fetchJadwalKegiatan();
      setEditingItemId(null);
    } catch (error) {
      showErrorSwal(
        error.response?.data?.message || "Gagal menyimpan perubahan."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareKegiatan = (item) => {
    const jam = new Date().getHours();
    let ucapanSelamat;
    if (jam >= 4 && jam < 11) {
      ucapanSelamat = "Pagi";
    } else if (jam >= 11 && jam < 15) {
      ucapanSelamat = "Siang";
    } else if (jam >= 15 && jam < 18) {
      ucapanSelamat = "Sore";
    } else {
      ucapanSelamat = "Malam";
    }

    const tanggalKegiatan = new Date(item.tanggal);
    const hari = tanggalKegiatan.toLocaleDateString("id-ID", {
      weekday: "long",
    });
    const tanggalFormatted = tanggalKegiatan.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const pesan = `Assalamualaikum Wr. Wb.
Selamat ${ucapanSelamat}, Rekan-rekan Karang Taruna DADI BARA.

Dengan hormat, kami mengundang seluruh Anggota Karang Taruna DADI BARA untuk hadir dalam kegiatan:

*Acara:* ${item.nama}

Yang akan dilaksanakan pada:
*Hari:* ${hari}
*Tanggal:* ${tanggalFormatted}
*Pukul:* ${item.waktu} WIB
*Tempat:* ${item.tempat}
*Keterangan:* ${item.keterangan || "_-_"}

Demikian undangan ini kami sampaikan. Atas perhatian dan kehadiran rekan-rekan, kami ucapkan terima kasih.

Hormat kami,
*Pengurus Karang Taruna DADI BARA*
  `;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(pesan)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleDeleteKegiatan = async (itemId) => {
    const isConfirmed = await showConfirmSwal(
      "Yakin ingin menghapus?",
      "Kegiatan ini akan dihapus!"
    );

    if (isConfirmed) {
      try {
        await instance.delete(`/jadwal-kegiatan/${itemId}`, {
          withCredentials: true,
        });

        showSuccessSwal("Kegiatan berhasil dihapus.");
        fetchJadwalKegiatan();
        setEditingItemId(null);
      } catch (error) {
        showErrorSwal(
          error.response?.data?.message || "Gagal menghapus kegiatan."
        );
      }
    }
  };

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredList.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  const totalPages = Math.ceil(filteredList.length / entriesPerPage);
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "50vh" }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Card className="shadow-sm mt-3">
      <CardHeader>
        <h3 className="section-title mb-0">Edit Jadwal Kegiatan</h3>
      </CardHeader>
      <Card.Body>
        <Form>
          <Row className="mb-3">
            <Col md={6} className="mb-2">
              <Form.Label className="text-custom fw-bold">
                Nama Kegiatan:
              </Form.Label>
              <Form.Control
                type="text"
                name="nama"
                value={newKegiatan.nama}
                onChange={(e) => handleInputChange(e)} // Fix: No `index` here
                placeholder="Kegiatan apa yang akan dilakukan"
                required
                minLength={8}
              />
            </Col>
            <Col md={6} className="mb-2">
              <Form.Label className="text-custom fw-bold">
                Nama Tempat:
              </Form.Label>
              <Form.Control
                type="text"
                name="tempat"
                value={newKegiatan.tempat}
                onChange={(e) => handleInputChange(e)} // Fix: No `index` here
                placeholder="dimana tempat dilakukannya kegiatan tersebut"
                required
                minLength={8}
              />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6} className="mb-2">
              <Form.Label className="text-custom fw-bold">
                Tanggal Kegiatan:
              </Form.Label>
              <Form.Control
                type="date"
                name="tanggal"
                value={newKegiatan.tanggal}
                onChange={(e) => handleInputChange(e)}
                required
              />
            </Col>
            <Col md={6} className="mb-2">
              <Form.Label className="text-custom fw-bold">
                Waktu Kegiatan: (WIB)
              </Form.Label>
              <Form.Control
                type="time"
                name="waktu"
                value={newKegiatan.waktu}
                onChange={handleInputChange}
                required
              />
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <FloatingLabel controlId="keteranganInput" label="Keterangan">
              <Form.Control
                as="textarea"
                rows={3}
                name="keterangan"
                value={newKegiatan.keterangan}
                minLength={12}
                onChange={(e) => handleInputChange(e)} // Fix: No `index` here
                placeholder="Keterangan apa saja yg harus atau apa yang akan terjadi pada kegiatan tersebut"
              />
            </FloatingLabel>
          </Form.Group>
          <div className="d-flex justify-content-center m-3">
            <Button
              onClick={handleAddKegiatan}
              variant="success"
              className="w-50 justify-content-center section-subtitle text-light"
            >
              <FaPlus className="me-2" /> Tambah Kegiatan
            </Button>
          </div>
        </Form>

        <hr className="bg-light custom-hr my-4" />

        <h3 className="mb-2 text-custom text-center fw-bold">
          Daftar Kegiatan
        </h3>
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

          <Col xs={12} md={5} lg={4} className="order-2 order-md-3">
            <Form.Control
              type="search"
              placeholder="Cari kegiatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>

          <Col
            xs={12}
            md
            className="order-3 order-md-2 d-flex justify-content-center"
          >
            {filteredList.length > entriesPerPage && (
              <Pagination className="mb-0">
                <Pagination.Prev
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages).keys()].map((number) => (
                  <Pagination.Item
                    key={number + 1}
                    active={number + 1 === currentPage}
                    onClick={() => paginate(number + 1)}
                  >
                    {number + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            )}
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col lg={12}>
            <Table
              striped="columns"
              bordered
              responsive
              className="table-dashboard"
            >
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>Kegiatan</th>
                  <th style={{ whiteSpace: "nowrap" }}>Tempat</th>
                  <th>Tanggal</th>
                  <th>Waktu</th>
                  <th className="th-long">Keterangan</th>
                  <th style={{ whiteSpace: "nowrap" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.map((item) => (
                  <tr key={item._id || item.nama + item.tanggal}>
                    <td
                      className="align-middle text-center"
                      style={{ wordBreak: "break-word" }}
                    >
                      {editingItemId === item._id ? (
                        <Form.Control
                          type="text"
                          name="nama"
                          value={item.nama}
                          onChange={(e) => handleInputChange(e, item._id)}
                        />
                      ) : (
                        item.nama
                      )}
                    </td>
                    <td
                      className="align-middle text-center"
                      style={{ wordBreak: "break-word" }}
                    >
                      {editingItemId === item._id ? (
                        <Form.Control
                          type="text"
                          name="tempat"
                          value={item.tempat}
                          onChange={(e) => handleInputChange(e, item._id)}
                        />
                      ) : (
                        item.tempat
                      )}
                    </td>
                    <td className="align-middle text-center">
                      {editingItemId === item._id ? (
                        <Form.Control
                          type="date"
                          name="tanggal"
                          value={
                            item.tanggal ? item.tanggal.substring(0, 10) : ""
                          }
                          onChange={(e) => handleInputChange(e, item._id)}
                        />
                      ) : (
                        formatTanggal(item.tanggal)
                      )}
                    </td>
                    <td className="align-middle text-center">
                      {editingItemId === item._id ? (
                        <InputGroup>
                          <Form.Control
                            type="time"
                            name="waktu"
                            value={item.waktu}
                            onChange={(e) => handleInputChange(e, item._id)}
                          />
                          <InputGroup.Text>WIB</InputGroup.Text>
                        </InputGroup>
                      ) : (
                        `${item.waktu} WIB`
                      )}
                    </td>
                    <td
                      className="align-middle text-center"
                      style={{ wordBreak: "break-word" }}
                    >
                      {editingItemId === item._id ? (
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="keterangan"
                          value={item.keterangan}
                          onChange={(e) => handleInputChange(e, item._id)}
                        />
                      ) : (
                        item.keterangan
                      )}
                    </td>
                    <td
                      style={{ whiteSpace: "nowrap" }}
                      className="align-middle"
                    >
                      {editingItemId === item._id ? (
                        <div className="d-flex flex-column gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSaveKegiatan(item)}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Spinner size="sm" />
                            ) : (
                              <FaSave className="me-1" />
                            )}{" "}
                            Simpan
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            {" "}
                            <FaUndo className="me-2" />
                            Batal
                          </Button>
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          <>
                            <Button
                              variant="warning"
                              className="w-100 me-1"
                              onClick={() => handleEditKegiatan(item._id)}
                            >
                              <FaEdit /> Edit
                            </Button>
                            <Button
                              variant="success"
                              className="w-100"
                              style={{
                                backgroundColor: "#25D366",
                                border: "none",
                              }}
                              onClick={() => handleShareKegiatan(item)}
                            >
                              <FaWhatsapp /> Bagikan
                            </Button>
                            <Button
                              variant="danger"
                              className="w-100"
                              onClick={() => handleDeleteKegiatan(item._id)}
                            >
                              <FaTrash /> Hapus
                            </Button>
                          </>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default JadwalKegiatanEditor;
