import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import Presensi from "./PresensiModel.js";

const jadwalKegiatanSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    tempat: { type: String, required: true },
    tanggal: { type: Date, required: true },
    waktu: { type: String, required: true },
    keterangan: String,
    notulen: {
      type: String,
    },
    documents: [
      {
        documentUrl: String,
        documentType: String,
        cloudinaryId: String,
      },
    ],
  },
  { timestamps: true }
);

jadwalKegiatanSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log(`Menghapus data terkait untuk kegiatan: ${this.nama}`);

    if (this.documents && this.documents.length > 0) {
      for (const doc of this.documents) {
        if (doc.cloudinaryId) {
          try {
            await cloudinary.uploader.destroy(doc.cloudinaryId);
          } catch (error) {
            console.error(
              "Gagal menghapus file dari Cloudinary via hook:",
              error
            );
          }
        }
      }
    }

    await Presensi.deleteMany({ kegiatan: this._id });

    next();
  }
);

const JadwalKegiatan = mongoose.model("JadwalKegiatan", jadwalKegiatanSchema);
export default JadwalKegiatan;
