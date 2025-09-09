import React, { Suspense, useEffect, useContext, useState, lazy } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Header from "./LandingPage/Header";
import LazySection from "./LazySection";
import { UserContext } from "./LandingPage/UserContext";
import Home from "./LandingPage/section/Home";
import Transition from "./LandingPage/Transition";
import ProtectedRoute from "./ProtectedRoute";
import VerificationRoute from "./VerificationRoute";
import ThemedToastContainer from "./ThemedToastContainer";

const InterestModal = lazy(() => import("./LandingPage/InterestModal"));
const Gallery = lazy(() => import("./LandingPage/section/Gallery"));
const About = lazy(() => import("./LandingPage/section/About"));
const JadwalKegiatan = lazy(() =>
  import("./LandingPage/section/JadwalKegiatan")
);
const FAQ = lazy(() => import("./LandingPage/section/FAQ"));
const ContactUs = lazy(() => import("./LandingPage/section/ContactUs"));
const LoginPage = lazy(() => import("./LandingPage/LoginPage"));
const RegisterPage = lazy(() => import("./LandingPage/RegisterPage"));
const VerificationPage = lazy(() => import("./LandingPage/VerificationStep"));
const Pengurus = lazy(() => import("./LandingPage/section/Pengurus"));
const SK = lazy(() => import("./LandingPage/section/SK"));
const Profile = lazy(() => import("./LandingPage/section/Profile"));
const PendaftaranAnggota = lazy(() =>
  import("./LandingPage/section/PendaftaranAnggota")
);
const Presensi = lazy(() => import("./LandingPage/section/Presensi"));
const Donation = lazy(() => import("./LandingPage/section/Donation"));
const Footer = lazy(() => import("./LandingPage/Footer"));

function AppLandingPage() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(location.pathname);
  const backgroundLocation = location.state?.background;

  const isLoginPagePath = location.pathname === "/login";
  const isRegisterPagePath = location.pathname === "/register";
  const routesWithTransition = [
    "/",
    "/gallery",
    "/pengurus",
    "/sk",
    "/profile",
    "/pendaftaran",
    "/donation",
    "/presensi",
  ];
  const handleCloseAuthModals = () =>
    navigate(backgroundLocation?.pathname || "/", { replace: true });
  const handleSwitchToRegister = () =>
    navigate("/register", {
      state: { background: backgroundLocation || location },
    });
  const handleSwitchToLogin = () =>
    navigate("/login", {
      state: { background: backgroundLocation || location },
    });

  useEffect(() => {
    AOS.init({ duration: 1750, easing: "ease-in-out", once: true });
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 750);
      }
    }
  }, [location]);

  useEffect(() => {
    const getPageTitle = (pathname) => {
      switch (pathname) {
        case "/":
          return "Beranda";
        case "/gallery":
          return "Galeri";
        case "/pengurus":
          return "Pengurus";
        case "/sk":
          return "Surat Keputusan";
        case "/profile":
          return "Profil";
        case "/pendaftaran":
          return "Pendaftaran Anggota";
        case "/presensi":
          return "Presensi Anggota";
        case "/donation":
          return "Donasi";
        case "/login":
          return "Login";
        case "/register":
          return "Daftar Akun";
        case "/verification":
          return "Verifikasi Akun Anda";
        default:
          return "DADI BARA";
      }
    };
    document.title = `${getPageTitle(
      location.pathname
    )} | Karang Taruna DADI BARA`;
    if (
      routesWithTransition.includes(location.pathname) &&
      location.pathname !== currentRoute
    ) {
      setIsTransitioning(true);
      setCurrentRoute(location.pathname);
    }
  }, [location, currentRoute]);

  const MainRoutes = () => (
    <>
      <Home />
      <About />
      <JadwalKegiatan />
      <FAQ />
      <ContactUs />
    </>
  );

  const handleTransitionEnd = () => {
    setIsTransitioning(false);

    const pagesToScrollTop = [
      "/gallery",
      "/pengurus",
      "/sk",
      "/profile",
      "/pendaftaran",
      "/donation",
      "/presensi",
    ];

    if (
      pagesToScrollTop.includes(location.pathname) &&
      window.innerWidth > 991
    ) {
      window.scrollTo(0, 1);
    }

    AOS.refresh();
  };

  return (
    <>
      {!isTransitioning && <Header />}
      <div style={{ overflowX: "hidden" }}>
        {isTransitioning && (
          <Transition onTransitionEnd={handleTransitionEnd} />
        )}

        <Suspense fallback={<Transition isLoading={true} />}>
          <Routes location={backgroundLocation || location}>
            <Route
              path="/"
              element={
                <>
                  <Home />
                  <LazySection>
                    <About />
                  </LazySection>
                    <JadwalKegiatan />
                  <LazySection minHeight="70vh">
                    <FAQ />
                  </LazySection>
                  <LazySection minHeight="60vh">
                    <ContactUs />
                  </LazySection>
                </>
              }
            />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/pengurus" element={<Pengurus />} />
            <Route path="/sk" element={<SK />} />
            <Route path="/presensi" element={<Presensi />} />
            <Route path="/pendaftaran" element={<PendaftaranAnggota />} />
            <Route path="/donation" element={<Donation />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/" replace />
                ) : (
                  <>
                    <Home />
                    <About />
                    <JadwalKegiatan />
                    <FAQ />
                    <ContactUs />
                  </>
                )
              }
            />
            <Route
              path="/register"
              element={
                user ? (
                  <Navigate to="/profile" replace />
                ) : (
                  <>
                    <Home />
                    <About />
                    <JadwalKegiatan />
                    <FAQ />
                    <ContactUs />
                  </>
                )
              }
            />
            <Route
              path="/verification"
              element={
                <VerificationRoute>
                  <VerificationPage
                    show={true}
                    handleClose={handleCloseAuthModals}
                  />
                  <MainRoutes />
                </VerificationRoute>
              }
            />
            <Route path="*" element={<MainRoutes />} />
          </Routes>
        </Suspense>

        {!isTransitioning && <Footer />}

        {(backgroundLocation ||
          ["/login", "/register", "/verification"].includes(
            location.pathname
          )) && (
          <Suspense fallback={<div>Memuat Modal...</div>}>
            <Routes>
              <Route
                path="/login"
                element={
                  <LoginPage
                    show={true}
                    handleClose={handleCloseAuthModals}
                    handleShowRegister={handleSwitchToRegister}
                  />
                }
              />
              <Route
                path="/register"
                element={
                  <RegisterPage
                    show={true}
                    handleClose={handleCloseAuthModals}
                    handleShowLogin={handleSwitchToLogin}
                  />
                }
              />
              <Route
                path="/verification"
                element={
                  <VerificationPage
                    show={true}
                    handleClose={handleCloseAuthModals}
                  />
                }
              />
            </Routes>
          </Suspense>
        )}

        {user &&
          user.role === "user" &&
          !isLoginPagePath &&
          !isRegisterPagePath &&
          location.pathname !== "/pendaftaran" &&
          location.pathname !== "/presensi" &&
          location.pathname !== "/donation" && <InterestModal />}
        <ThemedToastContainer />
      </div>
    </>
  );
}

export default AppLandingPage;
