const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /api/courses
 * Create a new course (auth required)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      courseName,
      category,
      qualification,
      targetLevel,
      whatYouLearn,
      keyFeatures,
      overview,
      timePreference,
      mode,
      exchangeWanted
    } = req.body;

    // Validate required fields
    if (!courseName || !category || !qualification || !targetLevel || !whatYouLearn || !overview || !timePreference || !mode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const newCourse = new Course({
      teacher: req.userId,
      courseName,
      category,
      qualification,
      targetLevel,
      whatYouLearn,
      keyFeatures: keyFeatures || [],
      overview,
      timePreference,
      mode,
      exchangeWanted: exchangeWanted || ''
    });

    await newCourse.save();
    await newCourse.populate('teacher', 'name email -passwordHash');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: newCourse
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/courses
 * Get all courses with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (level) query.targetLevel = level;
    if (search) {
      query.$or = [
        { courseName: { $regex: search, $options: 'i' } },
        { overview: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('teacher', 'name email location -passwordHash')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/courses/my
 * Get courses created by current user
 */
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.userId })
      .populate('teacher', 'name email -passwordHash')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/courses/:id
 * Get a specific course
 */
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email location bio qualification -passwordHash');

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/courses/:id
 * Update a course (only by teacher)
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user is the teacher
    if (course.teacher.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this course'
      });
    }

    // Update fields
    const { courseName, category, qualification, targetLevel, whatYouLearn, keyFeatures, overview, timePreference, mode, exchangeWanted } = req.body;

    if (courseName) course.courseName = courseName;
    if (category) course.category = category;
    if (qualification) course.qualification = qualification;
    if (targetLevel) course.targetLevel = targetLevel;
    if (whatYouLearn) course.whatYouLearn = whatYouLearn;
    if (keyFeatures) course.keyFeatures = keyFeatures;
    if (overview) course.overview = overview;
    if (timePreference) course.timePreference = timePreference;
    if (mode) course.mode = mode;
    if (exchangeWanted !== undefined) course.exchangeWanted = exchangeWanted;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/courses/:id
 * Delete a course (only by teacher)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user is the teacher
    if (course.teacher.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this course'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
