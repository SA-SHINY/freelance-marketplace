const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancerName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide service title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide service description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Web Development', 'Mobile Development', 'Design', 'Writing', 'Marketing', 
           'Video Editing', 'Data Science', 'AI/ML', 'Cybersecurity', 'Cloud Services', 
           'IT Support', 'Consulting', 'Other']
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: 0
  },
  priceType: {
    type: String,
    enum: ['hourly', 'fixed', 'monthly'],
    default: 'hourly'
  },
  deliveryTime: {
    type: String,
    required: [true, 'Please provide delivery time'],
    enum: ['Less than 1 day', '1-3 days', '3-7 days', '1-2 weeks', '2-4 weeks', '1+ month']
  },
  skills: [{
    type: String,
    trim: true
  }],
  workSamples: [{
    title: String,
    description: String,
    imageUrl: String,
    link: String
  }],
  availability: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Available now', 'Busy', 'On leave'],
    default: 'Available now'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'paused'],
    default: 'active'
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', serviceSchema);