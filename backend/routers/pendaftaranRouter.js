import express from "express";
import {
  getPendaftar,
  addPendaftar,
  deletePendaftar,
} from "../controllers/pendaftaranController.js";
import {
  protectedMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protectedMiddleware, adminMiddleware, getPendaftar) 
  .post(addPendaftar); 
router
  .route("/:id")
  .delete(protectedMiddleware, adminMiddleware, deletePendaftar);

export default router;
