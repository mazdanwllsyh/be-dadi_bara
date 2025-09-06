import React, { useContext, useEffect } from "react";
import { useGoogleOneTapLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { UserContext } from "./UserContext.jsx";
import { AppContext } from "./AppContext.jsx";
import instance from "../../utils/axios.js";
import { useNavigate } from "react-router-dom";

const GoogleOneTap = ({ onLoginSuccess }) => {
  const { user, setUser } = useContext(UserContext);
  const { theme } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const oneTapContainer = document.getElementById("oneTap-prompt-container");
    if (oneTapContainer) {
      oneTapContainer.setAttribute(
        "data-theme",
        theme === "dark" ? "filled_black" : "outline"
      );
    }
  }, [theme]);

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      try {
        const response = await instance.post("/auth/google-onetap", {
          credential: credentialResponse.credential,
        });

        if (onLoginSuccess) {
          onLoginSuccess(response.data.user);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Login One Tap gagal.");
      }
    },
    disabled: !!user,

    prompt_parent_id: "oneTap-prompt-container",

    onError: () => {
      console.log("One Tap Login Error");
    },
  });

  return null;
};

export default GoogleOneTap;
