import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Form,
  ListGroup,
  Modal,
  CardHeader,
  Spinner,
} from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import instance from "../../utils/axios.js";
import useCustomSwals from "./useCustomSwals.jsx";

const FaqEditor = () => {
  const [faqList, setFaqList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [currentFaqId, setCurrentFaqId] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { showConfirmSwal, showSuccessSwal, showErrorSwal } = useCustomSwals();

  const fetchFaq = async () => {
    setIsLoading(true);
    try {
      const response = await instance.get("/faq");
      setFaqList(response.data || []);
    } catch (error) {
      toast.error("Gagal mengambil data FAQ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaq();
  }, []);

  const handleShowModal = (type, faq = null) => {
    setModalType(type);
    if (type === "edit" && faq) {
      setQuestion(faq.question);
      setAnswer(faq.answer);
      setCurrentFaqId(faq._id);
    } else {
      setQuestion("");
      setAnswer("");
      setCurrentFaqId(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "question") setQuestion(value);
    else if (name === "answer") setAnswer(value);
  };

  const handleAddFaq = async () => {
    try {
      const newFaq = { question, answer };
      await instance.post("/faq", newFaq, { withCredentials: true });
      fetchFaq();
      toast.success("FAQ berhasil ditambahkan!");
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menambahkan FAQ.");
    }
  };

  const handleEditFaq = async () => {
    try {
      const updatedFaq = { question, answer };
      await instance.put(`/faq/${currentFaqId}`, updatedFaq, {
        withCredentials: true,
      });
      fetchFaq(); // Ambil ulang data
      toast.success("FAQ berhasil diperbarui!");
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengedit FAQ.");
    }
  };

  const handleDeleteFaq = async (faqId) => {
    const isConfirmed = await showConfirmSwal(
    "Yakin ingin menghapus?",
    "Pertanyaan dan Jawaban (FAQ) ini akan dihapus secara permanen!"
  );

    if (isConfirmed) {
      try {
        await instance.delete(`/faq/${faqId}`, { withCredentials: true });
        showSuccessSwal("Berhasil!", "FAQ berhasil dihapus.");
        fetchFaq(); 
      } catch (error) {
        showErrorSwal("Gagal!", error.response?.data?.message || "Gagal menghapus FAQ.");
      }
    }
  };

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "30vh" }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Card className="shadow-sm mt-3">
      <CardHeader>
        <h2 className="section-title mb-0">FAQ Editor</h2>
      </CardHeader>
      <Card.Body>
        <ListGroup>
          {faqList.length > 0 ? (
            faqList.map((faq, index) => (
              <ListGroup.Item
                key={faq._id}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong className="SF-UIDisplay">
                    {index + 1}. {faq.question}
                  </strong>
                  <p className="mb-2 opacity-75 text-justify mx-3">
                    {faq.answer}
                  </p>
                </div>
                <div className="d-flex flex-column gap-2">
                  <Button
                    variant="warning"
                    size="sm"
                    className="w-100"
                    onClick={() => handleShowModal("edit", faq)}
                  >
                    <FaEdit /> Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-100"
                    onClick={() => handleDeleteFaq(faq._id)}
                  >
                    <FaTrash /> Hapus
                  </Button>
                </div>
              </ListGroup.Item>
            ))
          ) : (
            <p className="text-center mt-3">Belum ada pertanyaan FAQ.</p>
          )}
        </ListGroup>

        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title className="section-title">
              {modalType === "add" ? "Tambah FAQ Baru" : "Edit FAQ"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Pertanyaan:</Form.Label>
                <Form.Control
                  type="text"
                  name="question"
                  value={question}
                  onChange={handleInputChange}
                  required
                  minLength={12}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Jawaban:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="answer"
                  value={answer}
                  onChange={handleInputChange}
                  required
                  minLength={35}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={modalType === "add" ? handleAddFaq : handleEditFaq}
            >
              {modalType === "add" ? "Simpan Pertanyaan" : "Simpan Perubahan"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
      <Card.Footer className="d-flex justify-content-center">
        {faqList.length < 5 && (
          <Button
            className="w-50 section-subtitle text-light"
            variant="secondary"
            onClick={() => handleShowModal("add")}
          >
            <FaPlus className="me-2" /> Tambah Pertanyaan
          </Button>
        )}
      </Card.Footer>
    </Card>
  );
};

export default FaqEditor;
