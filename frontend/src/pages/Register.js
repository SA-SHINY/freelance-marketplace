import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'freelancer',
    skills: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()) : [];
    
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      skills: skillsArray,
      bio: formData.bio
    });
    
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 fade-in">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-2">
              Create an Account
            </h2>
            <p className="text-gray-600">
              Join our freelance marketplace today
            </p>
          </div>

          {/* Register Form */}
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  <i className="fas fa-user mr-2 text-red-500"></i>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 transition text-gray-800 placeholder-gray-400"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  <i className="fas fa-envelope mr-2 text-red-500"></i>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 transition text-gray-800 placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  <i className="fas fa-lock mr-2 text-red-500"></i>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 transition text-gray-800 placeholder-gray-400"
                  placeholder="Create a password (min 6 characters)"
                />
              </div>

              {/* Confirm Password Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  <i className="fas fa-check-circle mr-2 text-red-500"></i>
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 transition text-gray-800 placeholder-gray-400"
                  placeholder="Confirm your password"
                />
              </div>

              {/* Role Selection */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  <i className="fas fa-user-tag mr-2 text-red-500"></i>
                  I am a
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="freelancer"
                      checked={formData.role === 'freelancer'}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-500 focus:ring-red-400 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">Freelancer</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="client"
                      checked={formData.role === 'client'}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-500 focus:ring-red-400 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">Client</span>
                  </label>
                </div>
              </div>

              {/* Skills Field (Freelancer only) */}
              {formData.role === 'freelancer' && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    <i className="fas fa-code mr-2 text-red-500"></i>
                    Skills
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 transition text-gray-800 placeholder-gray-400"
                    placeholder="React, Node.js, Python (comma separated)"
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate skills with commas</p>
                </div>
              )}

              {/* Bio Field */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  <i className="fas fa-info-circle mr-2 text-red-500"></i>
                  Bio (Optional)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 transition text-gray-800 placeholder-gray-400 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i>
                    Register
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-red-500 hover:text-red-600 font-semibold transition">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;