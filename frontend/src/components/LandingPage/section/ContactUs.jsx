import React, { useState, useEffect, useContext } from "react";
import emailjs from "emailjs-com";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { UserContext } from "../UserContext";
import useCustomSwals from "../../Dashboard/useCustomSwals";

const ContactUs = () => {
  const { user } = useContext(UserContext);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    pesan: "",
  });

  const { showSuccessSwal, showErrorSwal, } = useCustomSwals();
  const [isSending, setIsSending] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData((prevState) => ({
        ...prevState,
        nama: user.fullName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    AOS.init();

    const checkCooldown = () => {
      const cooldownEndTime = localStorage.getItem("contactFormCooldownEnd");
      if (cooldownEndTime) {
        const remainingTime = parseInt(cooldownEndTime) - new Date().getTime();

        if (remainingTime > 0) {
          setIsCooldown(true);
          const hours = Math.floor(remainingTime / (1000 * 60 * 60));
          const minutes = Math.floor(
            (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
          );
          setCooldownMessage(
            `Pesan Anda sudah terkirim, Harap tunggu ${hours} jam ${minutes} menit lagi`
          );
          return remainingTime;
        } else {
          localStorage.removeItem("contactFormCooldownEnd");
          setIsCooldown(false);
        }
      }
      return 0;
    };

    const remaining = checkCooldown();

    if (remaining > 0) {
      const interval = setInterval(checkCooldown, 60000); 
      return () => clearInterval(interval); 
    }
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nama, email, pesan } = formData;

    if (nama === "" || email === "" || pesan === "") {
      toast.error("Mohon lengkapi semua kolom!", { position: "bottom-right" });
      return;
    }

    setIsSending(true); 

    emailjs
      .send(
        "dadibaraemail",
        "template_dadibara",
        { from_name: nama, from_email: email, message: pesan, reply_to: email },
        "Ku_TJesVG59mypDDP"
      )
      .then(
        (response) => {
          console.log("Berhasil mengirim email", response);
          showSuccessSwal("Pesan Anda telah berhasil dikirim!", {
            position: "bottom-left",
          });

          setFormData({ nama: "", email: "", pesan: "" });

          const cooldownEndTime = new Date().getTime() + 48 * 60 * 60 * 1000;
          localStorage.setItem("contactFormCooldownEnd", cooldownEndTime);
          setIsCooldown(true);
          setCooldownMessage("Harap tunggu 48 jam lagi");
        },
        (error) => {
          console.error("Gagal mengirim email:", error);
          showErrorSwal("Terjadi kesalahan, silakan coba lagi.", {
            position: "bottom-center",
          });
        }
      )
      .finally(() => {
        setIsSending(false);
      });
  };

  return (
    <section id="contact-us" className="py-5 d-flex align-items-center">
      <div className="container mt-5">
        <div className="row row-cols-1 row-cols-md-2 g-4 justify-content-center">
          <div className="col" data-aos="fade-up">
            <h2 className="section-title">Hubungi Kami</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3 form-floating section-subtitle">
                <input
                  type="text"
                  className="form-control"
                  id="nama"
                  placeholder="Nama Anda"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  minLength="4"
                  style={{ textTransform: "capitalize" }}
                />
                <label htmlFor="nama">Nama Anda</label>
              </div>
              <div className="mb-3 form-floating section-subtitle">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Masukkan Email Anda"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  minLength="14"
                />
                <label htmlFor="email">Masukkan Email Anda</label>
              </div>
              <div className="mb-3 form-floating section-subtitle">
                <textarea
                  className="form-control"
                  id="pesan"
                  rows="8"
                  style={{ height: "8%" }}
                  placeholder="Pesan atau Kritik dan Saran"
                  value={formData.pesan}
                  onChange={handleChange}
                  required
                  minLength="20"
                ></textarea>
                <label htmlFor="pesan">Pesan atau Kritik dan Saran</label>
              </div>
              {user &&
              (user.role === "admin" ||
                user.role ===
                  "superAdmin") ?
              null : isCooldown ? (
                <div className="text-center p-2 rounded bg-light">
                  <span className="text-danger fw-bold">{cooldownMessage}</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold section-subtitle text-light"
                  style={{ backgroundColor: "darkcyan", border: 0 }}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Mengirim...
                    </>
                  ) : (
                    "Kirim"
                  )}
                </button>
              )}
            </form>
          </div>
          <div className="col" data-aos="fade-left">
            <h2 className="section-title">Lokasi Kami</h2>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.704842855102!2d110.4102484110546!3d-7.274388092702384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708191c78f28b3%3A0x11e08aa67c6c30ff!2sBalai%20Desa%20Bejalen!5e0!3m2!1sid!2sid!4v1755281676932!5m2!1sid!2sid"
              referrerPolicy="no-referrer-when-downgrade"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Map"
            />
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default ContactUs;
