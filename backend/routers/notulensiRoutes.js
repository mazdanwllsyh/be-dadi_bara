import express from "express";
import {
  updateNotulensi,
  deleteNotulensi,
} from "../controllers/notulensiController.js";
import {
  protectedMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.route("/:id").put(
  protectedMiddleware,
  adminMiddleware,
  upload.fields([
    { name: "document1", maxCount: 1 },
    { name: "document2", maxCount: 1 },
  ]),
  updateNotulensi
);

router
  .route("/:id")
  .delete(protectedMiddleware, adminMiddleware, deleteNotulensi);

export default router;
