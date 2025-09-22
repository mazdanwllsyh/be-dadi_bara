import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Container,
  Card,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Offcanvas,
  Modal,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { FaFileAlt, FaEdit, FaTrash, FaFilePdf } from "react-icons/fa";
import { GiReceiveMoney, GiPayMoney, GiTakeMyMoney } from "react-icons/gi";
import { toast } from "react-toastify";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { AppContext } from "../LandingPage/AppContext";
import instance from "../../utils/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CSVLink } from "react-csv";
import useCustomSwals from "./useCustomSwals";

const KeuanganDashboard = () => {
  const { data, theme } = useContext(AppContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  const customStyles = {
    tableWrapper: {
      style: {
        borderRadius: "12px",
        overflowX: isMobile ? "auto" : "hidden",
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

  const [transactions, setTransactions] = useState([]);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: "",
    amount: "",
    description: "",
    date: new Date().toISOString().slice(0, 10), // Tambah 'date' dengan tanggal hari ini
  });
  const { showConfirmSwal, showSuccessSwal, showErrorSwal } = useCustomSwals();
  const [filterTime, setFilterTime] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [editedTransaction, setEditedTransaction] = useState({
    type: "",
    amount: "",
    description: "",
    date: "", // Tambah 'date'
  });
  const [newDocumentFile, setNewDocumentFile] = useState(null);
  const [editedDocumentFile, setEditedDocumentFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [modalDocument, setModalDocument] = useState({ url: null, type: null });

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await instance.get("/keuangan", {
        withCredentials: true,
      });
      setTransactions(response.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal memuat data transaksi."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fetchTransactions]);

  const filteredTransactions = transactions.filter((t) => {
    const filterByTime = () => {
      if (filterTime === "all") return true;
      const transactionDate = new Date(t.date);
      const now = new Date();
      const currentYear = now.getFullYear();

      switch (filterTime) {
        case "today":
          return transactionDate.toDateString() === now.toDateString();
        case "thisWeek":
          {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            return (
              transactionDate >= startOfWeek && transactionDate <= endOfWeek
            );
          }
          if (filterTime === "thisYear") {
            return transactionDate.getFullYear() === now.getFullYear();
          }
        case "thisMonth":
          return (
            transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() === now.getFullYear()
          );
        case "lastMonth": {
          const lastMonth = new Date(now);
          lastMonth.setMonth(now.getMonth() - 1);
          return (
            transactionDate.getMonth() === lastMonth.getMonth() &&
            transactionDate.getFullYear() === lastMonth.getFullYear()
          );
        }
        case "lastYear":
          return transactionDate.getFullYear() === currentYear - 1;
        case String(currentYear - 2):
          return transactionDate.getFullYear() === currentYear - 2;
        default:
          return true;
      }
    };

    const filterByType = () => {
      if (filterType === "all") return true;

      if (filterType === "Pemasukan") {
        return t.type === "Pemasukan" || t.type === "Pemasukkan";
      }

      return t.type === filterType;
    };

    const filterBySearch = () => {
      const searchLower = searchTerm.toLowerCase();
      const description = t.description || "";
      const type = t.type || "";
      const amount = t.amount ? t.amount.toString() : "";
      return (
        t.description.toLowerCase().includes(searchLower) ||
        t.type.toLowerCase().includes(searchLower) ||
        t.amount.toString().includes(searchLower)
      );
    };

    return filterByTime() && filterByType() && filterBySearch();
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "Pemasukan" || t.type === "Pemasukkan")
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === "Pengeluaran")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalBalance = totalIncome - totalExpense;
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  const handleNewInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setNewTransaction((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setNewTransaction((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setEditedTransaction((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setEditedTransaction((prev) => ({ ...prev, [name]: value }));
    }
  };

  const formatNumber = (value) => {
    if (!value) return "";
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) return "";
    return new Intl.NumberFormat("id-ID").format(numericValue);
  };

  const handleNewDocumentUpload = (e) => {
    const file = e.target.files[0];
    setNewDocumentFile(file);
  };
  const handleEditDocumentUpload = (e) => {
    const file = e.target.files[0];
    setEditedDocumentFile(file);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("type", newTransaction.type);
    formData.append("amount", newTransaction.amount);
    formData.append("description", newTransaction.description);
    formData.append("date", newTransaction.date); // Kirim 'date' ke backend
    if (newDocumentFile) {
      formData.append("document", newDocumentFile);
    }

    try {
      await instance.post("/keuangan", formData, { withCredentials: true });
      toast.success("Transaksi berhasil ditambahkan!");
      fetchTransactions();
      setShowAddTransaction(false);
      setNewTransaction({
        type: "",
        amount: "",
        description: "",
        date: new Date().toISOString().slice(0, 10),
      });
      setNewDocumentFile(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal menambahkan transaksi."
      );
    }
  };

  const handleEditTransaction = (id) => {
    const transactionToEdit = transactions.find((t) => t._id === id);
    if (transactionToEdit) {
      setEditingTransactionId(id);
      setEditedTransaction({
        ...transactionToEdit,
        date: new Date(transactionToEdit.date).toISOString().slice(0, 10),
      });
      setEditedDocumentFile(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTransactionId) {
      toast.error("ID Transaksi tidak ditemukan, tidak bisa menyimpan.");
      return;
    }

    const formData = new FormData();
    formData.append("type", editedTransaction.type);
    formData.append("amount", editedTransaction.amount);
    formData.append("description", editedTransaction.description);
    formData.append("date", editedTransaction.date);

    if (editedDocumentFile) {
      formData.append("document", editedDocumentFile);
    }

    try {
      await instance.put(`/keuangan/${editingTransactionId}`, formData, {
        withCredentials: true,
      });

      toast.success("Transaksi berhasil diperbarui!");
      fetchTransactions();
      setEditingTransactionId(null);
      setEditedTransaction({ type: "", amount: "", description: "", date: "" });
      setEditedDocumentFile(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal memperbarui transaksi."
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
    setEditedTransaction({ type: "", amount: "", description: "", date: "" });
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "-";
    }
    const options = {
      day: "2-digit",
      month: "long",
      year: "numeric",
    };
    return new Intl.DateTimeFormat("id-ID", options).format(
      new Date(dateString)
    );
  };

  const handleDeleteTransaction = async (id) => {
    const isConfirmed = await showConfirmSwal(
      "Yakin ingin menghapus?",
      "Apakah Anda yakin ingin menghapus Data Transaksi ini?"
    );

    if (isConfirmed) {
      try {
        await instance.delete(`/keuangan/${id}`, { withCredentials: true });
        showSuccessSwal("Transaksi berhasil dihapus!");
        fetchTransactions();
      } catch (error) {
        showErrorSwal(
          error.response?.data?.message || "Gagal menghapus transaksi."
        );
      }
    }
  };

  const handleViewDocument = (documentUrl) => {
    if (!documentUrl) return;

    const fileExtension = documentUrl.split(".").pop().toLowerCase();
    let fileType = "image";

    if (fileExtension === "pdf") {
      fileType = "pdf";
    } else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
      fileType = "image";
    } else {
      alert("Tipe dokumen tidak didukung.");
      return;
    }

    setModalDocument({ url: documentUrl, type: fileType });
    setShowDocumentModal(true);
  };

  const handleCloseDocumentModal = () => {
    setShowDocumentModal(false);
    setModalDocument({ url: null, type: null });
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "50px",
    },
    {
      name: "Jenis",
      width: "150px",
      selector: (row) => row.type,
      sortable: true,
      cell: (row) =>
        editingTransactionId === row._id ? (
          <Form.Control
            as="select"
            size="sm"
            name="type"
            value={editedTransaction.type}
            onChange={handleEditInputChange}
          >
            <option value="Pemasukan">Pemasukan</option>
            <option value="Pengeluaran">Pengeluaran</option>
          </Form.Control>
        ) : (
          row.type
        ),
    },
    {
      name: "Jumlah",
      width: "200px",
      selector: (row) => row.amount,
      sortable: true,
      cell: (row) =>
        editingTransactionId === row._id ? (
          <Form.Control
            type="number"
            size="sm"
            name="amount"
            value={editedTransaction.amount}
            onChange={handleEditInputChange}
          />
        ) : (
          `Rp ${row.amount.toLocaleString("id-ID")}`
        ),
    },
    {
      name: "Deskripsi",
      width: "250px",
      selector: (row) => row.description,
      grow: 2,
      wrap: true,
      cell: (row) =>
        editingTransactionId === row._id ? (
          <Form.Control
            as="textarea"
            size="sm"
            name="description"
            value={editedTransaction.description}
            onChange={handleEditInputChange}
          />
        ) : (
          row.description
        ),
    },
    {
      name: "Tanggal",
      width: "180px",
      selector: (row) => row.date,
      sortable: true,
      cell: (row) =>
        editingTransactionId === row._id ? (
          <Form.Control
            type="date"
            size="sm"
            name="date"
            value={editedTransaction.date}
            onChange={handleEditInputChange}
          />
        ) : (
          formatDate(row.date) // Gunakan formatDate
        ),
    },
    {
      name: "Bukti",
      cell: (row) => (
        <>
          {row.document && editingTransactionId !== row._id && (
            <Button
              variant="primary"
              className="w-100 my-2"
              onClick={() => handleViewDocument(row.document)}
            >
              <FaFileAlt /> Lihat
            </Button>
          )}
          {editingTransactionId === row._id && (
            <Form.Control
              type="file"
              size="sm"
              onChange={handleEditDocumentUpload}
            />
          )}
          {!row.document && editingTransactionId !== row._id && "-"}
        </>
      ),
    },
    {
      name: "Aksi",
      button: true,
      width: "150px",
      cell: (row) =>
        editingTransactionId === row._id ? (
          <div className="d-flex flex-column gap-2 my-2">
            <Button variant="success" size="sm" onClick={handleSaveEdit}>
              Simpan
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
              Batal
            </Button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2 py-2">
            <Button
              variant="warning"
              size="sm"
              onClick={() => handleEditTransaction(row._id)}
            >
              <FaEdit /> Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteTransaction(row._id)}
            >
              <FaTrash /> Hapus
            </Button>
          </div>
        ),
    },
  ];

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumns = ["Tanggal", "Jenis", "Deskripsi", "Jumlah (Rp)"];
    const tableRows = [];

    filteredTransactions.forEach((item) => {
      const itemData = [
        new Date(item.date).toLocaleDateString("id-ID"),
        item.type,
        item.description,
        item.amount.toLocaleString("id-ID"),
      ];
      tableRows.push(itemData);
    });

    doc.setFontSize(18);
    doc.text("Laporan Keuangan Karang Taruna DADI BARA", 14, 22);

    doc.setFontSize(12);
    const filterName = getIndonesianFilterName(filterTime);
    doc.text(`Periode: ${filterName}`, 14, 30);

    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 35,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 10,
      },
      headStyles: {
        fillColor: [41, 128, 185], // Warna header kolom
        textColor: 255,
        fontStyle: "bold",
      },
    });

    const finalY = doc.lastAutoTable.finalY;

    doc.setFontSize(11);
    doc.text(
      `Total Pemasukan: Rp ${totalIncome.toLocaleString("id-ID")}`,
      14,
      finalY + 10
    );
    doc.text(
      `Total Pengeluaran: Rp ${totalExpense.toLocaleString("id-ID")}`,
      14,
      finalY + 17
    );
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Saldo Akhir: Rp ${totalBalance.toLocaleString("id-ID")}`,
      14,
      finalY + 24
    );

    const date = new Date().toISOString().slice(0, 10);
    const fileName = `Laporan_Keuangan_${filterName}_${date}.pdf`;

    doc.save(fileName);
  };

  const csvHeaders = [
    { label: "Tanggal", key: "tanggal" },
    { label: "Jenis", key: "jenis" },
    { label: "Deskripsi", key: "deskripsi" },
    { label: "Jumlah", key: "jumlah" },
  ];

  const getIndonesianFilterName = (filter) => {
    const now = new Date();
    const currentYear = now.getFullYear();

    switch (filter) {
      case "all":
        return "Semua Waktu";
      case "today":
        return "Hari Ini";
      case "thisWeek":
        return "Minggu Ini";
      case "thisMonth":
        return "Bulan Ini";
      case "lastMonth":
        return "Bulan Kemarin";
      case "thisYear":
        return `Tahun ${currentYear}`;
      case "lastYear":
        return `Tahun ${currentYear - 1}`;
      default:
        if (!isNaN(filter)) {
          return `Tahun ${filter}`;
        }
        return "Semua Waktu";
    }
  };

  const csvData = filteredTransactions.map((t) => ({
    tanggal: new Date(t.date).toLocaleDateString("id-ID"),
    jenis: t.type,
    deskripsi: t.description,
    jumlah: t.amount,
  }));

  const getCsvFileName = () => {
    const date = new Date().toISOString().slice(0, 10);
    const filterName = getIndonesianFilterName(filterTime);
    return `Laporan_Keuangan_${filterName}_${date}.csv`;
  };

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

  const currentYear = new Date().getFullYear();

  return (
    <>
      <Container className="dashboard-container my-3">
        <Card className="shadow">
          <Card.Header className="bg-secondary text-light">
            <h5 className="mb-0 section-title">
              Dashboard Keuangan {data.namaOrganisasi}
            </h5>
          </Card.Header>
          <Card.Body className="p-3">
            {/* Bagian Card Pemasukan, Pengeluaran, Saldo (tidak berubah) */}
            <Row className="mb-3 row-cols-1 row-cols-md-3 g-3">
              <Col>
                <Card className="bg-success text-white shadow-sm h-100">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div className="text-start">
                      <h5 className="fw-bold text-light SF-UIDisplay">
                        Total Pemasukan
                      </h5>
                      <h2 className="text-code fw-bold">
                        Rp. {totalIncome.toLocaleString("id-ID")}
                      </h2>
                    </div>
                    <GiReceiveMoney size={40} style={{ opacity: 0.8 }} />
                  </Card.Body>
                </Card>
              </Col>

              <Col>
                <Card className="bg-danger text-white shadow-sm h-100">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div className="text-start">
                      <h5 className="fw-bold text-light SF-UIDisplay">
                        Total Pengeluaran
                      </h5>
                      <h2 className="text-code fw-bold">
                        Rp. {totalExpense.toLocaleString("id-ID")}
                      </h2>
                    </div>
                    <GiPayMoney size={40} style={{ opacity: 0.8 }} />
                  </Card.Body>
                </Card>
              </Col>

              <Col>
                <Card className="bg-info text-dark shadow-sm h-100">
                  <Card.Body className="d-flex justify-content-between align-items-center">
                    <div className="text-start">
                      <h5 className="fw-bold text-dark SF-UIDisplay">
                        Saldo Total
                      </h5>
                      <h2 className="text-code fw-bold">
                        Rp. {totalBalance.toLocaleString("id-ID")}
                      </h2>
                    </div>
                    <GiTakeMyMoney size={40} style={{ opacity: 0.8 }} />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Row className="justify-content-between align-items-center mb-3 g-2">
              <Col
                xs={12}
                md="auto"
                className="d-flex justify-content-center justify-content-md-start gap-2"
              >
                <Form.Control
                  as="select"
                  value={filterTime}
                  onChange={(e) => setFilterTime(e.target.value)}
                  style={{ width: "auto" }}
                >
                  <option value="all">Semua Waktu</option>
                  <option value="today">Hari Ini</option>
                  <option value="thisWeek">Minggu Ini</option>
                  <option value="thisMonth">Bulan Ini</option>
                  <option value="lastMonth">Bulan Kemarin</option>
                  <option value="thisYear">Tahun {currentYear}</option>
                  <option value="lastYear">Tahun ({currentYear - 1})</option>
                  <option value={currentYear - 2}>
                    Tahun ({currentYear - 2})
                  </option>
                </Form.Control>

                <Form.Control
                  as="select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{ width: "auto" }}
                >
                  <option value="all">Semua Jenis</option>
                  <option value="Pemasukan">Pemasukan</option>
                  <option value="Pengeluaran">Pengeluaran</option>
                </Form.Control>
              </Col>
              <Col
                xs={12}
                md={4}
                className="d-flex justify-content-center justify-content-md-end"
              >
                <Form.Control
                  type="search"
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mt-2 text-custom fw-bold mb-3">
                Rincian Transaksi
              </h4>

              <div className="d-flex gap-2">
                {filteredTransactions.length > 0 && (
                  <CSVLink
                    data={csvData}
                    headers={csvHeaders}
                    filename={getCsvFileName()}
                    className="btn btn-success"
                    target="_blank"
                    separator={";"}
                  >
                    Download CSV
                  </CSVLink>
                )}
                {filteredTransactions.length > 0 && (
                  <Button variant="danger" onClick={handleExportPDF}>
                    <FaFilePdf className="me-1" /> Download PDF
                  </Button>
                )}
              </div>
            </div>
            <DataTable
              columns={columns}
              data={filteredTransactions}
              customStyles={customStyles}
              striped
              pagination
              paginationPerPage={5}
              paginationRowsPerPageOptions={[15, 30, 60, 100, 150]}
              onChangeRowsPerPage={(newPerPage) =>
                setEntriesPerPage(newPerPage)
              }
              paginationComponentOptions={{
                rowsPerPageText: "Baris per halaman:",
                rangeSeparatorText: "dari",
              }}
              highlightOnHover
              noDataComponent={
                <div className="text-center my-5">
                  <h3 className="SF-UIDisplay text-danger">
                    Tidak Ada Data untuk Ditampilkan
                  </h3>
                  <p>
                    Saat ini belum ada data yang tersedia di dalam tabel ini.
                  </p>
                </div>
              }
            />

            <div className="d-flex justify-content-center">
              <Button
                variant="secondary"
                onClick={() => setShowAddTransaction(!showAddTransaction)}
                className="w-50 mt-3"
              >
                {showAddTransaction ? "Tutup Form" : "Tambah Transaksi Baru"}
              </Button>
            </div>
            {showAddTransaction && (
              <Card className="mt-3">
                <Card.Header>
                  <h5 className="text-custom text-center fw-bold text-body-emphasis">
                    Tambah Transaksi Baru
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleAddTransaction}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="text-custom fw-bold">
                            Jenis Transaksi
                          </Form.Label>
                          <Form.Control
                            as="select"
                            name="type"
                            value={newTransaction.type}
                            onChange={handleNewInputChange}
                            required
                            className="text-center"
                          >
                            <option value="" disabled>
                              Pemasukan atau Pengeluaran?
                            </option>
                            <option value="Pemasukan">Pemasukan</option>
                            <option value="Pengeluaran">Pengeluaran</option>
                          </Form.Control>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="text-custom fw-bold">
                            Jumlah (Rp)
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="amount"
                            value={formatNumber(newTransaction.amount)}
                            onChange={handleNewInputChange}
                            placeholder="Contoh: 500.000"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="text-custom fw-bold">
                            Deskripsi
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="description"
                            value={newTransaction.description}
                            onChange={handleNewInputChange}
                            required
                            placeholder="Untuk apa?"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="text-custom fw-bold">
                            Tanggal Transaksi
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="date"
                            value={newTransaction.date}
                            onChange={handleNewInputChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-custom fw-bold">
                        Unggah Bukti Dokumen
                      </Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*, application/pdf, application/msword"
                        onChange={handleNewDocumentUpload}
                      />
                      {newDocumentFile && (
                        <Form.Text className="text-muted">
                          File terpilih: {newDocumentFile.name}
                        </Form.Text>
                      )}
                    </Form.Group>
                    <Button variant="primary" type="submit">
                      Simpan Transaksi
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            )}
          </Card.Body>
        </Card>
      </Container>

      <Modal
        show={showDocumentModal}
        onHide={handleCloseDocumentModal}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title className="section-title">Dokumen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{ minHeight: "80vh" }}
          >
            {modalDocument.type === "image" && modalDocument.url && (
              <img
                src={modalDocument.url}
                alt="Dokumen Transaksi"
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            )}
            {modalDocument.type === "pdf" && modalDocument.url && (
              <div
                className={`shadow pdf-viewer-container ${
                  theme === "dark" ? "rpv-core__viewer--dark" : ""
                }`}
                style={{
                  border: "1px solid #ddd",
                  height: "80vh",
                  width: "100%",
                }}
              >
                <Worker workerUrl="/workers/pdf.worker.min.js">
                  <Viewer
                    fileUrl={modalDocument.url}
                    plugins={[defaultLayoutPluginInstance]}
                  />
                </Worker>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDocumentModal}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default KeuanganDashboard;
