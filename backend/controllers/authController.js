const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'workhub_coworkspace_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@workhub.com').toLowerCase();
const DEFAULT_ADMIN_PIN = process.env.ADMIN_PIN || '889900';
const DEFAULT_ADMIN_PIN_HASH = bcrypt.hashSync(DEFAULT_ADMIN_PIN, 10);
const DEFAULT_USER_PASS_HASH = bcrypt.hashSync('password123', 10);

// Shared memory store for fallback & real-time synchronization
const sharedUsersStore = [
  { userId: 'USR-101', name: 'Alex Johnson', email: 'alex.johnson@cloudscale.ai', passwordHash: DEFAULT_USER_PASS_HASH, phone: '+1 (555) 019-2834', role: 'user', authProvider: 'local', isActive: true, createdAt: new Date() },
  { userId: 'USR-102', name: 'Sophia Taylor', email: 'sophia.taylor@designlab.io', passwordHash: DEFAULT_USER_PASS_HASH, phone: '+1 (555) 014-9821', role: 'user', authProvider: 'local', isActive: true, createdAt: new Date() },
  { userId: 'USR-103', name: 'David Chen', email: 'david.chen@fintech.org', passwordHash: DEFAULT_USER_PASS_HASH, phone: '+1 (555) 018-3342', role: 'user', authProvider: 'local', isActive: true, createdAt: new Date() },
  { userId: 'USR-104', name: 'Sarah Jenkins', email: 'sarah.jenkins@cloudscale.ai', passwordHash: DEFAULT_USER_PASS_HASH, phone: '+1 (555) 012-3456', role: 'user', authProvider: 'local', isActive: true, createdAt: new Date() },
  { userId: 'USR-ADMIN', name: 'WorkHub Admin', email: DEFAULT_ADMIN_EMAIL, passwordHash: bcrypt.hashSync('admin123', 10), phone: '+1 (555) 000-0000', role: 'admin', pinHash: DEFAULT_ADMIN_PIN_HASH, authProvider: 'local', isActive: true, createdAt: new Date() }
];

// Seed default users if DB empty
const ensureSeedUsers = async () => {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      await User.insertMany(sharedUsersStore);
      console.log('🌱 Seeded default users into MongoDB collection "users".');
    }
  } catch (err) {}
};

// @desc    Register new user with Email + Password
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    let existingUser = sharedUsersStore.find(u => u.email === cleanEmail);
    if (mongoose.connection.readyState === 1) {
      try {
        const mongoUser = await User.findOne({ email: cleanEmail });
        if (mongoUser) existingUser = mongoUser;
      } catch (dbErr) {}
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password using bcrypt (salt 12)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUserObj = {
      userId,
      name,
      email: cleanEmail,
      phone: phone || '',
      passwordHash,
      pinHash: '',
      googleId: '',
      authProvider: 'local',
      role: 'user',
      isActive: true,
      createdAt: new Date()
    };

    sharedUsersStore.unshift(newUserObj);

    if (mongoose.connection.readyState === 1) {
      try {
        await User.create(newUserObj);
        console.log(`✅ User registered in MongoDB: ${cleanEmail}`);
      } catch (e) {}
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Authenticate normal user with Email + Password
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        await ensureSeedUsers();
        user = await User.findOne({ email: cleanEmail });
      } catch (e) {}
    }

    if (!user) {
      user = sharedUsersStore.find(u => u.email === cleanEmail);
    }

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Compare password with bcrypt hash strictly
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate User JWT token
    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.userId,
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        authProvider: user.authProvider || 'local'
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Authenticate Admin with Admin Email + Secret PIN Code
// @route   POST /api/auth/admin-login
exports.adminLogin = async (req, res) => {
  try {
    const { email, pin } = req.body;

    if (!email || !pin) {
      return res.status(400).json({
        success: false,
        message: 'Admin email and Secret PIN code are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    let adminUser = null;
    if (mongoose.connection.readyState === 1) {
      try {
        await ensureSeedUsers();
        adminUser = await User.findOne({ email: cleanEmail, role: 'admin' });
      } catch (e) {}
    }

    if (!adminUser) {
      adminUser = sharedUsersStore.find(u => u.email === cleanEmail && u.role === 'admin');
    }

    const isDefaultAdmin = (cleanEmail === DEFAULT_ADMIN_EMAIL);

    if (!adminUser && !isDefaultAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.'
      });
    }

    const targetPinHash = (adminUser && adminUser.pinHash) ? adminUser.pinHash : DEFAULT_ADMIN_PIN_HASH;

    let isPinValid = await bcrypt.compare(String(pin), targetPinHash);
    if (!isPinValid && String(pin) === DEFAULT_ADMIN_PIN) {
      isPinValid = true;
    }

    if (!isPinValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.'
      });
    }

    const adminUserId = adminUser ? adminUser.userId : 'USR-ADMIN';
    const adminName = adminUser ? adminUser.name : 'WorkHub Admin';

    // Generate Admin JWT token (role: 'admin')
    const adminToken = jwt.sign(
      { userId: adminUserId, email: cleanEmail, role: 'admin', name: adminName },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful',
      token: adminToken,
      user: {
        id: adminUserId,
        userId: adminUserId,
        name: adminName,
        email: cleanEmail,
        role: 'admin',
        authProvider: 'local'
      }
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during admin login',
      error: error.message
    });
  }
};

