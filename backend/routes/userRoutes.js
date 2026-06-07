const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');

// Get user profile by ID with real project stats
router.get('/profile/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get REAL project counts from database
    const totalProjects = await Project.countDocuments({ clientId: user._id });
    const openProjects = await Project.countDocuments({ clientId: user._id, status: 'open' });
    const inProgressProjects = await Project.countDocuments({ clientId: user._id, status: 'in-progress' });
    const completedProjects = await Project.countDocuments({ clientId: user._id, status: 'completed' });
    
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        location: user.location,
        companyName: user.companyName,
        companySize: user.companySize,
        industry: user.industry,
        companyWebsite: user.companyWebsite,
        phoneNumber: user.phoneNumber
      },
      stats: {
        totalProjects,
        openProjects,
        inProgressProjects,
        completedProjects
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get projects by type (for clicking on stats)
router.get('/:id/projects/:type', protect, async (req, res) => {
  try {
    const { id, type } = req.params;
    let query = { clientId: id };
    
    if (type === 'open') {
      query.status = 'open';
    } else if (type === 'active') {
      query.status = 'in-progress';
    } else if (type === 'completed') {
      query.status = 'completed';
    }
    // 'all' means no status filter
    
    const projects = await Project.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      projects,
      type
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;