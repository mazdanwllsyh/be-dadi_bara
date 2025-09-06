import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./LandingPage/UserContext.jsx";
import { Spinner } from "react-bootstrap";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);

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

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
