// const Admin = require('../models/admin');
// const jwt = require('jsonwebtoken');
// const AppError = require('../utils/AppError');

// // Generate JWT Token
// const generateToken = (id, username, role) => {
//   return jwt.sign(
//     { id, username, role },
//     process.env.JWT_SECRET,
//     { expiresIn: '7d' }
//   );
// };

// // @desc    Admin Login
// // @route   POST /api/auth/login
// // @access  Public
// exports.login = async (req, res, next) => {
//   try {
//     const { username, password } = req.body;

//     // Validate input
//     if (!username || !password) {
//       return next(new AppError('Please provide username and password', 400));
//     }

//     // Check static admin first (from .env file)
//     if (username === process.env.ADMIN_USERNAME && 
//         password === process.env.ADMIN_PASSWORD) {
      
//       const token = generateToken('admin', username, 'admin');

//       return res.status(200).json({
//         token,
//         user: {
//           id: 'admin',
//           username,
//           role: 'admin'
//         }
//       });
//     }

//     // Optional: Check database admin if you have MongoDB setup
//     // const admin = await Admin.findOne({ username }).select('+password');
    
//     // if (!admin) {
//     //   return next(new AppError('Invalid credentials', 401));
//     // }

//     // const isPasswordValid = await admin.comparePassword(password);
    
//     // if (!isPasswordValid) {
//     //   return next(new AppError('Invalid credentials', 401));
//     // }

//     // // Update last login
//     // admin.lastLogin = Date.now();
//     // await admin.save({ validateBeforeSave: false });

//     // const token = generateToken(admin._id, admin.username, admin.role);

//     // return res.status(200).json({
//     //   token,
//     //   user: {
//     //     id: admin._id,
//     //     username: admin.username,
//     //     email: admin.email,
//     //     role: admin.role
//     //   }
//     // });

//     // If credentials don't match
//     return next(new AppError('Invalid credentials', 401));

//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Verify Token
// // @route   GET /api/auth/verify
// // @access  Private
// exports.verifyToken = async (req, res, next) => {
//   try {
//     // Get token from header
//     const token = req.header('Authorization')?.replace('Bearer ', '');

//     if (!token) {
//       return res.status(200).json({ 
//         valid: false,
//         message: 'No token provided' 
//       });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     res.status(200).json({
//       valid: true,
//       user: decoded
//     });

//   } catch (error) {
//     if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
//       return res.status(200).json({ 
//         valid: false,
//         message: 'Invalid or expired token' 
//       });
//     }
//     next(error);
//   }
// };

// // @desc    Get Current Admin
// // @route   GET /api/auth/me
// // @access  Private
// exports.getMe = async (req, res, next) => {
//   try {
//     // For static admin
//     if (req.user.id === 'admin') {
//       return res.status(200).json({
//         user: {
//           id: 'admin',
//           username: process.env.ADMIN_USERNAME,
//           role: 'admin'
//         }
//       });
//     }

//     // For database admin (if using MongoDB)
//     // const admin = await Admin.findById(req.user.id).select('-password');
    
//     res.status(200).json({
//       user: req.user
//     });

//   } catch (error) {
//     next(error);
//   }
// };

// // @desc    Logout
// // @route   POST /api/auth/logout
// // @access  Private
// exports.logout = async (req, res, next) => {
//   try {
//     res.status(200).json({
//       success: true,
//       message: 'Logged out successfully'
//     });
//   } catch (error) {
//     next(error);
//   }
// };



const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, username, role) => {
  return jwt.sign(
    { id, username, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// @desc    Admin Login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide username and password' 
      });
    }

    // Static admin credentials (from .env ya default)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUsername && password === adminPassword) {
      
      const token = generateToken('admin', username, 'admin');

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: 'admin',
          username,
          role: 'admin'
        }
      });
    }

    // If credentials don't match
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid username or password' 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// @desc    Verify Token
// @route   GET /api/auth/verify
// @access  Public
exports.verifyToken = async (req, res) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

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
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get Current Admin
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // For static admin
    if (req.user && req.user.id === 'admin') {
      return res.status(200).json({
        success: true,
        user: {
          id: 'admin',
          username: process.env.ADMIN_USERNAME || 'admin',
          role: 'admin'
        }
      });
    }

    res.status(200).json({
      success: true,
      user: req.user
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};