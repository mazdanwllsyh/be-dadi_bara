import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Form,
} from "react-bootstrap";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import DataTable from "react-data-table-component";
import { FaWhatsapp, FaTrash, FaFilePdf } from "react-icons/fa";
import { AppContext } from "../LandingPage/AppContext";
import { toast } from "react-toastify";
import instance from "../../utils/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useCustomSwals from "./useCustomSwals";

ChartJS.register(ArcElement, Tooltip, Legend);

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

const DashboardPendaftaran = () => {
  const { theme } = useContext(AppContext);
  const [pendaftar, setPendaftar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const { showConfirmSwal, showSuccessSwal, showErrorSwal } = useCustomSwals();

  const formatTanggalIndonesia = (tanggalISO) => {
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return new Date(tanggalISO).toLocaleDateString("id-ID", options);
  };

  const totalPendaftar = pendaftar.length;

  const chartData = {
    labels: ["Ketua", "Sekretaris", "Bendahara", "Bidang Lain"],
    datasets: [
      {
        label: "Jumlah Pendaftar per Posisi",
        data: [
          pendaftar.filter((p) => p.position === "ketua").length,
          pendaftar.filter((p) => p.position === "sekretaris").length,
          pendaftar.filter((p) => p.position === "bendahara").length,
          pendaftar.filter(
            (p) =>
              p.position !== "ketua" &&
              p.position !== "sekretaris" &&
              p.position !== "bendahara"
          ).length,
        ],
        backgroundColor: [
          "rgba(35, 99, 132, 0.65)",
          "rgba(54, 162, 235, 0.63)",
          "rgba(255, 206, 86, 0.63)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const fetchPendaftar = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await instance.get("/pendaftaran", {
        withCredentials: true,
      });
      setPendaftar(response.data || []);
    } catch (error) {
      toast.error("Gagal memuat data pendaftar.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendaftar();
  }, [fetchPendaftar]);

  const genderCounts = useMemo(() => {
    return pendaftar.reduce(
      (acc, curr) => {
        if (curr.gender === "Laki-laki") {
          acc.lakiLaki++;
        } else if (curr.gender === "Perempuan") {
          acc.perempuan++;
        }
        return acc;
      },
      { lakiLaki: 0, perempuan: 0 }
    );
  }, [pendaftar]);

  const formatJabatan = (jabatan) => {
    const map = {
      ketua: "Ketua",
      sekretaris: "Sekretaris",
      bendahara: "Bendahara",
      bidang_rohani: "Bidang Kerohanian",
      bidang_umum: "Bidang Kesekretariatan & Umum",
      bidang_humas: "Bidang Hubungan Masyarakat",
      bidang_tekno: "Bidang Teknologi & Informasi",
      bidang_sosbud: "Bidang Sosial & Budaya",
      bidang_olahraga: "Bidang Olahraga & Kepemudaan",
      anggota: "Anggota",
    };
    return map[jabatan] || jabatan;
  };

  const handleDeletePendaftar = async (pendaftarId) => {
    const isConfirmed = await showConfirmSwal(
      "Yakin ingin menghapus?",
      "Apakah Anda yakin ingin menghapus pendaftar ini?"
    );

    if (isConfirmed) {
      try {
        await instance.delete(`/pendaftaran/${pendaftarId}`, {
          withCredentials: true,
        });
        showSuccessSwal("Pendaftar berhasil dihapus.");
        fetchPendaftar();
      } catch (error) {
        showErrorSwal(
          error.response?.data?.message || "Gagal menghapus pendaftar."
        );
      }
    }
  };

  const filteredPendaftar = pendaftar.filter(
    (item) =>
      (item.name &&
        item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.email &&
        item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.position &&
        formatJabatan(item.position)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { name: "#", selector: (row, index) => index + 1, minWidth: "45px" },
    {
      name: "Nama",
      sortable: true,
      width: "220px",
      wrap: true,
      cell: (row) => {
        if (!row.name) return "";

        const cleanedName = row.name.replace(/[.,_]/g, " ");

        const capitalizedName = cleanedName
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");

        return capitalizedName;
      },
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      minWidth: "250px",
      wrap: true,
    },
    {
      name: "Jenis Kelamin",
      selector: (row) => row.gender,
      sortable: true,
      width: "180px",
    },
    { name: "Nomor Telepon", selector: (row) => row.phone, width: "180px" },
    {
      name: "Jabatan",
      selector: (row) => formatJabatan(row.position),
      sortable: true,
      wrap: true,
      width: "220px",
    },
    {
      name: "Alamat",
      selector: (row) => row.address,
      sortable: true,
      wrap: true,
      grow: 2,
      width: "290px",
      whiteSpace: "pre-wrap",
    },
    {
      name: "Tanggal Lahir",
      selector: (row) => formatTanggalIndonesia(row.birthDate),
      sortable: true,
      width: "210px",
    },
    {
      name: "Minat & Bakat",
      selector: (row) => row.interests || "-",
      sortable: true,
      wrap: true,
      grow: 2,
      minWidth: "290px",
      whiteSpace: "pre-wrap",
    },
    {
      name: "Aksi",
      minWidth: "130px",
      cell: (row) => (
        <div className="d-flex flex-column gap-2 py-2">
          <Button
            as="a"
            href={`https://wa.me/${row.phone}`}
            target="_blank"
            size="sm"
            style={{ backgroundColor: "#00db40", border: "none" }}
          >
            <FaWhatsapp /> Hubungi
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeletePendaftar(row._id)}
          >
            <FaTrash /> Hapus
          </Button>
        </div>
      ),
    },
  ];

  const handleExportPDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumns = [
      "No.",
      "Nama",
      "Jenis Kelamin",
      "No. Telepon",
      "Jabatan",
      "Alamat",
      "Tanggal Lahir",
    ];
    const tableRows = [];

    filteredPendaftar.forEach((item, index) => {
      const itemData = [
        index + 1,
        item.name || "-",
        item.gender || "-",
        item.phone || "-",
        formatJabatan(item.position) || "-",
        item.address || "-",
        formatTanggalIndonesia(item.birthDate) || "-",
      ];
      tableRows.push(itemData);
    });

    const logoUrl =
      "https://res.cloudinary.com/dr7olcn4r/image/upload/q_auto,w_300/v1757429644/logos/logo_organisasi.png";
    const logoWidth = 20;
    const logoHeight = 20;
    const logoX = 14;
    const titleY = 25;
    const logoY = titleY - logoHeight / 2 + 1;
    doc.addImage(logoUrl, "PNG", logoX, logoY, logoWidth, logoHeight);

    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Laporan Data Pendaftar Anggota Karang Taruna Dadi Bara",
      pageWidth / 2,
      titleY,
      { align: "center" }
    );
    doc.setFont("helvetica", "normal");

    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 42,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9,
        valign: "middle",
      },
      headStyles: {
        fillColor: [172, 172, 172],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      bodyStyles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 10 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        6: { cellWidth: 30 },
      },
    });

    const finalY = doc.lastAutoTable.finalY;

    doc.setFontSize(11);
    doc.text(
      `Pendaftar Laki-laki: ${genderCounts.lakiLaki} Orang`,
      14,
      finalY + 10
    );
    doc.text(
      `Pendaftar Perempuan: ${genderCounts.perempuan} Orang`,
      14,
      finalY + 17
    );
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Jumlah Total Pendaftar: ${totalPendaftar} Orang`,
      14,
      finalY + 24
    );

    const date = new Date().toISOString().slice(0, 10);
    doc.save(`Laporan_Pendaftar_${date}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container fluid className="py-4 my-3">
      <Row className="mb-4 row-cols-1 row-cols-md-2 g-4">
        <Col>
          <Card className="shadow-sm text-center dashboard-card">
            <Card.Body>
              <Card.Title className="fw-bold SF-UIDisplay">
                Chart Pendaftar per Posisi
              </Card.Title>
              <div>
                <div style={{ height: "250px", position: "relative" }}>
                  <Doughnut
                    data={chartData}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          labels: {
                            color: theme === "dark" ? "white" : "black",
                            font: {
                              family:
                                "'SF UI Text', 'SF UI Display', 'Roboto', sans-serif",
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="shadow-sm text-center dashboard-card h-100">
            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
              <Card.Title className="fw-bold SF-UIDisplay">
                Total Pendaftar
              </Card.Title>
              <h1 className="display-4 text-custom fw-bold text-secondary-emphasis">
                {totalPendaftar}
              </h1>
              <Card.Text className="text-muted">
                Orang telah mendaftar
              </Card.Text>

              <hr className="w-75" />
              <div className="d-flex justify-content-around w-100">
                <div className="text-center">
                  <p className="mb-0 text-muted small">Laki-laki (L)</p>
                  <p className="fw-bold fs-5">{genderCounts.lakiLaki}</p>
                </div>
                <div className="text-center">
                  <p className="mb-0 text-muted small">Perempuan (P)</p>
                  <p className="fw-bold fs-5">{genderCounts.perempuan}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm mt-4">
        <Card.Body>
          <Row className="justify-content-center justify-content-md-between align-items-center mb-3 g-2">
            <Col xs={12} md="auto">
              <h5 className="card-title fw-bold text-center text-custom mb-0 text-body-emphasis">
                Daftar Pendaftar
              </h5>
            </Col>

            <Col
              xs={12}
              md={4}
              className="d-flex justify-content-center justify-content-md-end"
            >
              <Form.Control
                type="search"
                placeholder="Cari pendaftar..."
                style={{ maxWidth: "300px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
          </Row>

          <DataTable
            columns={columns}
            data={filteredPendaftar}
            customStyles={customStyles}
            pagination
            paginationPerPage={5}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
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
                <p>Saat ini belum ada data yang tersedia di dalam tabel ini.</p>
              </div>
            }
          />
          <Row className="mt-3">
            <Col className="d-flex justify-content-end">
              <Button
                variant="danger"
                onClick={handleExportPDF}
                disabled={filteredPendaftar.length === 0}
              >
                <FaFilePdf className="me-2" />
                Eksport ke PDF
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DashboardPendaftaran;
