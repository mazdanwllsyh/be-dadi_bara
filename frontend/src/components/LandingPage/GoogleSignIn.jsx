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
    flow: "auth-code",

    onSuccess: async (codeResponse) => {
      setIsLoading(true);
      try {
        // Kirim 'code' ke backend
        const response = await instance.post("/auth/google", {
          code: codeResponse.code,
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
      setIsLoading(false);
    },
  });

  return (
    <Button
      className="btn-google w-100 d-flex align-items-center justify-content-center"
      onClick={() => login()}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          <span className="ms-2">Memproses...</span>
        </>
      ) : (
        <>
          <GoogleIcon />
          <span className="ms-2">Lanjutkan dengan Google</span>
        </>
      )}
    </Button>
  );
};

export default GoogleSignIn;
