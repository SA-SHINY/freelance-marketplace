const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get all freelancers with filters
router.get('/freelancers', protect, async (req, res) => {
  try {
    const { 
      skill, 
      minRating, 
      search, 
      location,
      minBudget,
      maxBudget
    } = req.query;
    
    console.log('Received query:', req.query);
    
    let query = { role: 'freelancer' };
    
    // Filter by skill (text search)
    if (skill && skill.trim()) {
      query.skills = { $in: [new RegExp(skill, 'i')] };
    }
    
    // Filter by minimum rating
    if (minRating && minRating !== 'all') {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Filter by location
    if (location && location.trim()) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Filter by budget range (min and max)
    if (minBudget && minBudget.trim()) {
      const minBudgetNum = parseFloat(minBudget);
      if (!isNaN(minBudgetNum)) {
        query.hourlyRate = { ...query.hourlyRate, $gte: minBudgetNum };
      }
    }
    
    if (maxBudget && maxBudget.trim()) {
      const maxBudgetNum = parseFloat(maxBudget);
      if (!isNaN(maxBudgetNum)) {
        query.hourlyRate = { ...query.hourlyRate, $lte: maxBudgetNum };
      }
    }
    
    // Search by name or skills
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('MongoDB query:', JSON.stringify(query, null, 2));
    
    const freelancers = await User.find(query).select('-password');
    
    console.log(`Found ${freelancers.length} freelancers`);
    
    res.json({
      success: true,
      freelancers
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get freelancer by ID
router.get('/freelancer/:id', protect, async (req, res) => {
  try {
    const freelancer = await User.findById(req.params.id).select('-password');
    
    if (!freelancer || freelancer.role !== 'freelancer') {
      return res.status(404).json({
        success: false,
        message: 'Freelancer not found'
      });
    }
    
    res.json({
      success: true,
      freelancer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;