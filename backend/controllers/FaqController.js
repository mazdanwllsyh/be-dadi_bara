import Faq from "../models/FaqModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const getFaq = asyncHandler(async (req, res) => {
  const faqs = await Faq.find({});
  res.status(200).json(faqs);
});

export const createFaq = asyncHandler(async (req, res) => {
  const { question, answer } = req.body;
  const newFaq = await Faq.create({ question, answer });
  res.status(201).json(newFaq);
});

export const updateFaq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  const updatedFaq = await Faq.findByIdAndUpdate(
    id,
    { question, answer },
    { new: true, runValidators: true }
  );

  if (!updatedFaq) {
    res.status(404);
    throw new Error("FAQ tidak ditemukan");
  }

  res.status(200).json(updatedFaq);
});

export const deleteFaq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedFaq = await Faq.findByIdAndDelete(id);

  if (!deletedFaq) {
    res.status(404);
    throw new Error("FAQ tidak ditemukan");
  }

  res.status(200).json({ message: "FAQ berhasil dihapus" });
});
