const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

// Generate JWT Token
const generateToken = (id, username, role) => {
  return jwt.sign(
    { id, username, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @desc    Admin Login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return next(new AppError('Please provide username and password', 400));
    }

    // Check static admin first (from .env file)
    if (username === process.env.ADMIN_USERNAME && 
        password === process.env.ADMIN_PASSWORD) {
      
      const token = generateToken('admin', username, 'admin');

      return res.status(200).json({
        token,
        user: {
          id: 'admin',
          username,
          role: 'admin'
        }
      });
    }

    // Optional: Check database admin if you have MongoDB setup
    // const admin = await Admin.findOne({ username }).select('+password');
    
    // if (!admin) {
    //   return next(new AppError('Invalid credentials', 401));
    // }

    // const isPasswordValid = await admin.comparePassword(password);
    
    // if (!isPasswordValid) {
    //   return next(new AppError('Invalid credentials', 401));
    // }

    // // Update last login
    // admin.lastLogin = Date.now();
    // await admin.save({ validateBeforeSave: false });

    // const token = generateToken(admin._id, admin.username, admin.role);

    // return res.status(200).json({
    //   token,
    //   user: {
    //     id: admin._id,
    //     username: admin.username,
    //     email: admin.email,
    //     role: admin.role
    //   }
    // });

    // If credentials don't match
    return next(new AppError('Invalid credentials', 401));

  } catch (error) {
    next(error);
  }
};

// @desc    Verify Token
// @route   GET /api/auth/verify
// @access  Private
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(200).json({ 
        valid: false,
        message: 'No token provided' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.status(200).json({
      valid: true,
      user: decoded
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(200).json({ 
        valid: false,
        message: 'Invalid or expired token' 
      });
    }
    next(error);
  }
};

// @desc    Get Current Admin
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // For static admin
    if (req.user.id === 'admin') {
      return res.status(200).json({
        user: {
          id: 'admin',
          username: process.env.ADMIN_USERNAME,
          role: 'admin'
        }
      });
    }

    // For database admin (if using MongoDB)
    // const admin = await Admin.findById(req.user.id).select('-password');
    
    res.status(200).json({
      user: req.user
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};