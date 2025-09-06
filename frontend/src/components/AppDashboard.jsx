import React, { useState, useEffect, useContext, lazy, Suspense } from "react"; 
import { Routes, Route, useLocation } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { UserContext } from "./LandingPage/UserContext";
import RefreshDashboard from "./Dashboard/RefreshDashboard";
import SessionTimer from "./Dashboard/SessionTimer";
import Sidebar from "./Dashboard/Sidebar";
import OffcanvasHeader from "./Dashboard/OffcanvasHeader";

const Dashboard = lazy(() => import("./Dashboard/Dashboard"));
const LandingPageDashboard = lazy(() =>
  import("./Dashboard/LandingPageDashboard")
);
const GalleryEditor = lazy(() => import("./Dashboard/GalleryEditor"));
const Keanggotaan = lazy(() => import("./Dashboard/Keanggotaan"));
const KeuanganDashboard = lazy(() => import("./Dashboard/KeuanganDashboard"));
const PendaftaranDashboard = lazy(() =>
  import("./Dashboard/PendaftaranDashboard")
);
const UserDashboard = lazy(() => import("./Dashboard/UserDashboard"));
const AdminDashboard = lazy(() => import("./Dashboard/AdminDashboard"));

const AppDashboard = () => {
  const { user } = useContext(UserContext); 
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const getPageTitle = (pathname) => {
      switch (pathname) {
        case "/dashboard":
        case "/admin":
          return "Dashboard";
        case "/admin/landingpage":
          return "Pengaturan Landing Page";
        case "/admin/gallery-dashboard":
          return "Manajemen Galeri";
        case "/admin/keanggotaan":
          return "Manajemen Keanggotaan";
        case "/admin/keuangan":
          return "Laporan Keuangan";
        case "/admin/pendaftaran":
          return "Pendaftaran Anggota";
        case "/admin/data-user":
          return "Akun Pengguna";
        case "/admin/data-admin":
          return "Para Admin";
        default:
          return "Admin Dadi Bara";
      }
    };
    document.title = `${getPageTitle(location.pathname)} | Admin DADI BARA`;
  }, [location]);

  const handleOffcanvasShow = () => setShowOffcanvas(true);
  const handleOffcanvasClose = () => setShowOffcanvas(false);

  const expandedWidth = "10px";
  const collapsedWidth = "6px";

  return (
    <div className="dashboard-layout" style={{ display: "flex" }}>
      {isMobile ? (
        <OffcanvasHeader
          show={showOffcanvas}
          handleClose={handleOffcanvasClose}
          handleOffcanvasShow={handleOffcanvasShow}
        />
      ) : (
        <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
      )}

      <main
        className="dashboard-content"
        style={{
          flex: 1,
          padding: isMobile ? "80px 20px 20px 20px" : "20px",
          transition: "margin-left 0.3s ease",
          marginLeft: isMobile
            ? 0
            : sidebarExpanded
            ? expandedWidth
            : collapsedWidth,
        }}
      >
        <Suspense
          fallback={
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "100vh" }}
            >
              <Spinner animation="border" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/landingpage" element={<LandingPageDashboard />} />
            <Route path="/gallery-dashboard" element={<GalleryEditor />} />
            <Route path="/keanggotaan" element={<Keanggotaan />} />
            <Route path="/keuangan" element={<KeuanganDashboard />} />
            <Route path="/pendaftaran" element={<PendaftaranDashboard />} />
            <Route path="/data-user" element={<UserDashboard />} />
            <Route path="/data-admin" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </main>

      <RefreshDashboard isMobile={isMobile} />
      {user && (user.role === "admin" || user.role === "superAdmin") && <SessionTimer />}
    </div>
  );
};

export default AppDashboard;
