import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PostProjectModal = ({ isOpen, onClose, onProjectPosted, token }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    budget: '',
    duration: '',
    skills: ''
  });

  const categories = [
    'Web Development',
    'Mobile Development',
    'Design',
    'Backend Development',
    'Frontend Development',
    'CMS Development',
    'Data Science',
    'Marketing',
    'Writing',
    'Video Editing',
    'Other'
  ];

  const durations = [
    'Less than 1 week',
    '1-2 weeks',
    '2-4 weeks',
    '1-2 months',
    '3+ months'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter project title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter project description');
      return;
    }
    if (!formData.budget) {
      toast.error('Please enter project budget');
      return;
    }
    if (!formData.duration) {
      toast.error('Please select project duration');
      return;
    }

    setLoading(true);
    
    const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [];
    
    // Format budget to include dollar sign
    let formattedBudget = formData.budget;
    if (!formData.budget.startsWith('$')) {
      const budgetNum = parseFloat(formData.budget.replace(/,/g, ''));
      if (!isNaN(budgetNum)) {
        formattedBudget = `$${budgetNum.toLocaleString()}`;
      } else {
        formattedBudget = `$${formData.budget}`;
      }
    }
    
    const projectData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      budget: formattedBudget,
      duration: formData.duration,
      skills: skillsArray
    };
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/projects/create',
        projectData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        toast.success('Project posted successfully!');
        onProjectPosted(response.data.project);
        onClose();
        setFormData({
          title: '',
          description: '',
          category: 'Web Development',
          budget: '',
          duration: '',
          skills: ''
        });
      } else {
        toast.error(response.data.message || 'Failed to post project');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Error posting project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            <i className="fas fa-plus-circle text-red-500 mr-2"></i>
            Post New Project
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g., E-commerce Website Development"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              className="input-field"
              placeholder="Describe your project requirements, goals, and expectations..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="input-field"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              <i className="fas fa-dollar-sign mr-1 text-red-500"></i>
              Project Budget *
            </label>
            <input
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="$2,500 or $2,000 - $5,000"
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter your budget (e.g., $2,500 or $2,000 - $5,000)
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Duration *
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Select duration</option>
              {durations.map(dur => (
                <option key={dur} value={dur}>{dur}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., React, Node.js, MongoDB"
            />
            <p className="text-xs text-gray-400 mt-1">Separate skills with commas</p>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-3">
              {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Posting...</> : <><i className="fas fa-paper-plane mr-2"></i>Post Project</>}
            </button>
            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-3">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostProjectModal;