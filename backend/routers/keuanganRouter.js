import express from "express";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/keuanganController.js";
import upload from "../utils/upload.js"; 
import {
  protectedMiddleware,
  adminMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protectedMiddleware, adminMiddleware, getTransactions)
  .post(
    protectedMiddleware,
    adminMiddleware,
    upload.single("document"),
    createTransaction
  );

router
  .route("/:id")
  .put(
    protectedMiddleware,
    adminMiddleware,
    upload.single("document"),
    updateTransaction
  )
  .delete(protectedMiddleware, adminMiddleware, deleteTransaction);

export default router;
