import Testimonial from "../models/TestimonialModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ isArchived: false })
    .populate("user", "fullName profilePicture")
    .sort({ createdAt: -1 });

  res.status(200).json({ testimonials });
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const { message, rating } = req.body;
  const existingTestimonial = await Testimonial.findOne({ user: req.user._id });

  if (existingTestimonial) {
    res.status(400);
    throw new Error("Anda sudah pernah memberikan testimoni.");
  }

  const testimonial = new Testimonial({
    message,
    rating,
    user: req.user._id,
  });

  const createdTestimonial = await testimonial.save();
  await createdTestimonial.populate("user", "fullName profilePicture");

  res.status(201).json({ testimonial: createdTestimonial });
});

export const getAllTestimonialsAdmin = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({}) 
    .populate("user", "fullName profilePicture")
    .sort({ createdAt: -1 });
  res.status(200).json({ testimonials });
});

export const toggleArchiveTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (testimonial) {
    testimonial.isArchived = !testimonial.isArchived;
    const updatedTestimonial = await testimonial.save();
    res.status(200).json({
      message: "Status testimoni berhasil diubah.",
      testimonial: updatedTestimonial, 
    });
  } else {
    res.status(404);
    throw new Error("Testimoni tidak ditemukan.");
  }
});
