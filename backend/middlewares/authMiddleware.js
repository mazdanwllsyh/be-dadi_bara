import jwt from "jsonwebtoken";
import User from "../models/UserModels.js";
import asyncHandler from "./asyncHandler.js";
import { signToken, getCookieOptions } from "../controllers/userControllers.js";

const refreshAuthToken = async (oldToken) => {
  const decodedOld = jwt.decode(oldToken);
  if (!decodedOld || !decodedOld.id) {
    throw new Error("Token lama tidak valid untuk refresh.");
  }

  const user = await User.findById(decodedOld.id).select("-password");

  if (!user || user.sessionTokenId !== decodedOld.sessionId) {
    throw new Error("Sesi lama tidak valid.");
  }

  const newToken = signToken(user._id, user.role, user.sessionTokenId);
  const decodedNew = jwt.decode(newToken);

  const cookieOptions = getCookieOptions();
  cookieOptions.expires = new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  );

  user.sessionExpiresAt = decodedNew.exp * 1000;

  return {
    token: newToken,
    cookieOptions: cookieOptions,
    user: user,
  };
};

export const protectedMiddleware = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;

  if (!token) {
    res.status(401);
    throw new Error("Tidak terotentikasi, tidak ada token.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.sessionTokenId !== decoded.sessionId) {
      res.status(401);
      throw new Error("Tidak terotentikasi, sesi tidak valid.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401);
      throw new Error("Sesi telah berakhir. Silakan login kembali.");
    } else {
      res.status(401);
      throw new Error("Token tidak valid atau rusak.");
    }
  }
});

export const adminMiddleware = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "superAdmin")
  ) {
    next();
  } else {
    res.status(401);
    throw new Error("Tidak diizinkan, khusus Admin.");
  }
};

export const superAdminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "superAdmin") {
    next();
  } else {
    res.status(401);
    throw new Error("Tidak diizinkan, khusus Super Admin.");
  }
};

export const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Akses ditolak. Peran Anda bukan ${roles.join(" atau ")}.`
      );
    }
    next();
  };
};
