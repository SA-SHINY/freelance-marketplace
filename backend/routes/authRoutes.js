const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  register, 
  login, 
  getMe, 
  updateProfile,
  changePassword,
  addPortfolio,
  getPortfolio,
  updatePortfolio,
  deletePortfolio
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['freelancer', 'client']).withMessage('Role must be either freelancer or client')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Private routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Portfolio routes
router.post('/portfolio', protect, addPortfolio);
router.get('/portfolio', protect, getPortfolio);
router.put('/portfolio/:id', protect, updatePortfolio);
router.delete('/portfolio/:id', protect, deletePortfolio);

module.exports = router;