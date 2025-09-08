import SkDocument from "../models/skModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const streamUploadFromBuffer = (buffer, folder, publicId) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: publicId,
        resource_type: "auto",
        quality: "auto:good",
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const deleteFromCloudinaryByUrl = async (fileUrl) => {
  if (!fileUrl || !fileUrl.includes("cloudinary")) return;
  const publicId = fileUrl.split("/").slice(-2).join("/").split(".")[0];
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Gagal menghapus file lama dari Cloudinary:", error);
  }
};

export const getSkDocument = asyncHandler(async (req, res) => {
  const sk = await SkDocument.findOne();
  res.status(200).json(sk);
});

export const uploadSk = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Tidak ada file yang diunggah.");
  }

  const oldSk = await SkDocument.findOne();
  if (oldSk && oldSk.filePath) {
    await deleteFromCloudinaryByUrl(oldSk.filePath);
    await SkDocument.findByIdAndDelete(oldSk._id);
  }

  const currentYear = new Date().getFullYear();
  const newPublicId = `SuratKeputusanOrganisasi-${currentYear}`;

  const result = await streamUploadFromBuffer(
    req.file.buffer,
    "sk_documents",
    newPublicId
  );

  const newSk = await SkDocument.create({ filePath: result.secure_url });
  res.status(201).json(newSk);
});
