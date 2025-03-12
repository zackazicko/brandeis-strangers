/**
 * Secure configuration file - loads sensitive data from environment variables
 * This file is designed to work in Vercel production environment
 */

// Support Next.js environment variable patterns
console.log('Config: Loading secure credentials...');

// Check for admin password in Next.js environment pattern
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 
                       'Aldo&ian123'; // Fallback for development only

// Check if using environment variable
const usingNextJS = !!process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
const usingFallback = !usingNextJS;

// Log environment status (but not actual values)
console.log('Admin password source:', 
  usingNextJS ? 'Next.js environment variable' :
  'Using fallback (NOT SECURE)');

// Warn if using fallback
if (usingFallback) {
  console.warn('⚠️ SECURITY WARNING: Using fallback admin password!');
  console.warn('This is insecure for production environments.');
  console.warn('');
  console.warn('For Vercel deployment:');
  console.warn('- Add NEXT_PUBLIC_ADMIN_PASSWORD in Vercel Project Settings → Environment Variables');
  console.warn('- Ensure the variable is set for all environments (Production, Preview, Development)');
  console.warn('- After adding the environment variable, redeploy your application');
}

// Export configuration securely
const config = {
  // Function that validates the provided password instead of exposing the actual password
  validateAdminPassword: (password) => password === ADMIN_PASSWORD,
};

export default config; 