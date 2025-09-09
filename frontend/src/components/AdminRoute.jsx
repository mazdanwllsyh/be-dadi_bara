import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "./LandingPage/UserContext";
import Transition from "./LandingPage/Transition";

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();
  if (loading) {
    return <Transition isLoading={true} />;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user.role !== "admin" && user.role !== "superAdmin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AdminRoute;
