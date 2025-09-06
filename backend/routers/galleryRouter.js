import express from "express";
import {
  getGalleryImages,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from "../controllers/galleryController.js";
import upload from "../utils/upload.js"; 
import {
  protectedMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getGalleryImages)
  .post(
    protectedMiddleware,
    adminMiddleware,
    upload.single("image"),
    createGalleryImage
  );

router
  .route("/:id")
  .put(
    protectedMiddleware,
    adminMiddleware,
    upload.single("image"),
    updateGalleryImage
  )
  .delete(protectedMiddleware, adminMiddleware, deleteGalleryImage);

export default router;
