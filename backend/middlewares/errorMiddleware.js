export const notFound = (req, res, next) => {
  const error = new Error(`Halaman Tidak Ditemukan - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let resStatusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Nilai untuk ${field} sudah ada. Mohon gunakan nilai lain.`;
    resStatusCode = 400;
  }

  // Tangani error validasi Mongoose
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
    resStatusCode = 400;
  }

  res.status(resStatusCode).json({
    message: message,
    stack: process.env.NODE_ENV === "production" ? "🔒" : err.stack,
  });
};
