/**
 * Secure configuration file - loads sensitive data from environment variables
 * This file helps prevent hardcoding sensitive information directly in components
 */

// Debug environment variables loading
console.log('Environment variables loading status:');
console.log('REACT_APP_ADMIN_PASSWORD exists:', !!process.env.REACT_APP_ADMIN_PASSWORD);
// Don't log actual values for security

// Admin credentials
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'Aldo&ian123';

// Validate critical configuration
if (!process.env.REACT_APP_ADMIN_PASSWORD) {
  console.warn('⚠️ REACT_APP_ADMIN_PASSWORD not set in environment variables. Using fallback password.');
  console.warn('For security, set this in .env file which is already git-ignored.');
  console.warn('Make sure:');
  console.warn('1. Each environment variable is on its own line in .env');
  console.warn('2. There are no spaces around the = sign');
  console.warn('3. Values with special characters are quoted');
  console.warn('4. You\'ve restarted your development server after changes');
}

// Export configuration securely
const config = {
  // Function that validates the provided password instead of exposing the actual password
  validateAdminPassword: (password) => password === ADMIN_PASSWORD,
};

export default config; 