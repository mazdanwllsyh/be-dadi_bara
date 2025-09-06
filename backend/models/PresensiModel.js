import mongoose from "mongoose";

const presensiSchema = new mongoose.Schema({
  kegiatan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JadwalKegiatan",
    required: true,
  },
  nama: { type: String, required: true },
  email: { type: String, required: true },
  jabatan: { type: String, required: true },
  waktuHadir: { type: Date, default: Date.now },
});

const Presensi = mongoose.model("Presensi", presensiSchema);
export default Presensi;
