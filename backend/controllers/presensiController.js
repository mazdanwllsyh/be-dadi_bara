import Presensi from "../models/PresensiModel.js";
import JadwalKegiatan from "../models/jadwalKegiatanModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const submitPresensi = asyncHandler(async (req, res) => {
  const { kegiatanId, nama, email, jabatan } = req.body;

  const emailSudahPresensi = await Presensi.findOne({
    kegiatan: kegiatanId,
    email: email,
  });
  if (emailSudahPresensi) {
    res.status(400);
    throw new Error(
      `Email "${email}" sudah digunakan untuk presensi di kegiatan ini.`
    );
  }

  const namaNormalized = nama.trim().toLowerCase();
  const namaJabatanSudahPresensi = await Presensi.findOne({
    kegiatan: kegiatanId,
    nama: { $regex: new RegExp(`^${namaNormalized}$`, "i") },
    jabatan: jabatan,
  });

  if (namaJabatanSudahPresensi) {
    res.status(400);
    throw new Error(
      `"${nama}" dengan jabatan "${jabatan}" sudah melakukan presensi!`
    );
  }

  const presensiBaru = await Presensi.create({
    kegiatan: kegiatanId,
    nama,
    email,
    jabatan,
  });

  const kegiatan = await JadwalKegiatan.findById(kegiatanId);
  if (!kegiatan) {
    return res.status(201).json(presensiBaru);
  }

  const waktuPresensi = new Date()
    .toLocaleString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    })
    .replace(/\./g, ":");

  const teksTambahan = `${nama} (${jabatan}) - Hadir pada ${waktuPresensi}`;

  if (kegiatan.notulen) {
    kegiatan.notulen += `\n${teksTambahan}`;
  } else {
    kegiatan.notulen = teksTambahan;
  }

  await kegiatan.save();

  res.status(201).json(presensiBaru);
});
