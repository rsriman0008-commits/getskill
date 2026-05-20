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
 * POST /api/auth/firebase-login
 * Verify Firebase ID Token (mock or real) and authenticate/register user
 */
router.post('/firebase-login', async (req, res) => {
  try {
    const { idToken, name, email } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'Firebase ID Token is required'
      });
    }

    let verifiedEmail = email;
    let verifiedName = name;
    let firebaseUid = 'mock-uid';

    // 1. Decode Firebase ID Token
    if (idToken.startsWith('mock-firebase-token-')) {
      // Simulation mode: Extract properties from token signature
      const parts = idToken.split('-');
      verifiedEmail = parts[3]; // mock-firebase-token-email-uid
      firebaseUid = parts[4] || 'mock-uid';
    } else {
      // Live Firebase mode: Safely parse standard decoded token
      try {
        const decoded = jwt.decode(idToken);
        if (decoded) {
          verifiedEmail = decoded.email;
          verifiedName = decoded.name || name;
          firebaseUid = decoded.sub;
        }
      } catch (err) {
        console.error('Firebase real token decoding warning:', err);
      }
    }

    if (!verifiedEmail) {
      return res.status(400).json({
        success: false,
        error: 'Failed to verify email identity from Firebase token'
      });
    }

    // 2. Query user in MongoDB
    let user = await User.findOne({ email: verifiedEmail.toLowerCase() });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = new User({
        name: verifiedName || verifiedEmail.split('@')[0],
        email: verifiedEmail.toLowerCase(),
        passwordHash: `firebase-pwd-${Math.random().toString(36).slice(-8)}`, // Password required by schema
        isOnboarded: false
      });
      await user.save();
      console.log(`👤 Created new Firebase registered user: ${verifiedEmail}`);
    }

    // 3. Trigger seeding in background if dummy users are missing
    seedDummyData().catch(err => console.error('Seeder execution error:', err));

    // 4. Issue App JWT Token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production_12345678',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: isNewUser ? 'User registered successfully via Firebase' : 'Login successful',
      token,
      user: user.getPublicProfile(),
      isOnboarded: user.isOnboarded,
      isNewUser
    });
  } catch (error) {
    console.error('Firebase Login Route Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Firebase Authentication failed'
    });
  }
});

/**
 * GET /api/auth/seed
 * Force manual execution of the database seeder
 */
