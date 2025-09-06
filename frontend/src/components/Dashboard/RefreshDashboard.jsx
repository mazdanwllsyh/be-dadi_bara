import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { IoMdRefresh } from "react-icons/io";
import { useLocation } from "react-router-dom";

const RefreshDashboard = ({ isMobile }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const location = useLocation();
  const REFRESH_INTERVAL_SECONDS = 300; 

  useEffect(() => {
    if (!location.pathname.startsWith("/admin")) {
      return;
    }

    let secondsPassed = 0;

    const intervalId = setInterval(() => {
      secondsPassed++;

      const secondsLeft = REFRESH_INTERVAL_SECONDS - secondsPassed;

      if (secondsLeft <= 45) {
        setCountdown(secondsLeft);
      }

      if (secondsLeft <= 0) {
        clearInterval(intervalId);
        window.location.reload();
      }
    }, 1000); 

    return () => clearInterval(intervalId);
  }, [location]);

  useEffect(() => {
    const specificPages = [
      "/admin/landingpage",
      "/admin/gallery-dashboard",
      "/admin/keanggotaan",
      "/admin/keuangan",
      "/admin/data-admin",
    ];
    const currentPage = location.pathname;
    const hasBeenRefreshedKey = `refreshed-${currentPage}`;
    const hasBeenRefreshed = sessionStorage.getItem(hasBeenRefreshedKey);

    if (specificPages.includes(currentPage) && !hasBeenRefreshed) {
      const specificPageTimerId = setTimeout(() => {
        sessionStorage.setItem(hasBeenRefreshedKey, "true");
        window.location.reload();
      }, 450);
      return () => clearTimeout(specificPageTimerId);
    }
  }, [location]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const buttonStyle = {
    position: "fixed",
    width: "2.8rem",
    height: "2.8rem",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    zIndex: 1050,
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    ...(isMobile
      ? { top: "95px", right: "20px" }
      : { bottom: "30px", right: "20px" }),
  };

  if (!location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <Button
      variant="secondary"
      style={buttonStyle}
      onClick={handleRefresh}
      disabled={isRefreshing}
      aria-label="Refresh Dashboard"
    >
      {countdown !== null ? (
        <b style={{ fontSize: "1.2rem" }}>{countdown}</b>
      ) : (
        <IoMdRefresh className={isRefreshing ? "spinning-icon" : ""} />
      )}
    </Button>
  );
};

export default RefreshDashboard;
