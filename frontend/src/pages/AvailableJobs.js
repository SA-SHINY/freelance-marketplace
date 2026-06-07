import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const AvailableJobs = () => {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidData, setBidData] = useState({
    bidAmount: '',
    coverLetter: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'all', 'Web Development', 'Mobile Development', 'Design', 'Backend Development',
    'Frontend Development', 'CMS Development', 'Data Science', 'Marketing', 'Writing', 'Video Editing'
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/projects/available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!bidData.bidAmount || !bidData.coverLetter) {
      toast.error('Please fill all fields');
      return;
    }
    
    setSubmitting(true);
    try {
      await axios.post(
        `http://localhost:5000/api/projects/${selectedProject._id}/bid`,
        {
          bidAmount: parseFloat(bidData.bidAmount),
          coverLetter: bidData.coverLetter
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Bid placed successfully on "${selectedProject.title}"!`);
      setShowBidModal(false);
      setBidData({ bidAmount: '', coverLetter: '' });
      fetchProjects();
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error(error.response?.data?.message || 'Error placing bid');
    } finally {
      setSubmitting(false);
    }
  };

  // Function to get display budget
  const getDisplayBudget = (project) => {
    if (project.amount) {
      return `$${project.amount.toLocaleString()}`;
    }
    if (project.budget) {
      return project.budget;
    }
    return 'Budget not specified';
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Available Projects</h1>
          
          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Search projects by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No projects available</p>
              <p className="text-gray-400 text-sm mt-2">Check back later for new opportunities</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredProjects.map(project => (
                <div key={project._id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{project.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        <i className="fas fa-building mr-1"></i> {project.clientName} |
                        <i className="fas fa-clock ml-2 mr-1"></i> {project.duration}
                      </p>
                      <p className="text-gray-600 mt-3 line-clamp-2">{project.description}</p>
                      {project.skills && project.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {project.skills.slice(0, 4).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">{skill}</span>
                          ))}
                          {project.skills.length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">+{project.skills.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-green-600">{getDisplayBudget(project)}</div>
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowBidModal(true);
                        }}
                        className="mt-3 btn-primary px-4 py-2"
                      >
                        <i className="fas fa-gavel mr-1"></i> Place Bid
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Place a Bid</h2>
              <p className="text-gray-500 mt-1">{selectedProject.title}</p>
              <p className="text-gray-500 text-sm">Project Budget: {getDisplayBudget(selectedProject)}</p>
            </div>
            <form onSubmit={handlePlaceBid} className="p-6">
              <div className="mb-4">
                <label className="block font-semibold mb-2">Your Bid Amount ($) *</label>
                <input
                  type="number"
                  required
                  value={bidData.bidAmount}
                  onChange={(e) => setBidData({ ...bidData, bidAmount: e.target.value })}
                  className="input-field"
                  placeholder="Enter your bid amount"
                  min="1"
                  step="1"
                />
                <p className="text-xs text-gray-400 mt-1">Enter the amount you want to charge for this project</p>
              </div>
              <div className="mb-6">
                <label className="block font-semibold mb-2">Cover Letter *</label>
                <textarea
                  required
                  rows="5"
                  value={bidData.coverLetter}
                  onChange={(e) => setBidData({ ...bidData, coverLetter: e.target.value })}
                  className="input-field"
                  placeholder="Explain why you are the best fit for this project..."
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="flex-1 btn-primary py-2">
                  {submitting ? <><i className="fas fa-spinner fa-spin mr-2"></i>Submitting...</> : <><i className="fas fa-paper-plane mr-2"></i>Submit Bid</>}
                </button>
                <button type="button" onClick={() => setShowBidModal(false)} className="flex-1 btn-secondary py-2">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableJobs;