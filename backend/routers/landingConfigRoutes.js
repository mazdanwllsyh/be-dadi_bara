import express from "express";
import {
  getLandingConfig,
  updateLandingConfig,
} from "../controllers/landingConfigController.js";
import upload from "../utils/upload.js"; // Konfigurasi multer
import {
  protectedMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getLandingConfig) 
  .put(
    protectedMiddleware,
    adminMiddleware,
    upload.fields([
      { name: "logoDadiBara", maxCount: 1 },
      { name: "logoDesaBaru", maxCount: 1 },
    ]),
    updateLandingConfig
  ); // Rute aman untuk update

export default router;
