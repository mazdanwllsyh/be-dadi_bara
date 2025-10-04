import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log(
  "DEBUG GMAIL_PASS:",
  process.env.GMAIL_PASS
    ? "Password Ada (terbaca)"
    : "Password KOSONG/UNDEFINED"
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendEmailVerify = async (email, verificationCode) => {
  const mailOptions = {
    from: `"Karang Taruna Dadi Bara Dev." <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Kode Verifikasi Akun Dadi Bara",
    html: `
      <body style="font-family: 'Inter', 'SF UI Display', Arial, sans-serif; background-color: #7B7B9176; margin: 0; padding: 20px; width: max-content;">
  <table role="presentation" style="width:100%; max-width:600px; border:0; border-spacing:0; border-radius: 12px; color: #ffffff; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.39);">
    <tr>
      <td align="center">
        <table role="presentation" style="width:100%; max-width:600px; border:0; border-spacing:0; background-color: #95a2ad; border-radius: 12px; color: #ffffff; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.39);">
          
          <tr>
            <td style="padding: 20px 0; text-align: center;">
              <a href="https://dadibara.bejalen.com/"_blank style="background-color: none; border-radius="12px">
                <img src="https://res.cloudinary.com/dr7olcn4r/image/upload/v1757167793/logos/logo_organisasi.png" alt="Logo Organisasi" style="width: 150px; height: auto; display: block; margin: 0 auto;"/>
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 20px; text-align: center;">
              <h1 style="color: #fcfc04; margin: 0; font-family: 'SF UI Display', Arial, sans-serif;">Verifikasi Email Anda</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 20px 30px; text-align: center;">
              <p style="color: #EFF1F4FF; line-height: 1.5;">
                Terima kasih telah mendaftar. Gunakan kode di bawah ini untuk mengaktifkan akun Anda.
              </p>
              <p style="color: #2F2F2FFF;">Kode Anda:</p>
              
              <p style="font-size: 34px; font-weight: bold; letter-spacing: 12px; color: #fcfc04; margin: 20px 0; font-family: Inter, 'SF UI Text', Arial, sans-serif;">
                ${verificationCode}
              </p>
              
              <p style="font-style: italic; color: #3F3F3FFF;">
                Silakan Verifikasi, Kode Berlaku Hingga 10 Menit.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 30px; border-top: 1px solid #495057;">
              <p style="font-size: 12px; color: #fcfc04; margin: 0; text-align: center;">
                "Jika Anda tidak merasa mendaftar, bisa abaikan email ini. Terimakasih"
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email verifikasi terkirim ke:", email);
  } catch (error) {
    console.error(error);
    throw new Error("Gagal mengirim kode verifikasi email");
  }
};
