import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Navbar, Nav, Button, Modal } from "react-bootstrap";
import {
  FaChevronLeft,
  FaChevronRight,
  FaImage,
  FaUsers,
  FaUserFriends,
  FaHandPaper,
  FaUserShield,
  FaSignOutAlt,
} from "react-icons/fa";
import { SiPacker } from "react-icons/si";
import { MdDashboard } from "react-icons/md";
import { FaRupiahSign } from "react-icons/fa6";
import { AppContext } from "../LandingPage/AppContext";
import { UserContext } from "../LandingPage/UserContext";
import ThemeSwitcher from "../LandingPage/ThemeSwitcher";
import { toast } from "react-toastify";
import instance from "../../utils/axios";

const Sidebar = ({ expanded, setExpanded }) => {
  const { data } = useContext(AppContext);
  const { user, setUser } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleCloseModal = () => setShowLogoutModal(false);
  const handleShowModal = () => setShowLogoutModal(true);

  useEffect(() => {
    localStorage.setItem("sidebarExpanded", JSON.stringify(expanded));
  }, [expanded]);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const handleSignOut = async () => {
    handleCloseModal();

    try {
      await instance.get("/auth/logout", {
        withCredentials: true,
      });

      sessionStorage.clear();
      setUser(null);
      toast.success("Anda telah berhasil Logout.");
      navigate("/");
    } catch (error) {
      toast.error("Logout gagal, silakan coba lagi.");
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    { to: "/admin", icon: <MdDashboard />, text: "Dashboard" },
    { to: "/admin/landingpage", icon: <SiPacker />, text: "Landing Page" },
    { to: "/admin/gallery-dashboard", icon: <FaImage />, text: "Gallery" },
    { to: "/admin/keanggotaan", icon: <FaUsers />, text: "Keanggotaan" },
    { to: "/admin/keuangan", icon: <FaRupiahSign />, text: "Keuangan" },
    { to: "/admin/pendaftaran", icon: <FaHandPaper />, text: "Pendaftaran" },
    { to: "/admin/data-user", icon: <FaUserFriends />, text: "Data User" },
    { to: "/admin/data-admin", icon: <FaUserShield />, text: "Data Admin" },
  ];

  return (
    <div className={`sidebar ${expanded ? "expanded" : "collapsed"}`}>
      <Button onClick={toggleSidebar} className="sidebar-toggle">
        {expanded ? <FaChevronLeft /> : <FaChevronRight />}
      </Button>

      <div className="sidebar-inner-content">
        <div className="sidebar-header">
          <Navbar.Brand
            as={Link}
            to="/"
            className="d-flex justify-content-center my-3"
          >
            <img
              src={data.logoDadiBara}
              alt="Logo"
              style={{
                width: expanded ? "100px" : "55px",
                transition: "width 0.3s ease-in-out",
              }}
            />
          </Navbar.Brand>
        </div>

        <div className="d-flex justify-content-center">
          <ThemeSwitcher expanded={expanded} />
        </div>

        <Nav className="flex-column w-100 my-2 flex-grow-1 d-flex justify-content-center">
          {menuItems.map((item, index) => (
            <Nav.Link
              key={index}
              as={Link}
              to={item.to}
              className={`sidebar-link ${
                location.pathname === item.to ? "active" : ""
              }`}
            >
              {item.icon}
              {expanded && <span className="ms-2">{item.text}</span>}
            </Nav.Link>
          ))}
        </Nav>
      </div>

      <div className="sidebar-footer mt-auto p-3 text-center">
        <div className="d-flex justify-content-center align-items-center">
          <a href="/profile">
            <img
              src={
                user?.profilePicture
                  ? user.profilePicture
                  : "/default-avatar.png"
              }
              alt="Profile"
              className="rounded-circle border-black"
              style={{
                width: expanded ? "60px" : "50px",
                height: expanded ? "60px" : "50px",
                objectFit: "cover",
                marginRight: expanded ? "10px" : "0",
                transition: "all 0.3s ease-in-out",
                backgroundColor: "darkcyan",
                border: "1px solid",
                padding: "5px",
              }}
            />
          </a>
          {expanded && (
            <span className="text-muted SF-UIDisplay fw-bold text-uppercase">
              {user?.role}
            </span>
          )}
        </div>

        {expanded && (
          <div className="my-2 text-title small text-body-emphasis">
            {user?.fullName || "Admin"}
          </div>
        )}
        <Button
          variant="danger"
          className="w-100 my-3 d-flex align-items-center justify-content-center"
          onClick={handleShowModal}
        >
          <FaSignOutAlt size={expanded ? 16 : 20} />
          {expanded && <span className="ms-2">Logout</span>}
        </Button>
      </div>

      <Modal show={showLogoutModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-custom fw-bold">Konfirmasi Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Apakah Anda yakin ingin keluar dari sesi ini?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Batal
          </Button>
          <Button variant="danger" onClick={handleSignOut}>
            Ya, Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Sidebar;
