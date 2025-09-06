import React, { useContext } from "react";
import { ToastContainer } from "react-toastify";
import { AppContext } from "./LandingPage/AppContext";

const ThemedToastContainer = () => {
  const { theme } = useContext(AppContext);

  return (
    <ToastContainer
      position="bottom-center"
      autoClose={2500}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
    />
  );
};

export default ThemedToastContainer;