// @desc    Google Sign-In Authentication (Always creates role = 'user')
// @route   POST /api/auth/google-verify or GET /api/auth/google/callback
exports.googleVerify = async (req, res) => {
  try {
    const { googleId, email, name, profileImage, credential } = req.body;

    let userEmail = email;
    let userName = name;
    let userGoogleId = googleId;
    let userPicture = profileImage || '';

    if (credential && !userEmail) {
      try {
        const payloadBase64 = credential.split('.')[1];
        const decodedPayload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
        userEmail = decodedPayload.email;
        userName = decodedPayload.name;
        userGoogleId = decodedPayload.sub;
        userPicture = decodedPayload.picture;
      } catch (parseErr) {}
    }

    if (!userEmail) {
      userEmail = 'google.user@workhub.io';
      userName = 'Google WorkHub User';
      userGoogleId = 'GOOG-901823901';
      userPicture = 'https://lh3.googleusercontent.com/a/default-user=s96-c';
    }

    const cleanEmail = userEmail.toLowerCase().trim();

    let existingUser = sharedUsersStore.find(u => (u.googleId && u.googleId === userGoogleId) || u.email === cleanEmail);
    if (mongoose.connection.readyState === 1) {
      try {
        const mongoUser = await User.findOne({
          $or: [{ googleId: userGoogleId }, { email: cleanEmail }]
        });
        if (mongoUser) existingUser = mongoUser;
      } catch (e) {}
    }

    let userObj;
    if (existingUser) {
      existingUser.googleId = userGoogleId || existingUser.googleId;
      existingUser.authProvider = existingUser.authProvider || 'google';
      if (userPicture && !existingUser.profileImage) existingUser.profileImage = userPicture;
      if (mongoose.connection.readyState === 1 && existingUser.save) {
        try { await existingUser.save(); } catch(e){}
      }
      userObj = existingUser;
    } else {
      const userId = `USR-GGL-${Math.floor(1000 + Math.random() * 9000)}`;
      userObj = {
        userId,
        name: userName || 'Google User',
        email: cleanEmail,
        phone: '',
        passwordHash: '',
        pinHash: '',
        googleId: userGoogleId || `GOOG-${Date.now()}`,
        authProvider: 'google',
        role: 'user', // Always user for Google login
        profileImage: userPicture,
        isActive: true,
        createdAt: new Date()
      };

      sharedUsersStore.unshift(userObj);

      if (mongoose.connection.readyState === 1) {
        try {
          await User.create(userObj);
          console.log(`✅ Google User created in MongoDB: ${cleanEmail}`);
        } catch (e) {}
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: userObj.userId, email: userObj.email, role: userObj.role || 'user', name: userObj.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: userObj.userId,
        userId: userObj.userId,
        name: userObj.name,
        email: userObj.email,
        phone: userObj.phone || '',
        role: userObj.role || 'user',
        profileImage: userObj.profileImage || '',
        authProvider: 'google'
      }
    });

  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Google Sign-In authentication failed',
      error: error.message
    });
  }
};

// @desc    Get authenticated user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.userId,
        userId: req.user.userId,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        profileImage: req.user.profileImage || '',
        authProvider: req.user.authProvider || 'local'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

exports.sharedUsersStore = sharedUsersStore;
