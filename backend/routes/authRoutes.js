const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Member Email + Password Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Admin Secret PIN Route
router.post('/admin-login', authController.adminLogin);

// Google Sign-In Routes
router.post('/google-verify', authController.googleVerify);
router.get('/google/callback', authController.googleVerify);
router.get('/google', (req, res) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (googleClientId && googleClientId !== 'your-google-client-id-here.apps.googleusercontent.com') {
    const redirectUri = encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback');
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
    return res.redirect(googleAuthUrl);
  }
  return authController.googleVerify(req, res);
});

// Profile & Logout Routes
router.get('/me', authenticateUser, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
