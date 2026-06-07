const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// Create a new project
router.post('/create', protect, async (req, res) => {
  try {
    const { title, description, category, budget, duration, skills } = req.body;
    
    if (!title || !description || !budget || !duration) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      category,
      budget,
      duration,
      skills: skills || [],
      clientId: req.user.id,
      clientName: req.user.name,
      status: 'open'
    });
    
    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get client's own projects
router.get('/my-projects', protect, async (req, res) => {
  try {
    const projects = await Project.find({ clientId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all open projects (for freelancers)
router.get('/available', protect, async (req, res) => {
  try {
    const projects = await Project.find({ 
      status: 'open',
      clientId: { $ne: req.user.id }
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single project by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Place a bid on project - FIXED VERSION
router.post('/:id/bid', protect, async (req, res) => {
  try {
    const { bidAmount, coverLetter } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    if (project.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Project is not open for bids' });
    }
    
    // Check if already bid - use req.user (from protect middleware)
    const existingBid = project.proposals.find(
      p => p.freelancerId && p.freelancerId.toString() === req.user.id
    );
    
    if (existingBid) {
      return res.status(400).json({ success: false, message: 'You have already placed a bid on this project' });
    }
    
    // Add proposal - use req.user
    project.proposals.push({
      freelancerId: req.user.id,
      freelancerName: req.user.name,
      bidAmount,
      coverLetter,
      status: 'pending',
      submittedAt: new Date()
    });
    
    await project.save();
    
    // Create notification for client
    try {
      await Notification.create({
        userId: project.clientId,
        title: 'New Bid Received! 💰',
        message: `${req.user.name} placed a bid of $${bidAmount} on "${project.title}"`,
        type: 'new_bid',
        relatedId: project._id,
        relatedType: 'project',
        read: false
      });
    } catch (err) {
      console.log('Notification error:', err.message);
    }
    
    res.json({ 
      success: true, 
      message: 'Bid placed successfully',
      proposal: {
        projectId: project._id,
        projectTitle: project.title,
        bidAmount: bidAmount,
        coverLetter: coverLetter,
        status: 'pending',
        submittedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get freelancer's bids
router.get('/my-bids', protect, async (req, res) => {
  try {
    const projects = await Project.find({ 'proposals.freelancerId': req.user.id });
    
    const myBids = [];
    projects.forEach(project => {
      project.proposals.forEach(proposal => {
        if (proposal.freelancerId && proposal.freelancerId.toString() === req.user.id) {
          myBids.push({
            _id: proposal._id,
            projectId: project._id,
            projectTitle: project.title,
            projectBudget: project.budget,
            bidAmount: proposal.bidAmount,
            coverLetter: proposal.coverLetter,
            status: proposal.status,
            submittedAt: proposal.submittedAt,
            clientName: project.clientName
          });
        }
      });
    });
    
    res.json({ success: true, bids: myBids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get proposals for client
router.get('/my-proposals', protect, async (req, res) => {
  try {
    const projects = await Project.find({ 
      clientId: req.user.id,
      'proposals.0': { $exists: true }
    }).sort({ createdAt: -1 });
    
    const allProposals = [];
    projects.forEach(project => {
      project.proposals.forEach(proposal => {
        allProposals.push({
          _id: proposal._id,
          projectId: project._id,
          projectTitle: project.title,
          projectBudget: project.budget,
          projectDescription: project.description,
          freelancerId: proposal.freelancerId,
          freelancerName: proposal.freelancerName,
          bidAmount: proposal.bidAmount,
          coverLetter: proposal.coverLetter,
          status: proposal.status,
          submittedAt: proposal.submittedAt
        });
      });
    });
    
    res.json({ success: true, proposals: allProposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Accept a bid
router.post('/accept-bid/:bidId', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      clientId: req.user.id,
      'proposals._id': req.params.bidId 
    });
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Bid not found' });
    }
    
    const selectedBid = project.proposals.id(req.params.bidId);
    
    project.proposals.forEach(p => {
      p.status = p._id.toString() === req.params.bidId ? 'accepted' : 'rejected';
    });
    
    project.status = 'in-progress';
    project.selectedFreelancerId = selectedBid.freelancerId;
    await project.save();
    
    // Notify freelancer
    try {
      await Notification.create({
        userId: selectedBid.freelancerId,
        title: 'Bid Accepted! 🎉',
        message: `${req.user.name} accepted your bid of $${selectedBid.bidAmount} for "${project.title}"`,
        type: 'bid_accepted',
        relatedId: project._id,
        relatedType: 'project',
        read: false
      });
    } catch (err) {
      console.log('Notification error:', err.message);
    }
    
    res.json({ success: true, message: 'Bid accepted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update project status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, clientId: req.user.id },
      { status, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete project
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      clientId: req.user.id
    });
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;