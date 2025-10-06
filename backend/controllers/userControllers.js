import User from "../models/UserModels.js";
import Member from "../models/memberModel.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import asyncHandler from "../middlewares/asyncHandler.js";
import { sendEmailVerify, sendWelcomeEmail } from "../utils/sendEmail.js";
import { OAuth2Client } from "google-auth-library";
import Testimonial from "../models/TestimonialModel.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import sharp from "sharp";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

export const getCookieOptions = () => {
  const options = {
    httpOnly: true,
    path: "/",
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
    options.sameSite = "None";
  } else {
    options.sameSite = "lax";
  }
  return options;
};

export const signToken = (id, role, sessionId) => {
  let expiresIn;
  switch (role) {
    case "superAdmin":
      expiresIn = "20m";
      break;
    case "admin":
      expiresIn = "43m";
      break;
    case "user":
      expiresIn = "82m";
      break;
    default:
      expiresIn = "25";
  }
  return jwt.sign({ id, sessionId }, process.env.JWT_SECRET, { expiresIn });
};

const createSendResToken = async (
  user,
  statusCode,
  res,
  isRefreshToken = false
) => {
  let token;

  if (!isRefreshToken) {
    const newSessionId = crypto.randomBytes(16).toString("hex");
    user.sessionTokenId = newSessionId;
    await user.save();
    token = signToken(user._id, user.role, newSessionId);
  } else {
    token = signToken(user._id, user.role, user.sessionTokenId);
  }

  const decodedToken = jwt.decode(token);
  const sessionExpiresAt = decodedToken.exp * 1000;

  const cookieOptions = getCookieOptions();
  cookieOptions.expires = new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  );

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  const userResponse = user.toObject ? user.toObject() : { ...user };
  delete userResponse.password;
  userResponse.sessionExpiresAt = sessionExpiresAt;

  if (!isRefreshToken) {
    const userWithToken = { ...user.toObject(), token };
    sendWelcomeEmail(userWithToken).catch((err) => console.error(err)); 
  }

  res.status(statusCode).json({ user: userResponse });
};

export const logoutUser = (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  const cookieOptions = getCookieOptions();
  cookieOptions.expires = new Date(0);
  res.cookie("jwt", "loggedout", cookieOptions);
  res.status(200).json({ message: "Logout berhasil" });
};

export const deleteMyAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(400);
    throw new Error("Password wajib diisi untuk menghapus akun.");
  }
  const user = await User.findById(req.user._id);
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Password yang Anda masukkan salah.");
  }
  if (user.cloudinaryId) {
    await cloudinary.uploader.destroy(user.cloudinaryId);
  }
  await user.deleteOne();

  const cookieOptions = getCookieOptions();
  cookieOptions.expires = new Date(0);
  res.cookie("jwt", "loggedout", cookieOptions);

  res
    .status(200)
    .json({ message: "Akun Anda telah berhasil dihapus secara permanen." });
});

const streamUploadFromBuffer = (buffer, folderName) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { folder: folderName, resource_type: "auto" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const registerRequest = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, confirmPassword } = req.body;

  if (!fullName || !email || !phone || !password || !confirmPassword) {
    res.status(400);
    throw new Error("Semua kolom wajib diisi.");
  }
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("Password dan Konfirmasi Password tidak cocok.");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    if (userExists.isVerified) {
      res.status(400);
      throw new Error("Email sudah terdaftar. Silakan Login.");
    } else {
      res.status(400);
      throw new Error(
        "Email ini sudah didaftarkan tapi belum diverifikasi. Silakan Verifikasi terlebih dahulu."
      );
    }
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const verificationExpires = Date.now() + 10 * 60 * 1000;

  const newUser = await User.create({
    fullName,
    phone,
    email,
    password,
    verificationCode,
    verificationExpires,
    isVerified: false,
    role: "user",
  });

  await sendEmailVerify(newUser.email, verificationCode);

  res.status(201).json({
    message: `Pendaftaran berhasil. Kode verifikasi telah dikirim ke ${newUser.email}.`,
  });
});

const processGooglePayload = async (payload) => {
  const { email, name, picture } = payload;
  if (!email) {
    throw new Error("Tidak dapat mengambil email dari kredensial Google.");
  }
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      fullName: name,
      email,
      password: Math.random().toString(36).slice(-8),
      isVerified: true,
      profilePicture: picture,
      role: "user",
    });
  } else {
    if (picture && !user.profilePicture) {
      user.profilePicture = picture;
      await user.save();
    }
  }

  const existingTestimonial = await Testimonial.findOne({ user: user._id });
  const userForFrontend = user.toObject();
  userForFrontend.hasSubmittedTestimonial = !!existingTestimonial;
  return userForFrontend;
};

