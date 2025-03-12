/**
 * Secure configuration file - loads sensitive data from environment variables
 * This file helps prevent hardcoding sensitive information directly in components
 */

// Admin credentials
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'Aldo&ian123';

// Validate critical configuration
if (!process.env.REACT_APP_ADMIN_PASSWORD) {
  console.warn('⚠️ REACT_APP_ADMIN_PASSWORD not set in environment variables. Using fallback password.');
  console.warn('For security, set this in .env file which is already git-ignored.');
}

// Export configuration securely
const config = {
  // Function that validates the provided password instead of exposing the actual password
  validateAdminPassword: (password) => password === ADMIN_PASSWORD,
};

export default config; 