import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
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
  <table role="presentation" width="100%" style="border:0; border-spacing:0;">
    <tr>
      <td align="center">
        <table role="presentation" style="width:100%; max-width:600px; border:0; border-spacing:0; background-color: #163126FF; border-radius: 12px; color: #ffffff; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.39);">
          
          <tr>
            <td style="padding: 0 20px; text-align: center;">
              <h1 style="color: #079393FF; margin: 0; font-family: 'SF UI Display', Arial, sans-serif;">Verifikasi Email Anda</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 20px 30px; text-align: center;">
              <p style="color: #dee2e6; line-height: 1.5;">
                Terima kasih telah mendaftar. Gunakan kode di bawah ini untuk mengaktifkan akun Anda.
              </p>
              <p style="color: #dee2e6;">Kode Anda:</p>
              
              <p style="font-size: 34px; font-weight: bold; letter-spacing: 12px; color: #00FF44FF; margin: 20px 0; font-family: Inter, 'SF UI Text', Arial, sans-serif;">
                ${verificationCode}
              </p>
              
              <p style="font-style: italic; color: #adb5bd;">
                Silakan Verifikasi, Kode Berlaku Hingga 10 Menit.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 30px; border-top: 1px solid #495057;">
              <p style="font-size: 12px; color: #6c757d; margin: 0; text-align: center;">
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
