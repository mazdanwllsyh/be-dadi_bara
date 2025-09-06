import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { UserContext } from "./UserContext.jsx";
import React, { useContext, useState } from "react";
import instance from "../../utils/axios.js";
import { useNavigate } from "react-router-dom";
import { Button, Spinner } from "react-bootstrap";
import GoogleIcon from "./GoogleIcon.jsx";

const GoogleSignIn = ({ onLoginSuccess, handleClose }) => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const response = await instance.post("/auth/google", {
          token: tokenResponse.access_token,
        });

        if (onLoginSuccess) {
          onLoginSuccess(response.data.user);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Login Google gagal.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Login Google gagal.");
    },
    scope: "openid email profile",
  });

  return (
    <Button
      className="btn-google w-100 d-flex align-items-center justify-content-center"
      onClick={() => login()}
      disabled={isLoading}
    >
      {isLoading ? <Spinner size="sm" className="me-2" /> : <GoogleIcon />}
      <span className="ms-2">Lanjutkan dengan Google</span>
    </Button>
  );
};

export default GoogleSignIn;
