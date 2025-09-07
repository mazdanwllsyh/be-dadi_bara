import { HashLink as Link } from "react-router-hash-link";
import React, { useState, useEffect, useContext } from "react";
import { Navbar, Nav, Container, NavDropdown, Image } from "react-bootstrap";
import {
  FaHome,
  FaCheckSquare,
  FaUsers,
  FaUserFriends,
  FaEnvelope,
  FaDoorClosed,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { FaTableList } from "react-icons/fa6";
import { HiDocumentText } from "react-icons/hi";
import { HiMiniBars4 } from "react-icons/hi2";
import "bootstrap/dist/css/bootstrap.min.css";
import { AppContext } from "./AppContext";
import { UserContext } from "./UserContext";
import ThemeSwitcher from "./ThemeSwitcher.jsx";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const { data } = useContext(AppContext);
  const { user, setUser, logout } = useContext(UserContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 990);
  const navigate = useNavigate();
  const location = useLocation();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 990);

    const controlNavbar = () => {
      if (isMobile || window.scrollY < 100) {
        setIsVisible(true);
        return;
      }

      if (window.scrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(window.scrollY);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", controlNavbar, { passive: true });

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY, isMobile]);

  const handleProfileClick = () => {
    navigate("/profile", { state: { from: location.pathname } });
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Navbar
      expand="lg"
      className={`navbar sticky-top ${!isVisible ? "navbar--hidden" : ""}`}
    >
      <Container className="d-flex justify-content-between align-items-center">
        <Navbar.Brand as={Link} to="/#home">
          <img
            src={data.logoDadiBara}
            alt="Logo"
            width="70"
            height="auto"
            fetchpriority="high"
          />
        </Navbar.Brand>

        {isMobile && (
          <div className="d-flex align-items-center">
            <ThemeSwitcher />
            {user ? (
              <Image
                src={user?.profilePicture || "/default-avatar.png"}
                alt="Profil"
                roundedCircle
                onClick={handleProfileClick}
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "cover",
                  cursor: "pointer",
                  margin: "0 8px",
                  border: "3px solid darkcyan",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.55)",
                  backgroundColor: "darkcyan",
                }}
              />
            ) : (
              <Link
                to="/login"
                state={{ background: location }}
                className="btn sidebar-link me-2 shadow"
              >
                <FaDoorClosed className="me-2" />
                Login
              </Link>
            )}
            <Navbar.Toggle aria-controls="basic-navbar-nav" className="shadow">
              <HiMiniBars4 style={{ fontSize: "1.8rem" }} />
            </Navbar.Toggle>
          </div>
        )}

        {!isMobile && (
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0">
            <HiMiniBars4 style={{ color: "black", fontSize: "1.5rem" }} />
          </Navbar.Toggle>
        )}

        <Navbar.Collapse
          id="basic-navbar-nav"
          className="justify-content-center"
        >
          <Nav>
            <Nav.Link as={Link} to="/#home">
              <FaHome className="me-2" /> Beranda
            </Nav.Link>
            <Nav.Link as={Link} to="/#jadwal">
              <FaTableList className="me-2" /> Jadwal Kegiatan
            </Nav.Link>
            {user && user.role === "user" && (
              <Nav.Link as={Link} to="/presensi">
                <FaCheckSquare className="me-2" /> Presensi
              </Nav.Link>
            )}
            <NavDropdown
              title={
                <>
                  <FaUsers className="me-2" /> Keanggotaan
                </>
              }
              id="navbarDropdown"
            >
              <NavDropdown.Item as={Link} to="/pengurus">
                <FaUserFriends className="me-2" />
                Pengurus {data.namaOrganisasi}
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/sk">
                <HiDocumentText className="me-2" />
                SK {data.namaOrganisasi}
              </NavDropdown.Item>
            </NavDropdown>
            {(!user ||
              (user.role !== "admin" && user.role !== "superAdmin")) && (
              <Nav.Link as={Link} to="/#contact-us">
                <FaEnvelope className="me-2" /> Kontak Kami
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>

        {!isMobile && (
          <div className="d-flex align-items-center">
            <ThemeSwitcher />
            {user ? (
              <NavDropdown
                title={
                  <Image
                    src={user?.profilePicture || "/default-avatar.png"}
                    alt="Profil"
                    roundedCircle
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      cursor: "pointer",
                      border: "2px solid",
                      backgroundColor: "darkblue",
                    }}
                    className="shadow-lg border-black-emphasis"
                  />
                }
                id="user-dropdown"
                align="end"
                className="profile-dropdown"
              >
                <NavDropdown.Item onClick={handleProfileClick}>
                  <FaUser className="m-2" /> Profil Saya
                </NavDropdown.Item>
                {(user.role === "admin" || user.role === "superAdmin") && (
                  <NavDropdown.Item onClick={() => navigate("/admin")}>
                    <MdDashboard className="m-2" /> Dashboard
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="fw-bold">
                  <FaSignOutAlt className="m-2" /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Link
                to="/login"
                state={{ background: location }}
                className="btn sidebar-link shadow"
              >
                <FaDoorClosed className="me-1" /> Login
              </Link>
            )}
            <div
              style={{
                width: "3px",
                height: "65px",
                backgroundColor: "darkcyan",
                margin: "0 6px",
                borderRadius: "9px",
              }}
            />
            <Navbar.Brand href="https://www.bejalen.com/" rel="noreferrer">
              <img
                src={data.logoDesaBaru}
                alt="LogoDesa"
                width="70"
                height="auto"
                fetchpriority="high"
              />
            </Navbar.Brand>
          </div>
        )}
      </Container>
    </Navbar>
  );
};

export default Header;
