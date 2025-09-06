import Pendaftar from "../models/pendaftarModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const getPendaftar = asyncHandler(async (req, res) => {
  const pendaftar = await Pendaftar.find({});
  res.status(200).json(pendaftar);
});

export const addPendaftar = asyncHandler(async (req, res) => {
  if (req.user) {
    const user = await User.findById(req.user._id);
    if (user && user.hasRegistered) {
      res.status(400);
      throw new Error("Anda sudah terdaftar sebagai anggota.");
    }
  }

  const emailExists = await Pendaftar.findOne({ email: req.body.email });
  if (emailExists) {
    res.status(400);
    throw new Error("Email ini sudah pernah digunakan untuk mendaftar.");
  }
  console.log("Data Gender yang diterima backend:", req.body.gender);
  console.log(req.body);
  const {
    name,
    email,
    gender,
    phone,
    address,
    position,
    birthDate,
    education,
    interests,
  } = req.body;

  const newPendaftar = await Pendaftar.create({
    name,
    email,
    gender,
    phone,
    address,
    position,
    birthDate,
    education,
    interests,
  });

  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { hasRegistered: true });
  }

  res.status(201).json(newPendaftar);
});

export const deletePendaftar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedPendaftar = await Pendaftar.findByIdAndDelete(id);

  if (!deletedPendaftar) {
    res.status(404);
    throw new Error("Pendaftar tidak ditemukan.");
  }

  res.status(200).json({ message: "Pendaftar berhasil dihapus." });
});