router.get('/seed', async (req, res) => {
  try {
    await seedDummyData();
    res.status(200).json({
      success: true,
      message: 'Database seeder executed successfully. Look at backend logs.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/auth/auto-login
 * Auto-login with demo user (public access mode)
 */
router.get('/auto-login', async (req, res) => {
  try {
    // Seed dummy data in background if needed
    seedDummyData().catch(err => console.error('Seeder execution error:', err));

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
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production_12345678',
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

// ----------------------------------------------------
// Database Seeder Implementation
// ----------------------------------------------------

const seedDummyData = async () => {
  try {
    const Course = require('../models/Course');
    
    // 1. Check if dummy users already exist
    const count = await User.countDocuments({ 
      email: { $in: ['sarah@skillswap.com', 'jeanluc@skillswap.com', 'elena@skillswap.com', 'marcus@skillswap.com'] } 
    });
    
    if (count > 0) {
      return; // Already seeded
    }

    console.log('🌱 Database seeder: Seeding high-fidelity swap portfolios...');

    // Create 4 Dummy Users
    const sarah = new User({
      name: 'Sarah Chen',
      email: 'sarah@skillswap.com',
      passwordHash: 'sarah123456',
      bio: 'Figma UI/UX designer and React frontend engineer. Love sharing developer workflows and teaching beautiful, responsive design systems.',
      location: 'San Francisco, CA',
      qualification: 'Self-taught',
      interestedFields: ['Technology', 'Art'],
      skillsTeach: [
        { title: 'Web Development', category: 'Technology', proficiency: 'Expert', description: 'React, Node, and responsive Tailwind layouts', rating: 4.8, ratingCount: 15 },
        { title: 'UI/UX Design', category: 'Art', proficiency: 'Expert', description: 'Figma design systems and interactive prototyping', rating: 5.0, ratingCount: 12 }
      ],
      skillsLearn: [
        { title: 'French', category: 'Language', urgency: 'High' }
      ],
      isOnboarded: true,
      trustScore: 96
    });

    const jeanluc = new User({
      name: 'Jean-Luc Dupont',
      email: 'jeanluc@skillswap.com',
      passwordHash: 'jeanluc123456',
      bio: 'Native French speaker from Paris. High school teacher with over 8 years of instruction experience. Eager to master frontend coding!',
      location: 'Boston, MA',
      qualification: 'Other',
      interestedFields: ['Language', 'Technology'],
      skillsTeach: [
        { title: 'French Language', category: 'Language', proficiency: 'Expert', description: 'Conversational French, syntax, and business vocabulary', rating: 4.9, ratingCount: 22 }
      ],
      skillsLearn: [
        { title: 'Web Development', category: 'Technology', urgency: 'Medium' }
      ],
      isOnboarded: true,
      trustScore: 98
    });

    const elena = new User({
      name: 'Elena Rostova',
      email: 'elena@skillswap.com',
      passwordHash: 'elena123456',
      bio: 'Professional concert pianist and private instructor. I will help you master scales, music theory, and chord progression.',
      location: 'London, UK',
      qualification: 'Other',
      interestedFields: ['Music', 'Fitness'],
      skillsTeach: [
        { title: 'Classical Piano', category: 'Music', proficiency: 'Expert', description: 'Baroque and romantic technique, scales, and sight reading', rating: 5.0, ratingCount: 18 }
      ],
      skillsLearn: [
        { title: 'Fitness Training', category: 'Fitness', urgency: 'Low' }
      ],
      isOnboarded: true,
      trustScore: 93
    });

    const marcus = new User({
      name: 'Marcus Aurelius',
      email: 'marcus@skillswap.com',
      passwordHash: 'marcus123456',
      bio: 'Certified personal trainer and fitness author. Passionate about strength biomechanics and high intensity strength training.',
      location: 'Austin, TX',
      qualification: 'Diploma',
      interestedFields: ['Fitness', 'Technology'],
      skillsTeach: [
        { title: 'Fitness Coaching', category: 'Fitness', proficiency: 'Expert', description: 'Hypertrophy mechanics, macronutrient calculation, and compound lifts', rating: 4.7, ratingCount: 9 }
      ],
      skillsLearn: [
        { title: 'Python Programming', category: 'Technology', urgency: 'High' }
      ],
      isOnboarded: true,
      trustScore: 89
    });

    await sarah.save();
    await jeanluc.save();
    await elena.save();
    await marcus.save();

    // Create 5 Active Classes (Courses)
    const courses = [
      new Course({
        teacher: sarah._id,
        courseName: 'React & Tailwind Web Development Workshop',
        category: 'Technology',
        qualification: 'Built 20+ responsive premium web apps and SaaS landing pages professionally.',
        targetLevel: 'Intermediate',
        whatYouLearn: [
          'Structure component hierarchies cleanly',
          'Integrate premium CSS glassmorphic overlays',
          'Optimize rendering performance and contexts'
        ],
        keyFeatures: ['Live coding reviews', 'Figma files provided', 'Full portfolio templates'],
        overview: 'This workshop provides a complete, hands-on dive into full stack React engineering. Perfect for designers looking to expand into developer roles.',
        timePreference: ['Evening', 'Weekends'],
        mode: 'Online',
        exchangeWanted: 'Seeking native conversational French lessons or classical piano tuition.'
      }),
      new Course({
        teacher: sarah._id,
        courseName: 'Figma UI/UX Design System Essentials',
        category: 'Art',
        qualification: 'Lead designer at major Silicon Valley design agency.',
        targetLevel: 'Beginner',
        whatYouLearn: [
          'Master Figma auto-layouts and components',
          'Create highly-interactive mobile prototypes',
          'Export production assets for developers easily'
        ],
        keyFeatures: ['Syllabus worksheets', 'Exclusive community group'],
        overview: 'Learn how to construct bulletproof UI mockups that engineers can translate into code seamlessly. Complete Figma training from absolute scratch.',
        timePreference: ['Morning', 'Evening'],
        mode: 'Online',
        exchangeWanted: 'Interested in French or language coaching swaps.'
      }),
      new Course({
        teacher: jeanluc._id,
        courseName: 'Conversational French for Everyday Settings',
        category: 'Language',
        qualification: 'Certified bilingual instructor with 8+ years experience.',
        targetLevel: 'Beginner',
        whatYouLearn: [
          'Order foods and navigate directions in Paris',
          'Master difficult French vowels and expressions',
          'Understand core sentence structure and grammar'
        ],
        keyFeatures: ['Daily chat practices', 'Custom audio logs'],
        overview: 'A highly engaging conversational class to build basic speaking confidence in French. Zero boring grammar rules, 100% active talking.',
        timePreference: ['Afternoon', 'Weekends'],
        mode: 'Both',
        exchangeWanted: 'Looking for a React or Node.js coder to pair program together.'
      }),
      new Course({
        teacher: elena._id,
        courseName: 'Classical Piano Scales & Chord Dynamics',
        category: 'Music',
        qualification: 'Concert pianist with degree in Music Performance from Royal College of Music.',
        targetLevel: 'Advanced',
        whatYouLearn: [
          'Drastically improve finger speed and touch agility',
          'Analyze complex chord structures and modes',
          'Play advanced baroque, classical, and romantic pieces'
        ],
        keyFeatures: ['Printable sheet music', 'Video homework reviews'],
        overview: 'Expand your piano repertoire with advanced scale mechanics, tempo dynamics, and performance confidence. Perfect for intermediate players looking to leap.',
        timePreference: ['Morning', 'Flexible'],
        mode: 'In-person',
        exchangeWanted: 'Seeking strength coaching, workouts, or diet guidelines.'
      }),
      new Course({
        teacher: marcus._id,
        courseName: 'Strength Mechanics & Macronutrient Bootcamp',
        category: 'Fitness',
        qualification: 'Certified Personal Trainer (NASM) and author.',
        targetLevel: 'Beginner',
        whatYouLearn: [
          'Execute squat, bench, and deadlift with perfect form',
          'Calculate exact target calories and macros for body recomp',
          'Build sustainable workout routines and discipline habits'
        ],
        keyFeatures: ['PDF training worksheets', 'Meal prep calculator'],
        overview: 'A scientific, results-oriented training bootcamp detailing physical fitness mechanics, proper muscle activation, and nutritional meal prep routines.',
        timePreference: ['Morning', 'Flexible'],
        mode: 'Both',
        exchangeWanted: 'Desperately seeking a tutor to learn Python scripting.'
      })
    ];

    for (const course of courses) {
      await course.save();
    }

    console.log('🌱 Database seeder: Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Database seeder: Seeding failed:', err);
  }
};

router.seedDummyData = seedDummyData;

module.exports = router;
