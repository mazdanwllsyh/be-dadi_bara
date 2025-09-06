import React, { useState, useEffect, useContext } from "react";
import { Card, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { AppContext } from "../LandingPage/AppContext";
import instance from "../../utils/axios";
import { FaCloudUploadAlt, FaCheckCircle } from "react-icons/fa";
import useCustomSwals from "./useCustomSwals";

const SKDashboard = () => {
  const { data, theme } = useContext(AppContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [currentSk, setCurrentSk] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { showSuccessSwal, showErrorSwal, showInfoSwal } = useCustomSwals();

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const fetchCurrentSk = async () => {
    setIsLoading(true);
    try {
      const response = await instance.get("/sk");
      if (response.data) {
        setCurrentSk(response.data);
      }
    } catch (error) {
      toast.error("Gagal memuat dokumen SK saat ini.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentSk();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setFileUrl(URL.createObjectURL(file));
      } else {
        showInfoSwal("Hanya file dengan format PDF yang diizinkan!");
        e.target.value = null;
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showErrorSwal("Silakan pilih file PDF terlebih dahulu.");
      return;
    }

    const formData = new FormData();
    formData.append("sk_document", selectedFile);

    setIsUploading(true);
    try {
      await instance.post("/sk", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      showSuccessSwal("Dokumen SK berhasil diunggah!");
      setSelectedFile(null);
      setFileUrl(null);
      fetchCurrentSk(); // Muat ulang SK yang baru
    } catch (error) {
      showErrorSwal(
        error.response?.data?.message || "Gagal mengunggah dokumen SK."
      );
    } finally {
      setIsUploading(false); // DITAMBAHKAN: Selesai proses upload
    }
  };

  if (isLoading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "90vh" }}
      >
        <Spinner />
        <p className="mt-2">Memuat dokumen...</p>
      </div>
    );
  }

  return (
    <Card className="my-3 w-100">
      <Card.Header>
        <h5 className="mb-0 section-title">
          Dokumen Surat Keputusan {data.namaOrganisasi}
        </h5>
      </Card.Header>
      <Card.Body>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label className="text-custom fw-bold">
            Upload Dokumen SK Baru (Format: .pdf)
          </Form.Label>
          <Form.Control type="file" accept=".pdf" onChange={handleFileChange} />
        </Form.Group>

        <div className="d-flex align-items-center">
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Mengunggah...
              </>
            ) : (
              <>
                <FaCloudUploadAlt className="me-2" />
                Upload SK
              </>
            )}
          </Button>

          {currentSk && !selectedFile && (
            <div className="ms-3 text-success-emphasis d-flex align-items-center">
              <FaCheckCircle className="me-2" />
              <span>Dokumen sudah terunggah ke cloud.</span>
            </div>
          )}
        </div>

        <hr />
        <h5 className="mt-4 text-center text-custom fw-bold text-secondary-emphasis">
          Pratinjau Dokumen
        </h5>
        <div
          className={`shadow pdf-viewer-container ${
            theme === "dark" ? "rpv-core__viewer--dark" : ""
          }`}
          style={{
            border: "1px solid #ddd",
            height: "1000px",
            width: "100%",
          }}
        >
          {fileUrl || currentSk?.filePath ? (
            <Worker workerUrl="/workers/pdf.worker.min.js">
              <Viewer
                fileUrl={fileUrl || currentSk.filePath}
                plugins={[defaultLayoutPluginInstance]}
              />
            </Worker>
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100">
              <p className="text-muted">
                Pilih file PDF untuk melihat pratinjau, atau upload dokumen jika
                belum ada.
              </p>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default SKDashboard;
