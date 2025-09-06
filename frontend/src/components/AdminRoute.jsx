import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "./LandingPage/UserContext.jsx"; 
import { Spinner } from "react-bootstrap";

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  if (user && (user.role === "admin" || user.role === "superAdmin")) {
    return children;
  }

  if (user) {
    return <Navigate to="/profile" replace />;
  } else {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default AdminRoute;
