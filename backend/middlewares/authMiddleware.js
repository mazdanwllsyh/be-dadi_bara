import jwt from "jsonwebtoken";
import User from "../models/UserModels.js";
import asyncHandler from "./asyncHandler.js";

export const protectedMiddleware = asyncHandler(async (req, res, next) => {
  console.log("\nBACKEND: Masuk ke protectedMiddleware.");
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);
      if (!user) {
        console.log("BACKEND: User dengan ID tersebut tidak ditemukan di DB.");
        res.status(401);
        throw new Error("User yang terhubung dengan token ini tidak lagi ada.");
      }

      if (user.sessionTokenId !== decoded.sessionId) {
        res.clearCookie("jwt");
        res.status(401);
        throw new Error(
          "Sesi ini sudah tidak aktif karena ada Login menggunakan perangkat lain."
        );
      }

      const userForRequest = user.toObject();
      delete userForRequest.password;

      req.user = userForRequest;
      next();
    } catch (error) {
      console.error(
        "BACKEND: Terjadi error di dalam blok try-catch middleware:",
        error.message
      );
      res.status(401);
      throw new Error("Silakan Login terlebih dahulu.");
    }
  } else {
    console.log("BACKEND: Tidak ada token di cookie.");
    res.status(401);
    throw new Error("Not Authorized, tidak ada token.");
  }
});

export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "superAdmin")
  ) {
    next();
  } else {
    res.status(401);
    throw new Error("Not Authorized as Admin");
  }
});

export const superAdminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "superAdmin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not Authorized as Super Admin");
  }
});

export const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Akses ditolak. Peran Anda bukan ${roles.join(" atau ")}.`
      );
    }
    next();
  };
};
