import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

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
    from: `"Karang Taruna Dadi Bara" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Kode Verifikasi Anda adalah: ${verificationCode}`,
    html: `
      <body style="font-family: 'Inter', 'SF UI Display', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <table role="presentation" style="width:100%; max-width:600px; margin: 0 auto; border-spacing:0; border-radius: 12px; background-color: #95a2ad; color: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.45); border: 1px solid #7B8A9B;">
          
          <tr>
            <td style="padding: 20px 30px; text-align: left; vertical-align: middle;">
              <table role="presentation" style="width:100%; border:0; border-spacing:0;">
                <tr>
                  <td style="width: 200px; vertical-align: middle; text-align: center;">
                    <a href="https://dadibara.bejalen.com/" target="_blank">
                      <img src="https://res.cloudinary.com/dk0yjrhvx/image/upload/q_auto,w_300/v1759601598/logos/logo_organisasi.png" alt="Logo" style="width: 150px; height: auto; filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.5));"/>
                    </a>
                  </td>
                  <td style="vertical-align: middle; padding-left: 15px;">
                    <p style="margin: 0; font-family: 'SF UI Display', Arial, sans-serif; font-size: 22px; color: #E0E0E0; font-weight: bold;">Karang Taruna</p>
                    <p style="margin: 0; font-family: 'SF UI Display', Arial, sans-serif; font-size: 26px; color: #FFFFFF; font-weight: bold;">DADI BARA</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 30px;">
              <hr style="border: none; border-top: 1px solid #2F3032FF;" />
            </td>
          </tr>

          <tr>
            <td style="padding: 0 20px; text-align: center;">
              <h1 style="color: #fcfc04; margin: 0; font-family: 'SF UI Display', Arial, sans-serif; font-size: 28px;">Verifikasi Email Anda</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 20px 30px; text-align: center;">
              <p style="color: #EFF1F4FF; line-height: 1.5; font-size: 16px;">
                Terima kasih telah mendaftar. Gunakan kode di bawah ini untuk mengaktifkan akun Anda.
              </p>
              <p style="color: #dddddd; font-size: 16px; margin-top: 20px;">Kode Anda:</p>
              
              <p style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #fcfc04; margin: 10px 0 24px 0; font-family: Inter, 'SF UI Text', Arial, sans-serif;">
                ${verificationCode}
              </p>
              
              <p style="color: #cccccc; font-size: 16px;">
                Silakan Verifikasi, Kode Berlaku Hingga <strong style="color: #FFFFFF;">10 Menit</strong>.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 30px; border-top: 1px solid #7B8A9B;">
              <p style="font-size: 15px; color: #bbbbbb; margin: 0; text-align: center;">
                *Jika Anda tidak merasa mendaftar, silakan abaikan email ini. Terima kasih.
              </p>
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

export const sendWelcomeEmail = async (user) => {
  if (!user || !user.token) {
    console.error("Gagal mengirim email sambutan: user atau token tidak ada.");
    return;
  }

  const decodedToken = jwt.decode(user.token);
  const sessionExpiresAt = new Date(decodedToken.exp * 1000);
  const expiresInMinutes = Math.round((sessionExpiresAt - Date.now()) / 60000);

  const mailOptions = {
    from: `"Karang Taruna Dadi Bara" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: `Selamat Datang di DADI BARA, ${user.fullName}!`,
    html: `
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <table style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px;">
          <tr>
            <td align="center">
              <img src="https://res.cloudinary.com/dk0yjrhvx/image/upload/v1759601598/logos/logo_organisasi.png" alt="Logo Organisasi" style="width: 100px; height: auto;"/>
              <h1 style="color: #333;">Selamat Datang!</h1>
              <p style="font-size: 16px; color: #555;">
                Halo ${user.fullName},
              </p>
              <p style="font-size: 16px; color: #555;">
                Terima kasih telah bergabung dengan platform digital Karang Taruna DADI BARA. Akun Anda telah berhasil diverifikasi.
              </p>
              <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: left;">
                <p style="margin: 0;"><strong>Nama:</strong> ${user.fullName}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
              </div>
              <p style="font-size: 14px; color: #777;">
                Sesi login Anda saat ini akan aktif selama kurang lebih ${expiresInMinutes} menit.
              </p>
              <a href="https://dadibara.bejalen.com/profile" style="display: inline-block; background-color: darkcyan; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                Lihat Profil Anda
              </a>
            </td>
          </tr>
        </table>
      </body>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sambutan terkirim ke:", user.email);
  } catch (error) {
    console.error("Gagal mengirim email sambutan:", error);
  }
};
