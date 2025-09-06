import React, { useState, useEffect, useContext } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "./LandingPage/UserContext";

const VerificationRoute = ({ children }) => {
  const location = useLocation();
  const { user } = useContext(UserContext);

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  const emailForVerification =
    location.state?.email || localStorage.getItem("verificationEmail");

  if (!emailForVerification) {
    toast.warn("Harap lakukan registrasi atau login terlebih dahulu.");
    return <Navigate to="/register" state={{ background: location }} replace />;
  }

  return children;
};

export default VerificationRoute;