export const googleAuth = asyncHandler(async (req, res) => {
  const { credential, code } = req.body;
  const tokenFromFrontend = code || credential;

  if (!tokenFromFrontend) {
    res.status(400);
    throw new Error("Kredensial Google atau Authorization Code tidak ada.");
  }

  try {
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: tokenFromFrontend,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (error) {
      console.log(
        "Verifikasi sebagai ID Token gagal, mencoba menukar sebagai Authorization Code..."
      );

      const { tokens } = await client.getToken(tokenFromFrontend);
      const idToken = tokens.id_token;

      if (!idToken) {
        throw new Error("Gagal mendapatkan ID Token setelah penukaran kode.");
      }

      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    }

    const user = await processGooglePayload(payload);

    const userInDb = await User.findById(user._id);
    createSendResToken(userInDb, 200, res);
  } catch (finalError) {
    console.error("Gagal total saat otentikasi Google:", finalError);
    res.status(400);
    throw new Error("Kredensial Google tidak valid atau sudah kedaluwarsa.");
  }
});

export const verifyUser = asyncHandler(async (req, res) => {
  const { email, verificationCode } = req.body;

  const user = await User.findOne({
    email,
    verificationCode,
    verificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Kode verifikasi tidak valid atau sudah kedaluwarsa.");
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationExpires = undefined;
  await user.save();

  createSendResToken(user, 200, res);
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Email wajib diisi.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("Email yang Anda masukkan tidak terdaftar.");
  }
  if (user.isVerified) {
    res.status(400);
    throw new Error("Akun ini sudah aktif. Silakan langsung login.");
  }

  user.verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  user.verificationExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  await sendEmailVerify(user.email, user.verificationCode);

  res.status(200).json({
    message: `Kode verifikasi baru telah berhasil dikirim ke ${user.email}.`,
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email/Password tidak boleh kosong");
  }

  const userData = await User.findOne({ email });

  if (!userData || !(await userData.comparePassword(password))) {
    res.status(401);
    throw new Error("Email atau Password tidak sesuai");
  }

  if (userData.role === "user" && !userData.isVerified) {
    res.status(403);
    throw new Error(
      "Akun Anda belum diverifikasi. Silakan lakukan Verifikasi terlebih dahulu."
    );
  }

  createSendResToken(userData, 200, res);
});

export const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: "user" });
  const totalAdmins = await User.countDocuments({ role: "admin" });
  const totalSuperAdmins = await User.countDocuments({ role: "superAdmin" });
  const totalPengurus = await Member.countDocuments();

  res.status(200).json({
    totalUsers,
    totalAdmins,
    totalSuperAdmins,
    totalPengurus,
  });
});

export const getAdminData = asyncHandler(async (req, res) => {
  if (req.user.role !== "superAdmin") {
    res.status(403);
    throw new Error("Akses ditolak. Hanya Super Admin yang diizinkan.");
  }

  const superAdmins = await User.find({ role: "superAdmin" }).select(
    "-password"
  );
  const admins = await User.find({ role: "admin" }).select("-password");

  res.status(200).json({ superAdmins, admins });
});

export const getManagementUsers = asyncHandler(async (req, res) => {
  const superAdmins = await User.find({ role: "superAdmin" }).select(
    "-password"
  );
  const admins = await User.find({ role: "admin" }).select("-password");

  res.status(200).json({ superAdmins, admins });
});

export const deleteAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user && user.role === "admin") {
    await user.deleteOne();
    res.status(200).json({ message: "Admin berhasil dihapus" });
  } else {
    res.status(404);
    throw new Error("Admin tidak ditemukan");
  }
});

export const updateAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.params.id);

  if (admin && admin.role === "admin") {
    admin.fullName = req.body.fullName || admin.fullName;

    if (req.body.password && req.body.password.length > 0) {
      const newPassword = req.body.password;

      if (req.body.password.length < 10) {
        res.status(400);
        throw new Error("Password baru minimal harus 10 karakter.");
      }
      const digitCount = (newPassword.match(/\d/g) || []).length;
      if (digitCount < 3) {
        res.status(400);
        throw new Error(
          "Password baru harus mengandung setidaknya tiga (3) angka."
        );
      }
      if (newPassword.toLowerCase().includes("admin")) {
        res.status(400);
        throw new Error("Password tidak boleh mengandung kata 'admin'.");
      }

      if (/^\d+$/.test(newPassword)) {
        res.status(400);
        throw new Error("Password tidak boleh hanya terdiri dari angka.");
      }

      if (!/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
        res.status(400);
        throw new Error("Password harus merupakan kombinasi huruf dan angka.");
      }

      const sequentialPatterns = [
        "123",
        "234",
        "345",
        "456",
        "567",
        "678",
        "789",
        "890",
        "098",
        "987",
        "876",
        "765",
        "654",
        "543",
        "432",
        "321",
      ];
      if (sequentialPatterns.some((pattern) => newPassword.includes(pattern))) {
        res.status(400);
        throw new Error(
          "Password tidak boleh mengandung urutan angka yang mudah ditebak."
        );
      }
      admin.password = req.body.password;
    }

    const updatedAdmin = await admin.save();
    updatedAdmin.password = undefined;
    res.status(200).json(updatedAdmin);
  } else {
    res.status(404);
    throw new Error("Admin tidak ditemukan");
  }
});

