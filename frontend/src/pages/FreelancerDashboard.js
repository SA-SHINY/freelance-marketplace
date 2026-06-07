import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import FreelancerContracts from '../components/FreelancerContracts';
import ServiceManagement from '../components/ServiceManagement';

const FreelancerDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);

  // Fetch available projects
  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects/available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Fetch freelancer's bids
  const fetchMyBids = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects/my-bids', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyBids(response.data.bids || []);
    } catch (error) {
      console.error('Error fetching bids:', error);
      setMyBids([]);
    }
  };

  // Fetch contracts
  const fetchContracts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/contracts/freelancer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContracts(response.data.contracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchMyBids();
    fetchContracts();
  }, []);

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

  const handleFindJobs = () => {
    navigate('/available-jobs');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Pending</span>;
      case 'accepted':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 fade-in">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Find projects that match your skills and start earning.
          </p>
          <div className="mt-4 flex gap-3">
            <span className="badge-red">
              <i className="fas fa-code mr-1"></i> Freelancer
            </span>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
              <i className="fas fa-star mr-1"></i> {user?.skills?.length || 0} Skills
            </span>
          </div>
        </div>

        {/* Find Jobs Button */}
        <div className="mb-6">
          <button
            onClick={handleFindJobs}
            className="btn-primary flex items-center gap-2"
          >
            <i className="fas fa-search"></i>
            Browse Available Projects
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 font-semibold transition-all duration-300 rounded-t-lg whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-red-600 border-b-2 border-red-500 bg-gray-50/50'
                : 'text-gray-500 hover:text-red-500 hover:bg-gray-50/30'
            }`}
          >
            <i className="fas fa-search mr-2"></i>
            Available Projects
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className={`px-6 py-2 font-semibold transition-all duration-300 rounded-t-lg whitespace-nowrap ${
              activeTab === 'bids'
                ? 'text-red-600 border-b-2 border-red-500 bg-gray-50/50'
                : 'text-gray-500 hover:text-red-500 hover:bg-gray-50/30'
            }`}
          >
            <i className="fas fa-gavel mr-2"></i>
            My Bids ({myBids.length})
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-6 py-2 font-semibold transition-all duration-300 rounded-t-lg whitespace-nowrap ${
              activeTab === 'contracts'
                ? 'text-red-600 border-b-2 border-red-500 bg-gray-50/50'
                : 'text-gray-500 hover:text-red-500 hover:bg-gray-50/30'
            }`}
          >
            <i className="fas fa-file-contract mr-2"></i>
            Contracts ({contracts.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-6 py-2 font-semibold transition-all duration-300 rounded-t-lg whitespace-nowrap ${
              activeTab === 'services'
                ? 'text-red-600 border-b-2 border-red-500 bg-gray-50/50'
                : 'text-gray-500 hover:text-red-500 hover:bg-gray-50/30'
            }`}
          >
            <i className="fas fa-briefcase mr-2"></i>
            My Services
          </button>
        </div>

        {/* Available Projects Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div key={project._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:border-red-300 transition-all duration-300">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-2">
                  <i className="fas fa-dollar-sign mr-1 text-red-500"></i>
                  Budget: {getDisplayBudget(project)}
                </p>
                <p className="text-gray-600 mb-3">
                  <i className="fas fa-building mr-1"></i>
                  Client: {project.clientName}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.skills?.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="w-full btn-primary"
                >
                  <i className="fas fa-gavel mr-2"></i>
                  View & Place Bid
                </button>
              </div>
            ))}
            {projects.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No projects available at the moment</p>
              </div>
            )}
          </div>
        )}

        {/* My Bids Tab */}
        {activeTab === 'bids' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {myBids.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-gavel text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">You haven't placed any bids yet</p>
                <button onClick={handleFindJobs} className="btn-primary mt-4">
                  Browse Projects
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {myBids.map(bid => (
                  <div key={bid._id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-800">{bid.projectTitle}</h3>
                          {getStatusBadge(bid.status)}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          <i className="fas fa-building mr-1 text-red-500"></i> Client: {bid.clientName}
                        </p>
                        <p className="text-gray-600 text-sm mb-2">
                          <i className="fas fa-dollar-sign mr-1 text-red-500"></i> Your Bid: ${bid.bidAmount?.toLocaleString()}
                        </p>
                        <p className="text-gray-500 text-xs">
                          <i className="fas fa-clock mr-1"></i> Submitted: {new Date(bid.submittedAt).toLocaleString()}
                        </p>
                        {bid.coverLetter && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 font-semibold mb-1">Your Cover Letter:</p>
                            <p className="text-sm text-gray-600">{bid.coverLetter}</p>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {bid.status === 'accepted' && (
                          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            <i className="fas fa-check-circle mr-1"></i> Bid Accepted!
                          </span>
                        )}
                        {bid.status === 'rejected' && (
                          <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                            <i className="fas fa-times-circle mr-1"></i> Not Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contracts Tab */}
        {activeTab === 'contracts' && (
          <FreelancerContracts />
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <ServiceManagement />
        )}
      </div>
    </div>
  );
};

export default FreelancerDashboard;