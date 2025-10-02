import rateLimit from 'express-rate-limit';

const otpRequestLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 3, // 3 OTP requests per email per hour
  keyGenerator: (req) => req.body.email?.toLowerCase(),
  message: {
    success: false,
    message: 'Too many OTP requests for this email. Try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General API rate limiting (per IP)
const generalApiLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per 15 minutes
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.'
  }
});

// OTP verification rate limiting (per email)
const otpVerifyLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 verification attempts per email per 15 minutes
  keyGenerator: (req) => req.body.email?.toLowerCase(),
  message: {
    success: false,
    message: 'Too many verification attempts. Please try again later.'
  }
});

export default{
  otpRequestLimit,
  generalApiLimit,
  otpVerifyLimit
};