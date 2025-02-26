const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, type = "general") => {
  try {
    // Use OTP credentials if the type is 'otp'
    const user = type === "otp" ? process.env.OTP_EMAIL_USER : process.env.EMAIL_USER;
    const pass = type === "otp" ? process.env.OTP_EMAIL_PASS : process.env.EMAIL_PASS;
    const from = type === "otp" 
      ? `"Art Plus OTP" <${process.env.OTP_EMAIL_USER}>` 
      : `"Art Plus" <${process.env.EMAIL_USER}>`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true", 
      auth: {
        user: user,
        pass: pass,
      },
    });
    
    const mailOptions = {
      from: from,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Email not sent! Error:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;
