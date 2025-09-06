import express from "express";
import { getSkDocument, uploadSk } from "../controllers/skController.js";
import upload from "../utils/upload.js"; // Middleware Multer
import {
  protectedMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getSkDocument) // Rute publik untuk menampilkan SK
  .post(
    protectedMiddleware,
    adminMiddleware,
    upload.single("sk_document"),
    uploadSk
  );

export default router;
