import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidData, setBidData] = useState({
    amount: '',
    coverLetter: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Function to get display budget (handles both amount and budget fields)
  const getDisplayBudget = (project) => {
    if (project.amount) {
      return `$${project.amount.toLocaleString()}`;
    }
    if (project.budget) {
      return project.budget;
    }
    return 'Budget not specified';
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(response.data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!bidData.amount || !bidData.coverLetter) {
      toast.error('Please fill all fields');
      return;
    }
    
    setSubmitting(true);
    try {
      await axios.post(
        `http://localhost:5000/api/projects/${id}/bid`,
        bidData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Bid placed successfully!');
      setShowBidModal(false);
      setBidData({ amount: '', coverLetter: '' });
      fetchProjectDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error placing bid');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'open': return 'Open for Bids';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Project not found</h2>
        <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-600 hover:text-red-500 transition flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i> Back
          </button>

          {/* Project Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{project.title}</h1>
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      <i className="fas fa-tag mr-1 text-red-500"></i> {project.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      <i className="fas fa-calendar mr-1 text-red-500"></i> Posted: {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{getDisplayBudget(project)}</div>
                  <div className="text-sm text-gray-500">Budget</div>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                  {project.clientName?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Posted by</p>
                  <p className="font-semibold text-gray-800">{project.clientName}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                <i className="fas fa-align-left mr-2 text-red-500"></i> Project Description
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
            </div>

            {/* Skills Required */}
            {project.skills && project.skills.length > 0 && (
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-code mr-2 text-red-500"></i> Skills Required
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Duration */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                <i className="fas fa-clock mr-2 text-red-500"></i> Project Timeline
              </h3>
              <p className="text-gray-600">Duration: {project.duration}</p>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-gray-50">
              {user?.role === 'freelancer' && project.status === 'open' ? (
                <button
                  onClick={() => setShowBidModal(true)}
                  className="w-full btn-primary py-3 text-lg"
                >
                  <i className="fas fa-gavel mr-2"></i> Place a Bid
                </button>
              ) : user?.role === 'client' && project.clientId === user?._id ? (
                <div className="text-center text-gray-500">
                  <i className="fas fa-info-circle mr-2"></i>
                  This is your project. You can track proposals in your dashboard.
                </div>
              ) : project.status !== 'open' ? (
                <div className="text-center text-gray-500">
                  <i className="fas fa-lock mr-2"></i>
                  This project is no longer accepting bids.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Place a Bid</h2>
              <button onClick={() => setShowBidModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handlePlaceBid} className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  <i className="fas fa-dollar-sign mr-2 text-red-500"></i> Your Bid Amount
                </label>
                <input
                  type="number"
                  required
                  value={bidData.amount}
                  onChange={(e) => setBidData({ ...bidData, amount: e.target.value })}
                  className="input-field"
                  placeholder="Enter your bid amount"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  <i className="fas fa-envelope mr-2 text-red-500"></i> Cover Letter
                </label>
                <textarea
                  required
                  rows="4"
                  value={bidData.coverLetter}
                  onChange={(e) => setBidData({ ...bidData, coverLetter: e.target.value })}
                  className="input-field"
                  placeholder="Tell the client why you're the best fit for this project..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary py-2"
                >
                  {submitting ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Submitting...</>
                  ) : (
                    <><i className="fas fa-paper-plane mr-2"></i>Submit Bid</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBidModal(false)}
                  className="flex-1 btn-secondary py-2"
                >
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

export default ProjectDetails;