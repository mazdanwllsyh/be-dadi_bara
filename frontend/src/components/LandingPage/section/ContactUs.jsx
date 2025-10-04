import React, { useState, useEffect, useContext } from "react";
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

  const { showErrorSwal } = useCustomSwals();
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

  const handleMailto = () => {
    const { nama, email, pesan } = formData;
    if (nama === "" || email === "" || pesan === "") {
      showErrorSwal("Mohon Lengkapi Semua Kolom!");
      return;
    }

    const tujuanEmail = "kartardadibara@gmail.com";
    const subjek = `Pesan dari ${nama} - Form Website Dadi Bara`;

    const body = `
      Halo, Pesan ini dikirimkan melalui form website Dadi Bara.
      
      Nama: ${nama}
      Email: ${email}
      -----------------------------------------
      Isi Pesan:
      ${pesan}
    `;

    window.location.href = `mailto:${tujuanEmail}?subject=${encodeURIComponent(
      subjek
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="contact-us" className="py-5 d-flex align-items-center">
      <div className="container mt-5">
        <div className="row row-cols-1 row-cols-md-2 g-4 justify-content-center">
          <div className="col" data-aos="fade-up">
            <h2 className="section-title">Hubungi Kami</h2>
            <div onSubmit={handleMailto}>
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
                  minLength="35"
                ></textarea>
                <label htmlFor="pesan">Pesan atau Kritik dan Saran</label>
              </div>
              {user &&
              (user.role === "admin" ||
                user.role === "superAdmin") ? null : isCooldown ? (
                <div className="text-center p-2 rounded bg-light">
                  <span className="text-danger fw-bold">{cooldownMessage}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleMailto}
                  className="btn btn-primary w-100 fw-bold section-subtitle text-light"
                  style={{ backgroundColor: "darkcyan", border: 0 }}
                >
                  Kirim via Aplikasi Email
                </button>
              )}
            </div>
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
    </section>
  );
};

export default ContactUs;
