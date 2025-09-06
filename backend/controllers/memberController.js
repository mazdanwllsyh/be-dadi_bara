import Member from "../models/memberModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import sharp from "sharp";

const streamUploadFromBuffer = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes("cloudinary")) return;
  const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Gagal menghapus foto lama dari Cloudinary:", error);
  }
};

const toTitleCase = (str) => {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const getMembers = asyncHandler(async (req, res) => {
  const members = await Member.find({}).sort({ createdAt: -1 });
  res.status(200).json(members);
});

export const createMember = asyncHandler(async (req, res) => {
  const { nama, title, titleLabel, whatsapp, instagram } = req.body;

  const singleOccupancyTitles = [
    "ketua_1",
    "ketua_2",
    "sekretaris_1",
    "sekretaris_2",
    "bendahara_1",
    "bendahara_2",
  ];

  if (singleOccupancyTitles.includes(title)) {
    const jabatanExists = await Member.findOne({ title });
    if (jabatanExists) {
      res.status(400);
      throw new Error(`Jabatan ${jabatanExists.titleLabel} sudah terisi.`);
    }
  }

  if (!req.file) {
    res.status(400);
    throw new Error("Foto wajib diunggah.");
  }

  const maxSize = 5 * 1024 * 1024;
  if (req.file.size > maxSize) {
    res.status(400);
    throw new Error("Ukuran gambar tidak boleh melebihi 5MB.");
  }

  const optimizedBuffer = await sharp(req.file.buffer)
    .resize(800, 800, { fit: "cover" })
    .webp({ quality: 85 })
    .toBuffer();

  const result = await streamUploadFromBuffer(optimizedBuffer, "member_photos");

  const member = await Member.create({
    nama: toTitleCase(nama),
    foto: result.secure_url,
    title,
    titleLabel,
    whatsapp,
    instagram,
  });
  res.status(201).json(member);
});

export const getMemberById = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (member) {
    res.status(200).json(member);
  } else {
    res.status(404);
    throw new Error("Data pengurus tidak ditemukan");
  }
});

export const updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (!member) {
    res.status(404);
    throw new Error("Data pengurus tidak ditemukan");
  }

  const { nama, title, titleLabel, whatsapp, instagram } = req.body;

  const singleOccupancyTitles = [
    "ketua_1",
    "ketua_2",
    "sekretaris_1",
    "sekretaris_2",
    "bendahara_1",
    "bendahara_2",
  ];

  if (title && singleOccupancyTitles.includes(title)) {
    const jabatanExists = await Member.findOne({
      title,
      _id: { $ne: req.params.id },
    });
    if (jabatanExists) {
      res.status(400);
      throw new Error(
        `Jabatan ${jabatanExists.titleLabel} sudah diisi oleh orang lain.`
      );
    }
  }

  member.nama = nama ? toTitleCase(nama) : member.nama; 
  member.title = title || member.title;
  member.titleLabel = titleLabel || member.titleLabel;
  member.whatsapp = whatsapp || member.whatsapp;
  member.instagram = instagram || member.instagram;

  if (req.file) {
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      res.status(400);
      throw new Error("Ukuran gambar tidak boleh melebihi 5MB.");
    }

    await deleteFromCloudinary(member.foto);

    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(800, 800, { fit: "cover" })
      .webp({ quality: 85 })
      .toBuffer();

    const result = await streamUploadFromBuffer(
      optimizedBuffer,
      "member_photos"
    );
    member.foto = result.secure_url;
  }

  const updatedMember = await member.save();
  res.status(200).json(updatedMember);
});

export const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (member) {
    if (member.foto) {
      await deleteFromCloudinary(member.foto);
    }
    await member.deleteOne();
    res.status(200).json({ message: "Data pengurus berhasil dihapus" });
  } else {
    res.status(404);
    throw new Error("Data pengurus tidak ditemukan");
  }
});
