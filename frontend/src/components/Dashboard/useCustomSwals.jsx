// src/hooks/useCustomSwals.js

import { useContext } from "react";
import Swal from "sweetalert2";
import { AppContext } from "../LandingPage/AppContext";

const useCustomSwals = () => {
  const { theme } = useContext(AppContext);

  const showConfirmSwal = async (title, text) => {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: "warning",
      theme: theme,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#2C9B13FF",
      confirmButtonText: "Iya, Lanjutkan!",
      cancelButtonText: "Batal",
    });
    return result.isConfirmed;
  };

  const showSuccessSwal = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: "success",
      theme: theme,
    });
  };

  const showErrorSwal = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: "error",
      theme: theme,
    });
  };

  const showInfoSwal = (title, text) => {
    Swal.fire({
      title: title,
      text: text,
      icon: "info",
      theme: theme,
      confirmButtonColor: "#0D6EFD",
    });
  };

  const showQuestionSwal = async (title, text) => {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: "question",
      theme: theme,
      showCancelButton: true,
      confirmButtonColor: "#198754",
      cancelButtonColor: "#dc3545",
      confirmButtonText: "Iya",
      cancelButtonText: "Tidak",
    });
    return result.isConfirmed;
  };

  return {
    showConfirmSwal,
    showSuccessSwal,
    showErrorSwal,
    showInfoSwal,
    showQuestionSwal,
  };
};

export default useCustomSwals;
