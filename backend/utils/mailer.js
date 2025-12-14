export async function sendVerificationEmail(to, token) {
  // Replace with SendGrid/Postmark/SES in prod
  const link = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email/${token}`;
  console.log(`[MAIL] Verification email to ${to}: ${link}`);
}

export async function sendResetPasswordEmail(to, token) {
  const link = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${token}`;
  console.log(`[MAIL] Reset password email to ${to}: ${link}`);
}
