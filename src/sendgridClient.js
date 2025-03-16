// SendGrid email client for verification codes
// SECURITY NOTICE: Never hardcode API keys in this file!
// Always use environment variables for sensitive credentials

const sgMail = require('@sendgrid/mail');

// Check if we have an API key configured
const apiKey = process.env.NEXT_PUBLIC_SENDGRID_API_KEY;
if (!apiKey) {
  console.warn('SendGrid API key not found in environment variables. Email verification will not work properly.');
  console.warn('Make sure to add NEXT_PUBLIC_SENDGRID_API_KEY to your .env.local file for development.');
  console.warn('For production, add it to your hosting platform environment variables.');
}

// Set the API key - using a placeholder for development if not available
sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_API_KEY || 'placeholder_key_for_development');

// Store for rate limiting
const emailRateLimit = {
  // Structure: { email: { count: number, lastReset: timestamp } }
  store: {},
  
  // Maximum 2 emails per 24 hours to the same email
  MAX_EMAILS_PER_DAY: 2,
  RESET_PERIOD_MS: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  
  // Check if an email has reached the rate limit
  hasReachedLimit(email) {
    const normalizedEmail = email.toLowerCase();
    const now = Date.now();
    
    // If no record exists, create one
    if (!this.store[normalizedEmail]) {
      this.store[normalizedEmail] = {
        count: 0,
        lastReset: now
      };
      return false;
    }
    
    const record = this.store[normalizedEmail];
    
    // Check if we need to reset the counter (24 hours passed)
    if (now - record.lastReset > this.RESET_PERIOD_MS) {
      record.count = 0;
      record.lastReset = now;
      return false;
    }
    
    // Check if reached limit
    return record.count >= this.MAX_EMAILS_PER_DAY;
  },
  
  // Increment the counter for an email
  incrementCounter(email) {
    const normalizedEmail = email.toLowerCase();
    const now = Date.now();
    
    if (!this.store[normalizedEmail]) {
      this.store[normalizedEmail] = {
        count: 1,
        lastReset: now
      };
      return;
    }
    
    const record = this.store[normalizedEmail];
    
    // Reset if needed
    if (now - record.lastReset > this.RESET_PERIOD_MS) {
      record.count = 1;
      record.lastReset = now;
    } else {
      record.count += 1;
    }
  },
  
  // Get remaining emails for the day
  getRemainingEmails(email) {
    const normalizedEmail = email.toLowerCase();
    
    if (!this.store[normalizedEmail]) {
      return this.MAX_EMAILS_PER_DAY;
    }
    
    const record = this.store[normalizedEmail];
    const now = Date.now();
    
    // Reset if needed
    if (now - record.lastReset > this.RESET_PERIOD_MS) {
      return this.MAX_EMAILS_PER_DAY;
    }
    
    return Math.max(0, this.MAX_EMAILS_PER_DAY - record.count);
  }
};

// Validate that an email is from Brandeis
const isBrandeisEmail = (email) => {
  return email.toLowerCase().endsWith('@brandeis.edu');
};

// Send verification email with code
const sendVerificationEmail = async (email, code) => {
  // Validate email domain
  if (!isBrandeisEmail(email)) {
    throw new Error('Only Brandeis email addresses are supported');
  }
  
  // Check rate limit
  if (emailRateLimit.hasReachedLimit(email)) {
    throw new Error(`Rate limit reached. Maximum ${emailRateLimit.MAX_EMAILS_PER_DAY} verification emails per day.`);
  }

  // Check if we have a valid API key
  if (!process.env.NEXT_PUBLIC_SENDGRID_API_KEY) {
    console.log('Development mode: Would send verification code', code, 'to', email);
    emailRateLimit.incrementCounter(email);
    return {
      success: true,
      remainingEmails: emailRateLimit.getRemainingEmails(email),
      development: true
    };
  }
  
  // Create email message
  const msg = {
    to: email,
    from: 'noreply@brandeis-strangers.com', // This should be your verified sender
    subject: 'Your Brandeis Meal Match Verification Code',
    text: `Your verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this code, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #003865; border-radius: 10px;">
        <h2 style="color: #003865; text-align: center;">Brandeis Meal Match Verification</h2>
        <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
        <p style="font-size: 16px; line-height: 1.5;">Your verification code for Brandeis Meal Match is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #003865;">${code}</p>
        </div>
        <p style="font-size: 16px; line-height: 1.5;">This code will expire in 15 minutes.</p>
        <p style="font-size: 16px; line-height: 1.5;">If you did not request this code, please ignore this email.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
          <p>Brandeis Meal Match - Connect with fellow students over meals.</p>
        </div>
      </div>
    `,
  };
  
  try {
    // Send the email
    await sgMail.send(msg);
    
    // Increment rate limit counter
    emailRateLimit.incrementCounter(email);
    
    return {
      success: true,
      remainingEmails: emailRateLimit.getRemainingEmails(email)
    };
  } catch (error) {
    console.error('SendGrid error:', error);
    
    if (error.response) {
      console.error('SendGrid API error:', error.response.body);
    }
    
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  emailRateLimit,
  isBrandeisEmail
}; 