export const createAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  if (!email || !email.includes("@")) {
    res.status(400);
    throw new Error("Format email tidak valid.");
  }

  if (!email.endsWith("@bejalen.com")) {
    res.status(400);
    throw new Error("Email admin harus menggunakan domain @bejalen.com.");
  }

  const username = email.split("@")[0];
  if (username.length < 8) {
    res.status(400);
    throw new Error("Bagian nama email (sebelum @) minimal harus 8 karakter.");
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error("Email sudah digunakan.");
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error("Password minimal harus 8 karakter.");
  }

  if (password.toLowerCase().includes("admin")) {
    res.status(400);
    throw new Error("Password tidak boleh mengandung kata 'admin'.");
  }

  if (/^\d+$/.test(password)) {
    res.status(400);
    throw new Error("Password tidak boleh hanya terdiri dari angka.");
  }

  if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
    res.status(400);
    throw new Error("Password harus merupakan kombinasi huruf dan angka.");
  }

  const sequentialPatterns = [
    "123",
    "234",
    "345",
    "456",
    "567",
    "678",
    "789",
    "890",
    "098",
    "987",
    "876",
    "765",
    "654",
    "543",
    "432",
    "321",
  ];
  if (sequentialPatterns.some((pattern) => password.includes(pattern))) {
    res.status(400);
    throw new Error(
      "Password tidak boleh mengandung urutan angka yang mudah ditebak."
    );
  }

  const passwordLower = password.toLowerCase();

  const nameParts = fullName.toLowerCase().split(/\s+/);

  const emailUsername = email.split("@")[0].toLowerCase();

  const forbiddenWords = [...nameParts, emailUsername];

  for (const word of forbiddenWords) {
    if (word.length > 2 && passwordLower.includes(word)) {
      res.status(400);
      throw new Error(
        `Password tidak boleh mengandung bagian dari nama atau email Anda (kata: "${word}").`
      );
    }
  }

  const digitCount = (password.match(/\d/g) || []).length;
  if (digitCount < 2) {
    res.status(400);
    throw new Error("Password harus mengandung setidaknya dua angka.");
  }

  const newAdmin = await User.create({
    fullName,
    email,
    phone,
    password,
    role: "admin",
    isVerified: true,
  });

  newAdmin.password = undefined;
  res.status(201).json(newAdmin);
});

export const getUser = asyncHandler(async (req, res) => {
  const userFromDb = await User.findById(req.user._id)
    .select("-password")
    .lean();

  if (!userFromDb) {
    res.status(404);
    throw new Error("User tidak ditemukan");
  }

  const existingTestimonial = await Testimonial.findOne({
    user: userFromDb._id,
  });

  const userForFrontend = {
    ...userFromDb,
    hasSubmittedTestimonial: !!existingTestimonial,
  };

  return res.status(200).json({
    user: userForFrontend,
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(200).json({ users });
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.gender = req.body.gender;
    user.address = req.body.address;

    if (req.file) {
      if (user.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(user.cloudinaryId);
        } catch (error) {
          console.error("Gagal menghapus gambar lama dari Cloudinary:", error);
        }
      }
      const maxSize = 4 * 1024 * 1024;
      if (req.file.size > maxSize) {
        res.status(400);
        throw new Error("Ukuran foto profil tidak boleh melebihi 4MB.");
      }

      const optimizedBuffer = await sharp(req.file.buffer)
        .resize(500, 500, { fit: "cover" })
        .webp({ quality: 70 })
        .toBuffer();

      const result = await streamUploadFromBuffer(
        optimizedBuffer,
        "profile_pictures"
      );
      user.profilePicture = result.secure_url;
      user.cloudinaryId = result.public_id;
    }

    if (req.body.oldPassword && req.body.password) {
      const isMatch = await user.comparePassword(req.body.oldPassword);
      if (!isMatch) {
        res.status(401);
        throw new Error("Kata Sandi Lama yang Anda masukkan salah.");
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    updatedUser.password = undefined;

    res.status(200).json({ user: updatedUser });
  } else {
    res.status(404);
    throw new Error("User tidak ditemukan");
  }
});

export const deleteUserByAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user && user.role === "user") {
    if (user.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(user.cloudinaryId);
      } catch (error) {
        console.error("Gagal menghapus foto profil dari Cloudinary:", error);
      }
    }
    await user.deleteOne();
    res
      .status(200)
      .json({ message: "Data Pengguna terkait, berhasil dihapus!" });
  } else {
    res.status(404);
    throw new Error("Pengguna tidak ditemukan atau bukan role user");
  }
});

export const deleteSuperAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const targetUser = await User.findById(id);

  if (!targetUser || targetUser.role !== "superAdmin") {
    res.status(404);
    throw new Error("Super Admin tidak ditemukan.");
  }
  if (req.user._id.toString() === id) {
    res.status(400);
    throw new Error("Anda tidak bisa menghapus akun Anda sendiri.");
  }

  if (targetUser.cloudinaryId) {
    await cloudinary.uploader.destroy(targetUser.cloudinaryId);
  }

  await targetUser.deleteOne();
  res.status(200).json({ message: "Super Admin berhasil dihapus." });
});
