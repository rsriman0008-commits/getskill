const express = require('express');
const User = require('../models/User');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const { findMatches } = require('../utils/matchingAlgorithm');

const router = express.Router();

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/users/me
 * Update current user profile
 */
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, bio, location, qualification, interestedFields, skillsTeach, skillsLearn } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (qualification) user.qualification = qualification;
    if (interestedFields) user.interestedFields = interestedFields;
    if (skillsTeach) user.skillsTeach = skillsTeach;
    if (skillsLearn) user.skillsLearn = skillsLearn;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/:id
 * Get public profile of any user
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/users/onboarding
 * Save onboarding data
 */
router.post('/onboarding', authMiddleware, async (req, res) => {
  try {
    const { qualification, location, bio, interestedFields, skillsTeach, skillsLearn } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Validate input
    if (!qualification || !location || !skillsTeach || !skillsLearn) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Update user with onboarding data
    user.qualification = qualification;
    user.location = location;
    user.bio = bio || '';
    user.interestedFields = interestedFields || [];
    user.skillsTeach = skillsTeach;
    user.skillsLearn = skillsLearn;
    user.isOnboarded = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/matches
 * Get top 10 matches for current user
 */
router.get('/matches', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get all other users
    const allUsers = await User.find({ _id: { $ne: req.userId }, isOnboarded: true });

    // Find matches
    const matches = await findMatches(currentUser, allUsers, 10);

    res.status(200).json({
      success: true,
      matches
    });
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
