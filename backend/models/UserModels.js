import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
const { Schema } = mongoose;
import Testimonial from "./TestimonialModel.js";
import Pendaftar from "./pendaftarModel.js";

const userSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ["superAdmin", "admin", "user"],
    },
    profilePicture: {
      type: String,
      default: null,
    },
    cloudinaryId: {
      type: String,
    },
    fullName: {
      type: String,
      required: [true, "Nama lengkap harus diisi"],
    },
    email: {
      type: String,
      required: [true, "Email harus diisi"],
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "Format harus youremail@gmail.com",
      },
    },
    gender: {
      type: String,
      enum: ["Laki-laki", "Perempuan", ""],
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      minLength: [8, "Password minimal 8 karakter"],
    },
    verificationCode: String,
    verificationExpires: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    hasRegistered: {
      type: Boolean,
      default: false,
    },
    sessionTokenId: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log(`Mencari dan menghapus testimoni untuk user: ${this._id}`);
    await Testimonial.deleteMany({ user: this._id });
    await Pendaftar.deleteOne({ email: this.email });
    next();
  }
);

const User = mongoose.model("User", userSchema);
export default User;
