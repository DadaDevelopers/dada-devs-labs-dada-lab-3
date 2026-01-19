// Generic email sender for system notifications (stub for now)
export async function sendEmail(to, subject, body) {
  // Replace with real email logic as needed
  console.log(`Sending email to ${to}: [${subject}] ${body}`);
  return true;
}
export async function sendVerificationEmail(to, token) {
  // Replace with SendGrid/Postmark/SES in prod
  const link = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email/${token}`;
  console.log(`[MAIL] Verification email to ${to}: ${link}`);
}

export async function sendResetPasswordEmail(to, token) {
  const link = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${token}`;
  console.log(`[MAIL] Reset password email to ${to}: ${link}`);
}
