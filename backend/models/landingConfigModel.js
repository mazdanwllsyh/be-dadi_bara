import mongoose from "mongoose";
const landingConfigSchema = new mongoose.Schema({
  namaOrganisasi: String,
  tagline: String,
  logoDadiBara: String,
  logoDesaBaru: String,
  aboutUsParagraphs: [String],
});
const LandingConfig = mongoose.model("LandingConfig", landingConfigSchema);
export default LandingConfig;
