import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/verify-email/${token}`;
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify your email",
    text: `Verify at: ${url}`,
    html: `<p>Click <a href="${url}">here</a> to verify</p>`
  });
  return info;
}

export async function sendResetPasswordEmail(to: string, token: string) {
  const url = `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/reset-password/${token}`;
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Reset your password",
    text: `Reset at: ${url}`,
    html: `<p>Click <a href="${url}">here</a> to reset password</p>`
  });
  return info;
}
