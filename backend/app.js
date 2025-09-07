console.log(
  "--- BACKEND BERJALAN PADA ... " + new Date().toISOString() + " ---"
);
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { MulterError } from "multer";

const PORT = process.env.PORT || 3000;

// ROUTER
import userRouter from "./routers/userRouter.js";
import testimonialRoutes from "./routers/testimonialRouter.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import landingConfigRoutes from "./routers/landingConfigRoutes.js";
import jadwalKegiatanRoutes from "./routers/jadwalKegiatanRoutes.js";
import faqRoutes from "./routers/faqRoutes.js";
import galleryRouter from "./routers/galleryRouter.js";
import keuanganRouter from "./routers/keuanganRouter.js";
import memberRoutes from "./routers/memberRoute.js";
import skRouter from "./routers/skRouter.js";
import pendaftaranRouter from "./routers/pendaftaranRouter.js";
import notulensiRoutes from "./routers/notulensiRoutes.js";
import presensiRoutes from "./routers/presensiRoutes.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

console.log("MEMULAI KONEKSI KE DATABASE..."); 

mongoose
  .connect(process.env.DATABASE, {})
  .then(() => {
    console.log("KONEKSI DATABASE BERHASIL!"); 
  })
  .catch(
    (err) => console.error("KONEKSI DATABASE GAGAL:", err) 
  );

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://accounts.google.com/gsi/client"],
        "connect-src": ["'self'", "https://accounts.google.com"],
        "frame-src": ["'self'", "https://accounts.google.com"],
        "img-src": [
          "'self'",
          "data:",
          "https:",
          "res.cloudinary.com",
          "lh3.googleusercontent.com",
        ],
      },
    },
  })
);
const allowedOrigins = [
  "https://dadibara.bejalen.com",
  "http://localhost:5173",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Asal (Origin) ini tidak diizinkan oleh CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(Object.assign({}, req.query));
  next();
});

app.get("/api", (req, res) => {
  res.status(200).json({
    message: "API Server Karang Taruna DADI BARA Aktif!",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Routes API
app.use("/api/auth", userRouter);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/landing-config", landingConfigRoutes);
app.use("/api/jadwal-kegiatan", jadwalKegiatanRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/gallery", galleryRouter);
app.use("/api/keuangan", keuanganRouter);
app.use("/api/members", memberRoutes);
app.use("/api/sk", skRouter);
app.use("/api/notulensi", notulensiRoutes);
app.use("/api/presensi", presensiRoutes);
app.use("/api/pendaftaran", pendaftaranRouter);

app.use((err, req, res, next) => {
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "Ukuran file terlalu besar, pastikan Maks. 6MB!" });
    }
  }
  next(err);
});
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
