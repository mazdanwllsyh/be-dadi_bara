import JadwalKegiatan from "../models/jadwalKegiatanModel.js";
import Presensi from "../models/PresensiModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { v2 as cloudinary } from "cloudinary";

export const getJadwalKegiatan = asyncHandler(async (req, res) => {
  const jadwal = await JadwalKegiatan.find({});
  res.status(200).json(jadwal);
});

export const createJadwalKegiatan = asyncHandler(async (req, res) => {
  console.log("Menerima permintaan POST untuk jadwal kegiatan.");
  console.log("Request Body:", req.body);
  const { nama, tempat, tanggal, waktu, keterangan } = req.body;
  const newJadwal = await JadwalKegiatan.create({
    nama,
    tempat,
    tanggal,
    waktu,
    keterangan,
  });
  console.log("Jadwal baru berhasil dibuat:", newJadwal);
  res.status(201).json(newJadwal);
});

export const updateJadwalKegiatan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nama, tempat, tanggal, waktu, keterangan } = req.body;

  const updatedJadwal = await JadwalKegiatan.findByIdAndUpdate(
    id,
    { nama, tempat, tanggal, waktu, keterangan },
    { new: true, runValidators: true }
  );

  if (!updatedJadwal) {
    res.status(404);
    throw new Error("Jadwal tidak ditemukan");
  }

  res.status(200).json(updatedJadwal);
});

export const deleteJadwalKegiatan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const kegiatan = await JadwalKegiatan.findById(id);

  if (!kegiatan) {
    res.status(404);
    throw new Error("Jadwal tidak ditemukan");
  }

  if (kegiatan.documents && kegiatan.documents.length > 0) {
    for (const doc of kegiatan.documents) {
      if (doc.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(doc.cloudinaryId);
        } catch (error) {
          console.error("Gagal menghapus file dari Cloudinary:", error);
        }
      }
    }
  }
  await Presensi.deleteMany({ kegiatan: id });

  await kegiatan.deleteOne();

  res.status(200).json({
    message:
      "Jadwal kegiatan beserta notulensi dan presensi terkait berhasil dihapus",
  });
});
