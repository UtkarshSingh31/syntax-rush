import nodemailer from 'nodemailer';
import crypto from 'crypto';

const isEmailConfigured = () => {
  return process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
};

const createTransporter = () => {
  if (!isEmailConfigured()) {
    throw new Error(
      'Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in your .env file'
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

class EmailService {
  // Generate secure OTP
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Hash OTP for secure storage
  hashOTP(otp) {
    return crypto
      .createHash('sha256')
      .update(otp + (process.env.JWT_SECRET || process.env.SECRET_KEY))
      .digest('hex');
  }

  // Send OTP email (only OTP, no fancy template)
  async sendOTPEmail(email, otp) {
    try {
      if (!isEmailConfigured()) {
        console.error(
          'Email credentials not configured. Please set EMAIL_USER and EMAIL_PASSWORD in your .env file'
        );
        return false;
      }

      const transporter = createTransporter();

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: otp, // plain text
        html: `<h2>${otp}</h2>`, // minimal HTML
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();
