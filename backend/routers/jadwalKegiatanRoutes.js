import express from "express";
import {
  getJadwalKegiatan,
  createJadwalKegiatan,
  updateJadwalKegiatan,
  deleteJadwalKegiatan,
} from "../controllers/jadwalKegiatanController.js";
import {
  protectedMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getJadwalKegiatan)
  .post(protectedMiddleware, adminMiddleware, createJadwalKegiatan);
router
  .route("/:id")
  .put(protectedMiddleware, adminMiddleware, updateJadwalKegiatan)
  .delete(protectedMiddleware, adminMiddleware, deleteJadwalKegiatan);

export default router;
