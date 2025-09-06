import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      sessionStorage.clear();
      localStorage.removeItem("sessionExpiresAt");
    }

    return Promise.reject(error);
  }
);

export default instance;
