import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "./LandingPage/UserContext.jsx";
import Transition from "./LandingPage/Transition.jsx";

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  if (loading) {
    return <Transition isLoading={true} />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role === "admin" || user.role === "superAdmin") {
    return children;
  }

  return <Navigate to="/profile" replace />;
};

export default AdminRoute;
