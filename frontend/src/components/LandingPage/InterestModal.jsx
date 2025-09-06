import React, { useEffect, useState, useContext } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Link } from "react-router-dom";
import { AppContext } from "./AppContext";

function InterestModal() {
  const { data } = useContext(AppContext);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  const modalModes = {
    join: {
      message: `Apakah Anda tertarik bergabung menjadi Bagian dari ${data.namaOrganisasi}?`,
      buttonText: "Ya, Saya Tertarik",
      buttonLink: "/pendaftaran",
    },
    donate: {
      message: `Apakah Anda bersedia untuk menjadi donatur ${data.namaOrganisasi}?`,
      buttonText: "Ya, Saya Berminat",
      buttonLink: "/donation",
    },
  };

  const [activeMode, setActiveMode] = useState(modalModes.join);

  const handleCloseInterestModal = () => {
    setShowInterestModal(false);
    if (selectedOption === "hideToday") {
      localStorage.setItem("hideModalTimestamp", Date.now().toString());
    } else if (selectedOption === "notInterested") {
      const hideUntil = Date.now() + 14 * 24 * 60 * 60 * 1000;
      localStorage.setItem("hideInterestModalUntil", hideUntil.toString());
    }
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  useEffect(() => {
    const hideUntilTimestamp = localStorage.getItem("hideInterestModalUntil");
    if (hideUntilTimestamp) {
      const now = Date.now();
      if (now < parseInt(hideUntilTimestamp, 10)) return;
      else localStorage.removeItem("hideInterestModalUntil");
    }
    const hideTimestamp = localStorage.getItem("hideModalTimestamp");
    if (hideTimestamp) {
      const storedDate = new Date(parseInt(hideTimestamp, 10));
      const today = new Date();
      if (storedDate.toDateString() === today.toDateString()) return;
      else localStorage.removeItem("hideModalTimestamp");
    }

    const randomNumber = Math.random();
    let randomModeKey;

    if (randomNumber < 0.8) {
      randomModeKey = "join";
    } else {
      randomModeKey = "donate";
    }

    setActiveMode(modalModes[randomModeKey]);

    const timer = setTimeout(() => {
      setShowInterestModal(true);
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  if (!showInterestModal) {
    return null;
  }

  return (
    <Modal show={showInterestModal} onHide={handleCloseInterestModal} centered>
      <Modal.Header closeButton>
        <Modal.Title className="section-title fw-bold align-content-center">
          <img src={data.logoDadiBara} alt="Logo" width="50" className="me-2" />
          Informasi!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="section-subtitle text-body">
        <p>{activeMode.message}</p>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between align-items-center">
        <div>
          <Form.Check
            type="radio"
            name="interestOptions"
            id="hideTodayRadio"
            label="Jangan Tampilkan Selama Hari Ini."
            value="hideToday"
            checked={selectedOption === "hideToday"}
            onChange={handleOptionChange}
            className="section-subtitle"
          />
          <Form.Check
            type="radio"
            name="interestOptions"
            id="notInterestedRadio"
            label="Saya Tidak Berminat."
            value="notInterested"
            checked={selectedOption === "notInterested"}
            onChange={handleOptionChange}
            className="section-subtitle"
          />
        </div>
        <Button
          variant="primary"
          as={Link}
          to={activeMode.buttonLink}
          onClick={handleCloseInterestModal}
          className="section-subtitle fw-bold text-light"
        >
          {activeMode.buttonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default InterestModal;
