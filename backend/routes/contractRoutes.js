const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// Create contract (Client)
router.post('/create', protect, async (req, res) => {
  try {
    const { 
      projectId, 
      freelancerId, 
      amount,           // from frontend
      bidAmount,        // alternative name
      startDate, 
      endDate, 
      scope,            // from frontend
      coverLetter,      // alternative name
      projectTitle 
    } = req.body;
    
    const project = await Project.findById(projectId);
    const freelancer = await User.findById(freelancerId);
    
    if (!project || !freelancer) {
      return res.status(404).json({ success: false, message: 'Project or freelancer not found' });
    }
    
    // Use either amount or bidAmount
    const contractAmount = amount || bidAmount;
    const contractScope = scope || coverLetter;
    
    if (!contractAmount || !startDate || !endDate || !contractScope) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: amount, startDate, endDate, scope' 
      });
    }
    
    const contract = await Contract.create({
      projectId,
      projectTitle: projectTitle || project.title,
      projectDescription: project.description,
      projectAmount: project.amount,
      projectDuration: project.duration,
      clientId: req.user.id,
      clientName: req.user.name,
      freelancerId,
      freelancerName: freelancer.name,
      freelancerEmail: freelancer.email,
      amount: contractAmount,
      bidAmount: contractAmount,
      scope: contractScope,
      coverLetter: contractScope,
      startDate,
      endDate,
      status: 'pending'
    });
    
    project.contractId = contract._id;
    await project.save();
    
    res.status(201).json({ success: true, contract });
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get freelancer's contracts
router.get('/freelancer', protect, async (req, res) => {
  try {
    const contracts = await Contract.find({ freelancerId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, contracts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get client's contracts
router.get('/client', protect, async (req, res) => {
  try {
    const contracts = await Contract.find({ clientId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, contracts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get contract by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }
    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Accept contract (Freelancer)
router.put('/:id/accept', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    contract.status = 'active';
    await contract.save();
    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject contract (Freelancer)
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    contract.status = 'rejected';
    await contract.save();
    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Complete contract (Freelancer)
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    contract.status = 'completed';
    await contract.save();
    await Project.findByIdAndUpdate(contract.projectId, { status: 'completed' });
    res.json({ success: true, contract });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add message to contract
router.post('/:id/message', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const contract = await Contract.findById(req.params.id);
    
    contract.messages.push({
      senderId: req.user.id,
      senderName: req.user.name,
      senderRole: contract.clientId.toString() === req.user.id ? 'client' : 'freelancer',
      message,
      timestamp: new Date()
    });
    await contract.save();
    
    res.json({ success: true, messages: contract.messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;