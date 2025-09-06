import mongoose from "mongoose";
const { Schema } = mongoose;

const memberSchema = new Schema(
  {
    nama: { type: String, required: true },
    foto: { type: String, required: true },
    title: { type: String, required: true },
    titleLabel: { type: String, required: true },
    whatsapp: { type: String, required: true },
    instagram: { type: String, default: "" },
  },
  { timestamps: true }
);

const Member = mongoose.model("Member", memberSchema);
export default Member;
