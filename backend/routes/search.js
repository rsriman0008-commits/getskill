const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');

const router = express.Router();

/**
 * GET /api/search
 * Search for courses and users by query and filters
 */
router.get('/', async (req, res) => {
  try {
    const { q, category, level, mode, minRating, sort } = req.query;

    // Build query for courses
    let courseQuery = {};

    if (q) {
      courseQuery.$or = [
        { courseName: { $regex: q, $options: 'i' } },
        { overview: { $regex: q, $options: 'i' } },
        { 'teacher.name': { $regex: q, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      courseQuery.category = category;
    }

    if (level) {
      courseQuery.targetLevel = level;
    }

    if (mode && mode !== 'All') {
      courseQuery.mode = { $in: mode.split(',').map(m => m.trim()) };
    }

    if (minRating) {
      courseQuery.averageRating = { $gte: parseFloat(minRating) };
    }

    // Determine sort option
    let sortOption = { createdAt: -1 };
    if (sort === 'rating') {
      sortOption = { averageRating: -1 };
    } else if (sort === 'popular') {
      sortOption = { ratingCount: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    // Fetch courses
    const courses = await Course.find(courseQuery)
      .populate('teacher', 'name email location skillsTeach -passwordHash')
      .sort(sortOption)
      .limit(50);

    // Group courses by category
    const groupedByCategory = {};
    courses.forEach(course => {
      if (!groupedByCategory[course.category]) {
        groupedByCategory[course.category] = [];
      }
      groupedByCategory[course.category].push({
        _id: course._id,
        courseName: course.courseName,
        category: course.category,
        targetLevel: course.targetLevel,
        teacher: course.teacher,
        averageRating: course.averageRating,
        ratingCount: course.ratingCount,
        mode: course.mode
      });
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      results: groupedByCategory
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/search/suggestions
 * Get skill suggestions for autocomplete
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        suggestions: []
      });
    }

    // Get skills from courses
    const courses = await Course.find({
      courseName: { $regex: q, $options: 'i' }
    })
      .select('courseName category')
      .limit(10);

    // Get unique course names as suggestions
    const suggestions = [...new Set(courses.map(c => ({
      name: c.courseName,
      category: c.category
    })))];

    res.status(200).json({
      success: true,
      suggestions: suggestions.slice(0, 5)
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/search/trending
 * Get trending skills
 */
router.get('/trending', async (req, res) => {
  try {
    const trendingSkills = await Course.aggregate([
      {
        $group: {
          _id: '$category',
          courses: { $push: '$$ROOT' },
          avgRating: { $avg: '$averageRating' },
          totalCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalCount: -1 }
      },
      {
        $limit: 6
      }
    ]);

    // Enhance with course details
    const enhanced = trendingSkills.map(group => ({
      category: group._id,
      courseCount: group.totalCount,
      averageRating: group.avgRating,
      topCourse: group.courses[0]
    }));

    res.status(200).json({
      success: true,
      trending: enhanced
    });
  } catch (error) {
    console.error('Error fetching trending skills:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
