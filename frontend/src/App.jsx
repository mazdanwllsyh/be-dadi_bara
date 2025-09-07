import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import AdminRoute from "./components/AdminRoute.jsx";
import { UserProvider } from "./components/LandingPage/UserContext.jsx";
import { AppProvider } from "./components/LandingPage/AppContext.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import ThemedToastContainer from "./components/ThemedToastContainer.jsx";
import instance from "./utils/axios.js";

import AOS from "aos";
import "aos/dist/aos.css";

const Transition = lazy(() =>
  import("./components/LandingPage/Transition.jsx")
);
const AppLandingPage = lazy(() => import("./components/AppLandingPage.jsx"));
const AppDashboard = lazy(() => import("./components/AppDashboard.jsx"));

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1400,
      easing: "ease-in-out",
      once: true,
    });

    instance
      .get("/auth/getuser")
      .then((res) => {})
      .catch((err) => {});
  }, []);

  return (
    <AppProvider>
      <UserProvider>
        <Suspense fallback={<Transition isLoading={true} />}>
          <Routes>
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AppDashboard />
                </AdminRoute>
              }
            />
            <Route path="/*" element={<AppLandingPage />} />
          </Routes>
        </Suspense>
      </UserProvider>

      <ThemedToastContainer />
    </AppProvider>
  );
}

export default App;
