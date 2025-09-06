import LandingConfig from "../models/landingConfigModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import sharp from "sharp";

const streamUploadFromBuffer = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      { folder: folder },
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
    console.error("Gagal menghapus gambar lama dari Cloudinary:", error);
  }
};

export const getLandingConfig = asyncHandler(async (req, res) => {
  const config = await LandingConfig.findOne();
  res.status(200).json(config || {});
});

export const updateLandingConfig = asyncHandler(async (req, res) => {
  let config = await LandingConfig.findOne();
  if (!config) {
    config = new LandingConfig();
  }

  config.namaOrganisasi = req.body.namaOrganisasi || config.namaOrganisasi;
  config.tagline = req.body.tagline || config.tagline;

  if (req.body.aboutUsParagraphs) {
    config.aboutUsParagraphs = req.body.aboutUsParagraphs
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p);
  }

  const files = req.files;

  if (files && files.logoDadiBara && files.logoDadiBara[0]) {
    if (config.logoDadiBara) {
      await deleteFromCloudinary(config.logoDadiBara);
    }

    const optimizedBuffer = await sharp(files.logoDadiBara[0].buffer)
      .webp({ quality: 90 })
      .toBuffer();

    const result = await streamUploadFromBuffer(optimizedBuffer, "logos");
    config.logoDadiBara = result.secure_url;
  }

  if (files && files.logoDesaBaru && files.logoDesaBaru[0]) {
    if (config.logoDesaBaru) {
      await deleteFromCloudinary(config.logoDesaBaru);
    }

    const optimizedBuffer = await sharp(files.logoDesaBaru[0].buffer)
      .webp({ quality: 80 })
      .toBuffer();

    const result = await streamUploadFromBuffer(optimizedBuffer, "logos");
    config.logoDesaBaru = result.secure_url;
  }

  const updatedConfig = await config.save();
  res.status(200).json(updatedConfig);
});
