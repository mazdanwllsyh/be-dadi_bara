import mongoose from "mongoose";
const { Schema } = mongoose;

const testimonialSchema = new Schema(
  {
    message: {
      type: String,
      required: [true, "Pesan tidak boleh kosong"],
      maxLength: 500,
    },
    rating: {
      type: Number,
      required: [true, "Rating tidak boleh kosong"],
      min: 1,
      max: 5,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", 
    },
    isArchived: {
    type: Boolean,
    default: false // Secara default, semua testimoni aktif
  }
  },
  { timestamps: true }
);

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;
