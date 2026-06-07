const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  budget: { type: String, required: true },
  duration: { type: String, required: true },
  skills: [{ type: String }],
  status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientName: { type: String, required: true },
  proposals: [{
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    freelancerName: String,
    bidAmount: Number,
    coverLetter: String,
    status: { type: String, default: 'pending' },
    submittedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);