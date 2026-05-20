const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      passwordHash: password,
      isOnboarded: false
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: newUser.getPublicProfile()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
});

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Compare passwords
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile(),
      isOnboarded: user.isOnboarded
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Login failed'
    });
  }
});

/**
 * DELETE /api/auth/reset-db (Development Only)
 * Clear all users from database
 */
router.delete('/reset-db', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        error: 'This endpoint is only available in development mode'
      });
    }

    const result = await User.deleteMany({});
    
    res.status(200).json({
      success: true,
      message: `Database reset successfully. Deleted ${result.deletedCount} users.`
    });
  } catch (error) {
    console.error('Reset DB error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Database reset failed'
    });
  }
});

/**
 * GET /api/auth/auto-login
 * Auto-login with demo user (public access mode)
 */
router.get('/auto-login', async (req, res) => {
  try {
    // Check if demo user exists
    let user = await User.findOne({ email: 'demo@skillswap.com' });
    
    // Create demo user if doesn't exist
    if (!user) {
      user = new User({
        name: 'Demo User',
        email: 'demo@skillswap.com',
        passwordHash: 'demo123456',
        bio: 'Welcome to SkillSwap! This is a demo account. Explore and connect with skill exchange partners.',
        location: 'Global',
        qualification: 'Self-taught',
        skillsTeach: [
          {
            title: 'Web Development',
            category: 'Technology',
            proficiency: 'Expert',
            description: 'Full-stack web development with React and Node.js',
            rating: 5,
            ratingCount: 10
          }
        ],
        skillsLearn: [
          {
            title: 'Machine Learning',
            category: 'Technology',
            urgency: 'Medium'
          },
          {
            title: 'Graphic Design',
            category: 'Art',
            urgency: 'Low'
          }
        ],
        isOnboarded: true,
        trustScore: 85
      });
      
      await user.save();
      console.log('✅ Demo user created');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      message: 'Auto-login successful',
      token,
      user: user.getPublicProfile(),
      isOnboarded: true
    });
  } catch (error) {
    console.error('Auto-login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Auto-login failed'
    });
  }
});

module.exports = router;
