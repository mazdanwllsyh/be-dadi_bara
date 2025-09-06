import mongoose from "mongoose";

const pendaftarSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, required: true, enum: ["Laki-laki", "Perempuan"] },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  position: { type: String, required: true },
  birthDate: { type: Date, required: true },
  education: { type: String, required: true },
  interests: { type: String },
  submittedAt: { type: Date, default: Date.now },
});

const Pendaftar = mongoose.model("Pendaftar", pendaftarSchema);

export default Pendaftar;
