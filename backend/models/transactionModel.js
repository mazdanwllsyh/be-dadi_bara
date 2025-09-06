import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Pemasukan", "Pengeluaran"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  document: {
    type: String,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
