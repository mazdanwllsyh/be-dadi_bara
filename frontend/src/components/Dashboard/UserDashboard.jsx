import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  Container,
  Card,
  Form,
  Button,
  CardHeader,
  Spinner,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { FaTrash, FaWhatsapp } from "react-icons/fa";
import Sidebar from "./Sidebar";
import { UserContext } from "../LandingPage/UserContext";
import { toast } from "react-toastify";
import instance from "../../utils/axios.js";
import useCustomSwals from "./useCustomSwals.jsx";

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
  pagination: {
    style: {
      justifyContent: "flex-end",
      padding: "10px 0",
      borderTop: "1px solid #dee2e6",
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

const UserDashboard = () => {
  const { user: loggedInUser } = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const { showConfirmSwal, showSuccessSwal, showErrorSwal } = useCustomSwals();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await instance.get("/auth/users", {
        withCredentials: true,
      });
      setUsers(response.data.users);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal memuat data pengguna."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loggedInUser?.role === "admin" || loggedInUser?.role === "superAdmin") {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  }, [loggedInUser, fetchUsers]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDeleteUser = async (userId) => {
    const isConfirmed = await showConfirmSwal(
      "Yakin ingin menghapus?",
      "Pengguna ini akan dihapus secara permanen!"
    );

    if (isConfirmed) {
      try {
        await instance.delete(`/auth/users/${userId}`, {
          withCredentials: true,
        });
        showSuccessSwal("Berhasil!", "Pengguna telah dihapus.");
        fetchUsers();
      } catch (error) {
        showErrorSwal(
          "Gagal!",
          error.response?.data?.message || "Gagal menghapus pengguna."
        );
      }
    }
  };

  const maskEmail = (email) => {
    if (!email) return "";

    const atIndex = email.indexOf("@");
    if (atIndex < 0) return email;

    const username = email.substring(0, atIndex);
    const domain = email.substring(atIndex);

    if (username.length > 6) {
      const start = username.substring(0, 4);
      const end = username.substring(username.length - 2);
      return `${start}****${end}${domain}`;
    } else {
      const start = username.substring(0, Math.min(2, username.length));
      return `${start}****${domain}`;
    }
  };

  const maskPhone = (phone) => {
    if (!phone) return "-";
    if (phone.length > 6) {
      return `${phone.substring(0, 4)}******${phone.substring(
        phone.length - 3
      )}`;
    }
    return phone;
  };

  const sortedUsers = useMemo(() => {
    const sorted = [...users];

    sorted.sort((a, b) => b._id.localeCompare(a._id));

    return sorted;
  }, [users]);

  const filteredUsers = sortedUsers.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subHeaderComponent = useMemo(() => {
    const handleClear = () => {
      if (searchTerm) {
        setResetPaginationToggle(!resetPaginationToggle);
        setSearchTerm("");
      }
    };
    return (
      <Form.Control
        type="search"
        placeholder="Cari Nama atau Email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3"
        style={{ maxWidth: "250px" }}
      />
    );
  }, [searchTerm, resetPaginationToggle]);

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "59px",
    },
    {
      name: "Nama",
      selector: (row) => row.fullName,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => maskEmail(row.email),
    },
    {
      name: "No. Telepon",
      selector: (row) => maskPhone(row.phone),
    },
    {
      name: "Aksi",
      width: "175px",
      cell: (row) =>
        loggedInUser?.role === "superAdmin" ? (
          <div className="d-flex flex-column gap-2">
            <Button
              as="a"
              href={`https://wa.me/${row.phone}`}
              target="_blank"
              size="sm"
              style={{ backgroundColor: "#25D366", border: "none" }}
              disabled={!row.phone}
            >
              <FaWhatsapp /> Hubungi
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteUser(row._id)}
            >
              <FaTrash /> Hapus
            </Button>
          </div>
        ) : (
          "-"
        ),
    },
  ];

  if (loggedInUser?.role !== "admin" && loggedInUser?.role !== "superAdmin") {
    // Tampilan akses ditolak tetap sama
    return (
      <div style={{ display: "flex" }}>
        <Sidebar />
        <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
          <h2 className="text-danger">Akses Ditolak</h2>
          <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </Container>
      </div>
    );
  }

  return (
    <Container fluid className="py-4 my-3">
      <Card className="shadow">
        <CardHeader>
          <h3 className="mb-0 section-title">Data Pengguna</h3>
        </CardHeader>
        <Card.Body>
          <DataTable
            columns={columns}
            data={filteredUsers}
            customStyles={customStyles}
            pagination
            paginationResetDefaultPage={resetPaginationToggle}
            paginationPerPage={10}
            paginationRowsPerPageOptions={[15, 30, 60, 100]}
            subHeader
            subHeaderComponent={subHeaderComponent}
            subHeaderAlign="right"
            progressPending={isLoading}
            progressComponent={
              <div className="my-4 bg-transparent">
                <Spinner />
              </div>
            }
            paginationComponentOptions={{
              rowsPerPageText: "Baris per halaman:",
              rangeSeparatorText: "dari",
            }}
            highlightOnHover
            pointerOnHover
            noDataComponent={
              <div className="text-center my-5">
                <h3 className="SF-UIDisplay text-danger">
                  Tidak Ada Data untuk Ditampilkan
                </h3>
                <p>
                  Saat ini belum ada Nama atau Email yang ada di dalam tabel
                  ini.
                </p>
              </div>
            }
          />
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserDashboard;
