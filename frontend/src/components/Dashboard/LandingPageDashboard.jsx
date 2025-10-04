import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  CardHeader,
  Spinner,
} from "react-bootstrap";
import { FaSave } from "react-icons/fa";
import { AppContext } from "../LandingPage/AppContext";
import { toast } from "react-toastify";
import JadwalKegiatanEditor from "./JadwalKegiatanEditor";
import FaqEditor from "./FAQEditor";
import useCustomSwals from "./useCustomSwals";
import instance from "../../utils/axios";

const LandingPageDashboard = () => {
  const { data, updateData } = useContext(AppContext);
  const [initialData, setInitialData] = useState({});
  const [formData, setFormData] = useState({
    namaOrganisasi: "",
    tagline: "",
    aboutUsText: "",
  });

  const [logoDadiBaraFile, setLogoDadiBaraFile] = useState(null);
  const [logoDesaBaruFile, setLogoDesaBaruFile] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const { showSuccessSwal, showErrorSwal } = useCustomSwals();

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      const initialFormState = {
        namaOrganisasi: data.namaOrganisasi || "",
        tagline: data.tagline || "",
        aboutUsText: data.aboutUsParagraphs?.join("\n") || "",
      };
      setFormData(initialFormState);
      setInitialData(initialFormState);
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    const changesDetected =
      JSON.stringify(formData) !== JSON.stringify(initialData) ||
      logoDadiBaraFile !== null ||
      logoDesaBaruFile !== null;
    setHasChanged(changesDetected);
  }, [formData, initialData, logoDadiBaraFile, logoDesaBaruFile]);

  useEffect(() => {
    const fetchConfig = async () => {
      if (data.namaOrganisasi === "") {
        try {
          const response = await instance.get("/landing-config");
          const config = response.data;
          if (config) {
            updateData(config);
          }
        } catch (error) {
          showErrorSwal("Gagal mengambil data konfigurasi.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchConfig();
  }, [data.namaOrganisasi, updateData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const submissionData = new FormData();
    submissionData.append("namaOrganisasi", formData.namaOrganisasi);
    submissionData.append("tagline", formData.tagline);
    submissionData.append("aboutUsParagraphs", formData.aboutUsText);
    if (logoDadiBaraFile)
      submissionData.append("logoDadiBara", logoDadiBaraFile);
    if (logoDesaBaruFile)
      submissionData.append("logoDesaBaru", logoDesaBaruFile);

    try {
      const response = await instance.put("/landing-config", submissionData, {
        withCredentials: true,
      });

      updateData(response.data);
      showSuccessSwal("Data berhasil diperbarui!");
    } catch (error) {
      showErrorSwal("Gagal memperbarui data.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "90vh" }}
      >
        <Spinner />
      </div>
    );

  return (
    <Container fluid className="py-2 my-3">
      <Card className="shadow">
        <CardHeader>
          <h2 className="section-title mb-0">Editor Halaman Utama</h2>
        </CardHeader>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6} className="mb-2">
                <Form.Group>
                  <Form.Label className="text-custom fw-bold">
                    Nama Organisasi:
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="namaOrganisasi"
                    value={formData.namaOrganisasi}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-custom fw-bold">
                    Tagline:
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6} className="mb-2">
                <Form.Group>
                  <Form.Label className="text-custom fw-bold">
                    Logo Organisasi:
                  </Form.Label>
                  {data.logoDadiBara && (
                    <Button
                      variant="link"
                      className="p-0 ms-2 text-decoration-underline mb-1"
                      onClick={() => window.open(data.logoDadiBara, "_blank")}
                    >
                      (Lihat File)
                    </Button>
                  )}
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoDadiBaraFile(e.target.files[0])}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-custom fw-bold">
                    Logo Desa:
                  </Form.Label>
                  {data.logoDesaBaru && (
                    <Button
                      variant="link"
                      className="p-0 ms-2 text-decoration-underline mb-1"
                      onClick={() => window.open(data.logoDesaBaru, "_blank")}
                    >
                      (Lihat File)
                    </Button>
                  )}
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoDesaBaruFile(e.target.files[0])}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="text-custom fw-bold">
                Tentang Kami (Paragraf):
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="aboutUsText"
                value={formData.aboutUsText}
                onChange={handleInputChange}
                className="text-justify"
              />
            </Form.Group>
            <div className="text-center">
              {hasChanged && (
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSaving}
                  className="w-50"
                >
                  <FaSave />{" "}
                  {isSaving ? <Spinner size="sm" /> : "Simpan Perubahan"}
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>
      <JadwalKegiatanEditor />
      <FaqEditor />
    </Container>
  );
};

export default LandingPageDashboard;
