import express from "express";
import { submitPresensi } from "../controllers/presensiController.js";
import { protectedMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(protectedMiddleware, submitPresensi);

export default router;
