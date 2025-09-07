import JadwalKegiatan from "../models/jadwalKegiatanModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import Presensi from "../models/PresensiModel.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import sharp from "sharp";

const streamUpload = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const updateNotulensi = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notulen, originalTimestamp } = req.body;
  const kegiatan = await JadwalKegiatan.findById(id);

  if (!kegiatan) {
    res.status(404);
    throw new Error("Kegiatan tidak ditemukan");
  }

  if (kegiatan.updatedAt.toISOString() !== originalTimestamp) {
    res.status(409);
    throw new Error(
      "Data notulensi berubah karena proses lain. Mohon muat ulang halaman."
    );
  }

  kegiatan.notulen = notulen;

  const files = req.files;
  const newDocuments = [...(kegiatan.documents || [])];

  const processFile = async (file) => {
    let result;
    if (file.mimetype.startsWith("image/")) {
      const optimizedBuffer = await sharp(file.buffer)
        .webp({ quality: 75 })
        .toBuffer();
      result = await streamUpload(optimizedBuffer, { folder: "notulensi" });
    } else if (file.mimetype === "application/pdf") {
      result = await streamUpload(file.buffer, {
        folder: "notulensi",
        quality: "auto:good",
        resource_type: "auto",
      });
    }

    if (result) {
      return {
        documentUrl: result.secure_url,
        cloudinaryId: result.public_id,
        documentType: file.mimetype.startsWith("image/") ? "image" : "pdf",
      };
    }
    return null;
  };

  if (files && files.document1) {
    if (newDocuments[0]?.cloudinaryId) {
      await cloudinary.uploader.destroy(newDocuments[0].cloudinaryId);
    }
    const doc1 = await processFile(files.document1[0]);
    if (doc1) newDocuments[0] = doc1;
  }

  if (files && files.document2) {
    if (newDocuments[1]?.cloudinaryId) {
      await cloudinary.uploader.destroy(newDocuments[1].cloudinaryId);
    }
    const doc2 = await processFile(files.document2[0]);
    if (doc2) newDocuments[1] = doc2;
  }

  kegiatan.documents = newDocuments.filter(Boolean);
  kegiatan.markModified("documents");

  const updatedKegiatan = await kegiatan.save();
  res.status(200).json(updatedKegiatan);
});

export const deleteNotulensi = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const kegiatan = await JadwalKegiatan.findById(id);

  if (!kegiatan) {
    res.status(404);
    throw new Error("Kegiatan tidak ditemukan");
  }

  if (kegiatan.documents && kegiatan.documents.length > 0) {
    for (const doc of kegiatan.documents) {
      if (doc.cloudinaryId) {
        await cloudinary.uploader.destroy(doc.cloudinaryId);
      }
    }
  }

  await Presensi.deleteMany({ kegiatan: id });

  await JadwalKegiatan.findByIdAndUpdate(id, {
    $unset: {
      notulen: 1,
      documents: 1,
    },
  });
  res
    .status(200)
    .json({ message: "Notulensi dan data presensi terkait berhasil dihapus." });
});
