import React, { useState, useEffect, useContext } from "react";
import {
  Row,
  Col,
  Button,
  Form,
  Image,
  Card,
  Spinner,
  FloatingLabel,
} from "react-bootstrap";
import { UserContext } from "../UserContext";
import { FaStar } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import moment from "moment";
import "moment/locale/id";
import { useNavigate, useLocation } from "react-router-dom";
import instance from "../../../utils/axios";
import useCustomSwals from "../../Dashboard/useCustomSwals";

moment.locale("id");
const Testimonials = () => {
  const { user, setUser } = useContext(UserContext);
  const [testimonials, setTestimonials] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccessSwal, showErrorSwal, showInfoSwal } = useCustomSwals();
  const [isLoading, setIsLoading] = useState(true);
  const [newTestimonial, setNewTestimonial] = useState({
    rating: 0,
    message: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formWidth, setFormWidth] = useState("w-75");

  useEffect(() => {
    AOS.init({ duration: 1700, easing: "fade-left", once: true });

    const fetchTestimonials = async () => {
      setIsLoading(true);
      try {
        const response = await instance.get("/testimonials");
        setTestimonials(response.data.testimonials);
      } catch (error) {
        showErrorSwal("Gagal memuat data testimoni.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (user && showForm) {
      setNewTestimonial((prev) => ({ ...prev, name: user.fullName }));
    }
  }, [user, showForm]);

  useEffect(() => {
    const handleResize = () =>
      setFormWidth(window.innerWidth < 768 ? "w-75" : "w-50");
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  });

  useEffect(() => {
    if (testimonials.length < 2) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 7900);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTestimonial((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating) => {
    setNewTestimonial((prev) => ({ ...prev, rating }));
  };

  const handleSubmitTestimonial = async (e) => {
    e.preventDefault();
    if (!newTestimonial.message || newTestimonial.rating === 0) {
      return showInfoSwal("Rating dan pesan tidak boleh kosong.");
    }
    try {
      const response = await instance.post(
        "/testimonials",
        { message: newTestimonial.message, rating: newTestimonial.rating },
        { withCredentials: true }
      );
      const newlySubmittedTestimonial = response.data.testimonial;
      setTestimonials([newlySubmittedTestimonial, ...testimonials]);
      setCurrentIndex(0); //

      showSuccessSwal("Testimoni berhasil dikirim! Terima kasih.");
      setShowForm(false);
      setNewTestimonial({ rating: 0, message: "" });

      const updatedUser = { ...user, hasSubmittedTestimonial: true };
      setUser(updatedUser);

      const userResponse = await instance.get("/auth/getuser", {
        withCredentials: true,
      });
      setUser(userResponse.data.user);
    } catch (error) {
      showErrorSwal(error.response?.data?.message || "Gagal mengirim testimoni.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCarousel = () => {
    if (isLoading) {
      return (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      );
    }
    if (!testimonials || testimonials.length === 0) {
      return (
        <p className="text-center my-5 section-subtitle">
          Saat ini belum ada testimoni. Jadilah yang pertama memberikan
          testimoni!
        </p>
      );
    }
    const current = testimonials[currentIndex];
    if (!current || !current.user) {
      return (
        <p className="text-center text-danger">
          Gagal memuat data testimoni ini.
        </p>
      );
    }

    return (
      <div className="d-flex justify-content-between align-items-center">
        <Button
          onClick={() =>
            setCurrentIndex(
              (currentIndex - 1 + testimonials.length) % testimonials.length
            )
          }
          className="carousel-prev shadow btn-secondary"
        >
          &lt;
        </Button>
        <Card
          className="w-75 mx-auto testimonial-card shadow"
          data-aos="fade-down"
        >
          <Card.Body>
            <fieldset>
              <Row className="justify-content-center align-items-center mb-3">
                <Col xs="auto">
                  <Image
                    src={
                      current.user.profilePicture
                        ? current.user.profilePicture
                        : "/default-avatar.png"
                    }
                    alt={current.user.fullName}
                    width="80"
                    height="80"
                    roundedCircle
                    style={{ objectFit: "cover" }}
                  />
                </Col>
                <Col xs="auto">
                  <legend className="text-subtitle fw-bold m-0">
                    {current.user.fullName}
                  </legend>
                </Col>
              </Row>

              <p
                className="text-justify text-lg-center testimonial-message"
                style={{ whiteSpace: "pre-wrap" }}
              >
                "{current.message}"
              </p>

              <div className="testimonial-rating text-center">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    color={i < current.rating ? "#ffc107" : "#e4e5e9"}
                  />
                ))}
              </div>

              <p className="text-center section-subtitle small my-3">
                Pada: {moment(current.createdAt).format("D MMMM YYYY, HH:mm")}
              </p>
            </fieldset>
          </Card.Body>
        </Card>
        <Button
          onClick={() =>
            setCurrentIndex((currentIndex + 1) % testimonials.length)
          }
          className="carousel-next shadow btn-secondary"
        >
          &gt;
        </Button>
      </div>
    );
  };

  return (
    <div className="testimonials mt-5 position-relative" data-aos="fade-up">
      <h3 className="section-title text-center mb-4">Testimoni Pengguna</h3>
      {renderCarousel()}
      <div className="text-center mt-3" data-aos="fade-up">
        {user && user.hasSubmittedTestimonial ? (
          <p className="text-success-emphasis section-subtitle">
            Terima kasih, Anda sudah mengirimkan testimoni.
          </p>
        ) : (
          <>
            {!user ? (
              <Button
                onClick={() =>
                  navigate("/login", { state: { background: location } })
                }
                className="w-75 section-subtitle text-light btn-info"
              >
                Login untuk Tambah Testimoni
              </Button>
            ) : (
              user.role === "user" && (
                <>
                  <Button
                    onClick={() => setShowForm(!showForm)}
                    variant={showForm ? "danger" : "secondary"}
                    className="w-75 section-subtitle text-light"
                    data-aos="fade-up"
                  >
                    {showForm ? "Batal" : "Tambahkan Testimoni"}
                  </Button>
                  {showForm && (
                    <Card
                      className={`${formWidth} mx-auto p-3 testimonial-form mt-3`}
                      data-aos="zoom-in"
                    >
                      <h3 className="text-center text-title fw-bold mb-3">
                        Testimoni Baru
                      </h3>

                      <Form onSubmit={handleSubmitTestimonial}>
                        <FloatingLabel label="*Nama Anda">
                          <Form.Control
                            type="text"
                            name="name"
                            placeholder="Nama Anda"
                            value={newTestimonial.name}
                            readOnly
                            required
                            style={{ cursor: "not-allowed" }}
                          />
                        </FloatingLabel>
                        <Form.Group className="mb-3">
                          <Form.Label className="mt-4 section-subtitle">
                            Penilaian Anda:
                          </Form.Label>
                          <div>
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                color={
                                  i < newTestimonial.rating ? "gold" : "silver"
                                }
                                onClick={() => handleRatingChange(i + 1)}
                                style={{ cursor: "pointer", margin: "0 12px" }}
                              />
                            ))}
                          </div>
                        </Form.Group>
                        <Form.Group
                          label="Bagikan pengalaman Anda..."
                          className="mb-3"
                        >
                          <Form.Label className="mt-2">
                            Bagikan pengalaman Anda terhadap Dadi Bara . . .
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            name="message"
                            rows={3}
                            defaultValue="Keren sih ini . . . (Tambahin Sendiri)"
                            value={newTestimonial.message}
                            onChange={handleInputChange}
                            required
                            minLength={50}
                          />
                        </Form.Group>
                        <Button
                          variant="success"
                          className="w-75 section-subtitle text-light"
                          type="submit"
                        >
                          Kirim Testimoni
                        </Button>
                      </Form>
                    </Card>
                  )}
                </>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Testimonials;
