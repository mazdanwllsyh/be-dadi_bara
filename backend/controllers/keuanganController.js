import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import Transaction from "../models/transactionModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @param {Buffer} fileBuffer 
 * @returns {Promise<object>} .
 */
const uploadFromBuffer = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "keuangan_bukti", 
        resource_type: "auto",
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * @param {string} fileUrl .
 */
const deleteFromCloudinary = async (fileUrl) => {
  if (!fileUrl) return;

  const publicIdMatch = fileUrl.match(/\/keuangan_bukti\/([^\.]+)/);
  if (!publicIdMatch || !publicIdMatch[1]) {
    console.error("Tidak dapat mengekstrak public_id dari URL:", fileUrl);
    return;
  }
  const publicId = `keuangan_bukti/${publicIdMatch[1]}`;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Gagal menghapus file lama dari Cloudinary:", error);
  }
};

export const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({}).sort({ date: -1 });
  res.status(200).json(transactions);
});

export const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, description, date } = req.body;
  let documentUrl = null;

  if (req.file) {
    const result = await uploadFromBuffer(req.file.buffer);
    documentUrl = result.secure_url; 
  }

  const newTransaction = await Transaction.create({
    type,
    amount,
    description,
    date,
    document: documentUrl,
  });

  res.status(201).json(newTransaction);
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, amount, description, date } = req.body;

  const transaction = await Transaction.findById(id);
  if (!transaction) {
    res.status(404);
    throw new Error("Transaksi tidak ditemukan");
  }

  let documentUrl = transaction.document; 

  if (req.file) {
    if (transaction.document) {
      await deleteFromCloudinary(transaction.document);
    }
    const result = await uploadFromBuffer(req.file.buffer);
    documentUrl = result.secure_url;
  }

  transaction.type = type;
  transaction.amount = amount;
  transaction.description = description;
  transaction.date = date;
  transaction.document = documentUrl; 

  const updatedTransaction = await transaction.save();
  res.status(200).json(updatedTransaction);
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const transaction = await Transaction.findById(id);

  if (!transaction) {
    res.status(404);
    throw new Error("Transaksi tidak ditemukan");
  }

  if (transaction.document) {
    await deleteFromCloudinary(transaction.document);
  }

  await Transaction.findByIdAndDelete(id);

  res.status(200).json({ message: "Transaksi berhasil dihapus" });
});
