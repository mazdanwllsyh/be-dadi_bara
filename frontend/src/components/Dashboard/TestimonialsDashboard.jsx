import React, { useState, useEffect, useContext, useMemo } from "react";
import { Card, Button, Spinner, Badge, Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { FaArchive, FaEye, FaStar } from "react-icons/fa";
import { UserContext } from "../LandingPage/UserContext";
import { AppContext } from "../LandingPage/AppContext";
import { toast } from "react-toastify";
import moment from "moment";
import instance from "../../utils/axios";

const TestimonialsDashboard = () => {
  const { user } = useContext(UserContext);
  const { theme } = useContext(AppContext);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const isDark = theme === "dark";

  const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      setIsNarrowScreen(window.innerWidth < 992);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const customStyles = {
    tableWrapper: {
      style: {
        borderRadius: "12px",
        overflow: "hidden",
        overflowX: isNarrowScreen ? "auto" : "hidden",
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
        "&:hover": {
          backgroundColor: "rgba(0,0,0,0.04)",
        },
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
        padding: "12px",
      },
    },
    pagination: {
      style: {
        justifyContent: "flex-end",
        padding: "10px 0",
        borderTop: "1px solid #dee2e6",
      },
    },
    noData: {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--bs-secondary-color)", // Warna teks adaptif
        backgroundColor: "var(--bs-body-bg)", // Latar belakang adaptif
        padding: "24px",
      },
    },
    subHeader: {
      style: {
        display: "flex",
        color: "var(--bs-secondary-color)",
        backgroundColor: "var(--bs-body-bg)",
      },
    },
    progressComponent: {
      style: {
        display: "flex",
        color: "var(--bs-secondary-color)",
        backgroundColor: "var(--bs-body-bg)",
      },
    },
  };

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter(
      (t) =>
        t.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [testimonials, searchTerm]);

  const fetchAllTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await instance.get("/testimonials/admin", {
        withCredentials: true,
      });
      setTestimonials(response.data.testimonials);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal memuat data testimoni."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "superAdmin") {
      fetchAllTestimonials();
    }
  }, [user]);

  const handleToggleArchive = async (id) => {
    try {
      await instance.patch(
        `/testimonials/${id}/archive`,
        {},
        { withCredentials: true }
      );
      toast.success("Status testimoni berhasil diubah!");
      fetchAllTestimonials();
    } catch (error) {
      toast.error("Gagal mengubah status testimoni.");
    }
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "50px",
    },
    {
      name: "Nama",
      selector: (row) => row.user?.fullName || "Пользователи 不 NEIN",
      sortable: true,
      width: "180px",
    },
    {
      name: "Rating",
      selector: (row) => row.rating,
      sortable: true,
      cell: (row) => (
        <div>
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} color={i < row.rating ? "gold" : "#e4e5e9"} />
          ))}
        </div>
      ),
    },
    {
      name: "Pesan",
      selector: (row) => row.message,
      grow: 2,
      wrap: true,
      width: "500px",
      style: {
        textAlign: "justify",
        justifyContent: "flex-start",
      },
    },
    {
      name: "Waktu",
      selector: (row) => moment(row.createdAt).format("DD/MM/YY HH:mm"),
      sortable: true,
      width: "150px",
    },
    {
      name: "Status",
      selector: (row) => row.isArchived,
      sortable: true,
      cell: (row) =>
        row.isArchived ? (
          <Badge bg="secondary">Diarsipkan</Badge>
        ) : (
          <Badge bg="success">Aktif</Badge>
        ),
    },
    {
      name: "Aksi",
      width: "150px",
      cell: (row) => (
        <Button
          variant={row.isArchived ? "info" : "secondary"}
          size="sm"
          onClick={() => handleToggleArchive(row._id)}
        >
          {row.isArchived ? (
            <>
              <FaEye className="me-1" /> Aktifkan
            </>
          ) : (
            <>
              <FaArchive className="me-1" /> Arsipkan
            </>
          )}
        </Button>
      ),
    },
  ];

  const conditionalRowStyles = [
    {
      when: (row) => row.isArchived,
      style: {
        opacity: 0.6,
      },
    },
  ];

  const subHeaderComponent = useMemo(() => {
    return (
      <Form.Control
        type="search"
        placeholder="Cari Nama atau Pesan..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ maxWidth: "250px" }}
      />
    );
  }, [searchTerm]);

  return (
    <Card className="shadow-sm mt-4">
      <Card.Header>
        <h3 className="section-title mb-0">Manajemen Testimoni</h3>
      </Card.Header>
      <Card.Body className="p-3">
        <DataTable
          columns={columns}
          data={filteredTestimonials}
          customStyles={customStyles}
          pagination
          paginationPerPage={5}
          paginationRowsPerPageOptions={[5, 12, 30, 75, 100]}
          paginationComponentOptions={{
            rowsPerPageText: "Baris per halaman:",
            rangeSeparatorText: "dari",
          }}
          progressPending={isLoading}
          subHeader
          subHeaderComponent={subHeaderComponent}
          subHeaderAlign="right"
          progressComponent={
            <div className="my-5">
              <Spinner />
            </div>
          }
          conditionalRowStyles={conditionalRowStyles}
          highlightOnHover
          noDataComponent={
            <div className="text-center my-5">
              <h3 className="SF-UIDisplay text-danger">
                Tidak Ada Data untuk Ditampilkan
              </h3>
              <p>Saat ini belum ada data yang tersedia di dalam tabel ini.</p>
            </div>
          }
        />
      </Card.Body>
    </Card>
  );
};

export default TestimonialsDashboard;
