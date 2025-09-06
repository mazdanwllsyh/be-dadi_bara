import React, { useContext } from "react";
import { Button, Offcanvas, Nav, Form } from "react-bootstrap";
import {
  FaImage,
  FaUsers,
  FaUserFriends,
  FaRegHandPaper,
  FaUserShield,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { SiPacker } from "react-icons/si";
import { FaRupiahSign } from "react-icons/fa6";
import { AppContext } from "../LandingPage/AppContext";
import { UserContext } from "../LandingPage/UserContext";
import ThemeSwitcher from "../LandingPage/ThemeSwitcher";
import { useNavigate } from "react-router-dom";

const OffcanvasHeader = ({ show, handleClose, handleOffcanvasShow }) => {
  const { data } = useContext(AppContext);
  const { user, setUser, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const profilePicPlaceholder = "/default-avatar.png";

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <>
      <div
        className="mobile-header d-lg-none d-flex justify-content-between align-items-center p-3"
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1045,
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="d-flex align-items-center">
          <Button
            className="sidebar-link border-1 border-black text-dark btn-secondary-emphasis shadow"
            onClick={handleOffcanvasShow}
          >
            <FaBars size={24} />
          </Button>
        </div>
        <div className="d-flex align-items-center">
          {user && (
            <>
              <a href="/profile">
                <img
                  src={
                    user.profilePicture
                      ? user.profilePicture
                      : profilePicPlaceholder
                  }
                  alt="Admin Profile"
                  className="rounded-circle me-2"
                  style={{
                    width: "40px",
                    height: "40px",
                    objectFit: "cover",
                    backgroundColor: "darkcyan",
                    border: "1px solid",
                    padding: "5px",
                  }}
                  as="a"
                />
                <span className="admin-role fw-bold text-muted me-3 text-capitalize">
                  {user.role}
                </span>
              </a>
              <Button variant="danger" size="sm" onClick={handleSignOut}>
                <FaSignOutAlt /> Logout
              </Button>
            </>
          )}
        </div>
      </div>

      <Offcanvas show={show} onHide={handleClose} className="d-lg-none">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <a href="/">
              <img
                src={data.logoDadiBara}
                alt="Logo DADI BARA"
                style={{ width: "100px" }}
              />
            </a>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <hr
          style={{
            margin: "8px 15px",
            borderTop: "4px solid var(--bs-border-color)",
          }}
        />
        <div className="d-flex px-3 my-3 justify-content-center">
          <ThemeSwitcher isMobile={true} />
        </div>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link
              href="/admin"
              onClick={handleClose}
              className="sidebar-link my-2"
            >
              <MdDashboard className="me-2" /> Dashboard
            </Nav.Link>
            <Nav.Link
              href="/admin/landingpage"
              onClick={handleClose}
              className="sidebar-link my-2"
            >
              <SiPacker className="me-2" /> Landing Page
            </Nav.Link>
            <Nav.Link
              href="/admin/gallery-dashboard"
              onClick={handleClose}
              className="sidebar-link my-2"
            >
              <FaImage className="me-2" /> Gallery
            </Nav.Link>
            <Nav.Link
              href="/admin/keanggotaan"
              onClick={handleClose}
              className="sidebar-link my-2"
            >
              <FaUsers className="me-2" /> Keanggotaan
            </Nav.Link>
            <Nav.Link
              href="/admin/keuangan"
              onClick={handleClose}
              className="sidebar-link"
            >
              <FaRupiahSign className="me-2" /> Keuangan
            </Nav.Link>
            <Nav.Link
              href="/admin/pendaftaran"
              onClick={handleClose}
              className="sidebar-link my-2"
            >
              <FaRegHandPaper className="me-2" /> Pendaftaran
            </Nav.Link>
            <Nav.Link
              href="/admin/data-user"
              onClick={handleClose}
              className="sidebar-link my-2"
            >
              <FaUserFriends className="me-2" /> Data User
            </Nav.Link>
            <Nav.Link
              href="/admin/data-admin"
              onClick={handleClose}
              className="sidebar-link my-2"
            >
              <FaUserShield className="me-2" /> Data Admin
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default OffcanvasHeader;
