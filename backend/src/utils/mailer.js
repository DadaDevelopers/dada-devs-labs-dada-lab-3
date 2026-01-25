// export async function sendVerificationEmail(to, token) {
//   // Replace with SendGrid/Postmark/SES in prod
//   const link = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email/${token}`;
//   console.log(`[MAIL] Verification email to ${to}: ${link}`);
// }
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

export async function sendVerificationEmail(to, token) {
  const link = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  await transport.sendMail({
    from: process.env.MAILTRAP_FROM,
    to,
    subject: "Verify your email",
    html: `<p>Please click <a href="${link}">here</a> to verify your email.</p>`
  });

  console.log(`[MAIL] Sent verification email to ${to}: ${link}`);
}


export async function sendResetPasswordEmail(to, token) {
  const link = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${token}`;
  console.log(`[MAIL] Reset password email to ${to}: ${link}`);
}
