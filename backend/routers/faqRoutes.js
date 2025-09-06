import express from "express";
import {
  getFaq,
  createFaq,
  updateFaq,
  deleteFaq,
} from "../controllers/FaqController.js";
import {
  protectedMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getFaq)
  .post(protectedMiddleware, adminMiddleware, createFaq);

router
  .route("/:id")
  .put(protectedMiddleware, adminMiddleware, updateFaq)
  .delete(protectedMiddleware, adminMiddleware, deleteFaq);

export default router;
