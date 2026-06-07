const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { protect } = require('../middleware/authMiddleware');

// Create a new service (Freelancer)
router.post('/create', protect, async (req, res) => {
  try {
    const { title, description, category, price, priceType, deliveryTime, skills, availability } = req.body;
    
    const service = await Service.create({
      freelancerId: req.user.id,
      freelancerName: req.user.name,
      title,
      description,
      category,
      price,
      priceType,
      deliveryTime,
      skills: skills || [],
      availability: availability || 'Available now',
      status: 'active'
    });
    
    res.status(201).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get freelancer's own services
router.get('/my-services', protect, async (req, res) => {
  try {
    const services = await Service.find({ freelancerId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all active services
router.get('/all', protect, async (req, res) => {
  try {
    const services = await Service.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single service
router.get('/:id', protect, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update service
router.put('/:id', protect, async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, freelancerId: req.user.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete service
router.delete('/:id', protect, async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      freelancerId: req.user.id
    });
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add work sample
router.post('/:id/work-sample', protect, async (req, res) => {
  try {
    const { title, description, imageUrl, link } = req.body;
    const service = await Service.findOne({ _id: req.params.id, freelancerId: req.user.id });
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    service.workSamples.push({ title, description, imageUrl, link });
    await service.save();
    
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete work sample
router.delete('/:serviceId/work-sample/:sampleId', protect, async (req, res) => {
  try {
    const service = await Service.findOne({ _id: req.params.serviceId, freelancerId: req.user.id });
    
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    service.workSamples = service.workSamples.filter(s => s._id.toString() !== req.params.sampleId);
    await service.save();
    
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;