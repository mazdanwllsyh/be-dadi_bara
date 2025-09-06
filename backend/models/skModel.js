import mongoose from "mongoose";

const skSchema = new mongoose.Schema({
  filePath: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const SkDocument = mongoose.model("SkDocument", skSchema);

export default SkDocument;
