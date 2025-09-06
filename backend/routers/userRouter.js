import express from "express";
import {
  registerRequest,
  verifyUser,
  resendVerification,
  loginUser,
  getUser,
  getUserStats,
  createAdmin,
  deleteAdmin,
  updateAdmin,
  deleteMyAccount,
  deleteSuperAdmin,
  getManagementUsers,
  getUsers,
  deleteUserByAdmin,
  logoutUser,
  updateUserProfile,
  googleAuth,
} from "../controllers/userControllers.js";
import {
  protectedMiddleware,
  roleMiddleware,
  superAdminMiddleware,
} from "../middlewares/authMiddleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

// Rute Otentikasi & Sesi
router.post("/register-request", registerRequest);
router.post("/register-verify", verifyUser);
router.post("/resend-verification", resendVerification);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.get("/logout", logoutUser);
router.post("/refresh-token", protectedMiddleware, (req, res) => {
  createSendResToken(req.user, 200, res, true);
});

// Rute Data Pengguna
router.get("/getuser", protectedMiddleware, getUser);
router.put(
  "/profile",
  protectedMiddleware,
  upload.single("profilePicture"),
  updateUserProfile
);

// Rute Manajemen (Admin & SuperAdmin)
router.get(
  "/stats",
  protectedMiddleware,
  roleMiddleware("admin", "superAdmin"),
  getUserStats
);
router.get(
  "/management/users",
  protectedMiddleware,
  superAdminMiddleware,
  getManagementUsers
);
router.get(
  "/users",
  protectedMiddleware,
  roleMiddleware("admin", "superAdmin"),
  getUsers
);
router.post("/admins", protectedMiddleware, superAdminMiddleware, createAdmin);
router.delete(
  "/admins/:id",
  protectedMiddleware,
  superAdminMiddleware,
  deleteAdmin
);
router.put(
  "/admins/:id",
  protectedMiddleware,
  superAdminMiddleware,
  updateAdmin
);
router.delete(
  "/users/:id",
  protectedMiddleware,
  roleMiddleware("admin", "superAdmin"),
  deleteUserByAdmin
);
router.delete("/profile", protectedMiddleware, deleteMyAccount);
router.delete(
  "/superadmins/:id",
  protectedMiddleware,
  superAdminMiddleware,
  deleteSuperAdmin
);

export default router;
