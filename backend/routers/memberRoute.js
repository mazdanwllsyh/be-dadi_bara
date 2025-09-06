import express from "express";
import {
  getMembers,
  createMember,
  getMemberById,
  updateMember,
  deleteMember,
} from "../controllers/memberController.js";
import upload from "../utils/upload.js";
import {
  protectedMiddleware,
  roleMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getMembers)
  .post(
    protectedMiddleware,
    roleMiddleware("admin", "superAdmin"),
    upload.single("foto"),
    createMember
  );

router
  .route("/:id")
  .get(getMemberById)
  .put(
    protectedMiddleware,
    roleMiddleware("admin", "superAdmin"),
    upload.single("foto"),
    updateMember
  )
  .delete(
    protectedMiddleware,
    roleMiddleware("admin", "superAdmin"),
    deleteMember
  );

export default router;
