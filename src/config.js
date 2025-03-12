/**
 * Secure configuration file - loads sensitive data from environment variables
 * This file is designed to work in both local development and Vercel production environments
 */

// Support both Create React App and Next.js environment variable patterns
console.log('Config: Loading secure credentials...');

// Check for admin password in both CRA and Next.js environment patterns
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 
                       process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 
                       'Aldo&ian123'; // Fallback for development only

// Check which environment variable was used (if any)
const usingCRA = !!process.env.REACT_APP_ADMIN_PASSWORD;
const usingNextJS = !!process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
const usingFallback = !usingCRA && !usingNextJS;

// Log environment status (but not actual values)
console.log('Admin password source:', 
  usingCRA ? 'CRA environment variable' :
  usingNextJS ? 'Next.js environment variable' :
  'Using fallback (NOT SECURE)');

// Warn if using fallback
if (usingFallback) {
  console.warn('⚠️ SECURITY WARNING: Using fallback admin password!');
  console.warn('This is insecure for production environments.');
  console.warn('');
  console.warn('For local development:');
  console.warn('- Add REACT_APP_ADMIN_PASSWORD to your .env file');
  console.warn('');
  console.warn('For Vercel deployment:');
  console.warn('- Add NEXT_PUBLIC_ADMIN_PASSWORD in Vercel Project Settings → Environment Variables');
}

// Export configuration securely
const config = {
  // Function that validates the provided password instead of exposing the actual password
  validateAdminPassword: (password) => password === ADMIN_PASSWORD,
};

export default config; 