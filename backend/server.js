const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load Environment Variables
dotenv.config();

// Initialize Express App
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: '*' })); // Allow cross-origin requests from both User Website & Admin Dashboard
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Centralized API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/workspaces', require('./routes/workspaceRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/memberships', require('./routes/membershipRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Root Health Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Co-Workspace Management Centralized API Server is running',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'WorkHub Centralized REST API Services Online',
    endpoints: [
      '/api/auth',
      '/api/users',
      '/api/workspaces',
      '/api/bookings',
      '/api/memberships',
      '/api/payments',
      '/api/contact',
      '/api/admin'
    ]
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Middleware
app.use((err, req, res, next) => {
  console.error('🔥 Global Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 WorkHub Centralized API Server running on http://localhost:${PORT}`);
});
