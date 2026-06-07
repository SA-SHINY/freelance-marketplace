import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const FindFreelancers = ({ onHireFreelancer }) => {
  const { token } = useAuth();
  const [freelancers, setFreelancers] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    skill: '',
    minRating: 'all',
    search: '',
    location: '',
    minBudget: '',
    maxBudget: ''
  });
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [showHireModal, setShowHireModal] = useState(false);
  const [contractData, setContractData] = useState({
    amount: '',
    startDate: '',
    endDate: '',
    scope: ''
  });

  // Fetch freelancers
  const fetchFreelancers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.skill && filters.skill.trim()) params.append('skill', filters.skill);
      if (filters.minRating && filters.minRating !== 'all') params.append('minRating', filters.minRating);
      if (filters.search && filters.search.trim()) params.append('search', filters.search);
      if (filters.location && filters.location.trim()) params.append('location', filters.location);
      if (filters.minBudget && filters.minBudget.trim()) params.append('minBudget', filters.minBudget);
      if (filters.maxBudget && filters.maxBudget.trim()) params.append('maxBudget', filters.maxBudget);
      
      const response = await axios.get(`http://localhost:5000/api/freelancers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFreelancers(response.data.freelancers || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  }, [filters, token]);

  // Fetch client's projects
  const fetchMyProjects = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects/my-projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchFreelancers();
    fetchMyProjects();
  }, [fetchFreelancers, fetchMyProjects]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      skill: '',
      minRating: 'all',
      search: '',
      location: '',
      minBudget: '',
      maxBudget: ''
    });
  };

  const handleHire = (freelancer) => {
    if (myProjects.length === 0) {
      toast.error('You need to post a project first before hiring a freelancer!');
      return;
    }
    setSelectedFreelancer(freelancer);
    setSelectedProjectId('');
    setShowHireModal(true);
  };

  const handleContractSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }
    
    if (!contractData.amount || !contractData.startDate || !contractData.endDate || !contractData.scope) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const selectedProject = myProjects.find(p => p._id === selectedProjectId);
    
    try {
      await axios.post(
        'http://localhost:5000/api/contracts/create',
        {
          freelancerId: selectedFreelancer._id,
          projectId: selectedProjectId,
          projectTitle: selectedProject.title,
          amount: parseInt(contractData.amount),
          startDate: contractData.startDate,
          endDate: contractData.endDate,
          scope: contractData.scope
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Contract sent to ${selectedFreelancer.name}!`);
      setShowHireModal(false);
      setContractData({ amount: '', description: '', startDate: '', endDate: '', scope: '' });
      setSelectedProjectId('');
      
      if (onHireFreelancer) {
        onHireFreelancer();
      }
    } catch (error) {
      console.error('Contract error:', error);
      toast.error(error.response?.data?.message || 'Error creating contract');
    }
  };

  const renderStars = (rating) => {
    const numRating = rating || 0;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = (numRating % 1) >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="fas fa-star text-yellow-400 text-sm"></i>
        ))}
        {hasHalfStar && <i className="fas fa-star-half-alt text-yellow-400 text-sm"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="far fa-star text-yellow-400 text-sm"></i>
        ))}
        <span className="ml-1 text-xs text-gray-500">({numRating.toFixed(1)})</span>
      </div>
    );
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return value && value.trim();
    if (key === 'location') return value && value.trim();
    if (key === 'skill') return value && value.trim();
    if (key === 'minBudget') return value && value.trim();
    if (key === 'maxBudget') return value && value.trim();
    return value && value !== 'all';
  }).length;

  return (
    <div>
      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                name="search"
                placeholder="Search freelancers by name, skills, or bio..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
          >
            <i className="fas fa-sliders-h"></i>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-red-600 hover:text-red-700 transition"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-map-marker-alt mr-2 text-red-500"></i>Location
              </label>
              <input
                type="text"
                name="location"
                placeholder="City, Country"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400"
              />
            </div>

            {/* Skill Filter - Text Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-code mr-2 text-red-500"></i>Skill
              </label>
              <input
                type="text"
                name="skill"
                placeholder="e.g., React, Python, UI/UX"
                value={filters.skill}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400"
              />
            </div>

            {/* Budget Range Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-dollar-sign mr-2 text-red-500"></i>Budget Range ($/hr)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minBudget"
                  placeholder="Min"
                  value={filters.minBudget}
                  onChange={handleFilterChange}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400"
                />
                <input
                  type="number"
                  name="maxBudget"
                  placeholder="Max"
                  value={filters.maxBudget}
                  onChange={handleFilterChange}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-star mr-2 text-red-500"></i>Min Rating
              </label>
              <select
                name="minRating"
                value={filters.minRating}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-400"
              >
                <option value="all">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          <i className="fas fa-users mr-2 text-red-500"></i>
          Found <span className="font-semibold text-gray-800">{freelancers.length}</span> freelancers
        </p>
      </div>

      {/* Freelancers Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      ) : freelancers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <i className="fas fa-users-slash text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No freelancers found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelancers.map((freelancer) => (
            <div key={freelancer._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {freelancer.name?.charAt(0) || 'F'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{freelancer.name}</h3>
                      {renderStars(freelancer.rating)}
                      <p className="text-xs text-gray-500">{freelancer.totalRatings || 0} reviews</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">${freelancer.hourlyRate || '50'}/hr</div>
                    <div className="text-xs text-gray-500">Hourly Rate</div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {freelancer.bio || 'Experienced professional ready to help with your project'}
                </p>
                
                {freelancer.location && (
                  <p className="text-xs text-gray-500 mb-2">
                    <i className="fas fa-map-marker-alt mr-1"></i> {freelancer.location}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {freelancer.skills?.slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                  {freelancer.skills?.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">+{freelancer.skills.length - 4}</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleHire(freelancer)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition"
                  >
                    <i className="fas fa-user-plus mr-1"></i> Hire Now
                  </button>
                  <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition">
                    <i className="fas fa-comment"></i> Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Hire Modal */}
      {showHireModal && selectedFreelancer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                <i className="fas fa-file-contract text-red-500 mr-2"></i>
                Hire {selectedFreelancer.name}
              </h2>
              <button onClick={() => setShowHireModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleContractSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  <i className="fas fa-briefcase mr-2 text-red-500"></i>Select Project *
                </label>
                <select
                  required
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="input-field"
                >
                  <option value="">-- Select a project --</option>
                  {myProjects.filter(p => p.status === 'open').map(project => (
                    <option key={project._id} value={project._id}>
                      {project.title} - {project.budget}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  <i className="fas fa-dollar-sign mr-2 text-red-500"></i>Contract Amount ($) *
                </label>
                <input
                  type="number"
                  required
                  value={contractData.amount}
                  onChange={(e) => setContractData({ ...contractData, amount: e.target.value })}
                  className="input-field"
                  placeholder="Enter total contract amount"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    <i className="fas fa-calendar-alt mr-2 text-red-500"></i>Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={contractData.startDate}
                    onChange={(e) => setContractData({ ...contractData, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    <i className="fas fa-calendar-check mr-2 text-red-500"></i>End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={contractData.endDate}
                    onChange={(e) => setContractData({ ...contractData, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  <i className="fas fa-tasks mr-2 text-red-500"></i>Project Scope *
                </label>
                <textarea
                  required
                  rows="4"
                  value={contractData.scope}
                  onChange={(e) => setContractData({ ...contractData, scope: e.target.value })}
                  className="input-field"
                  placeholder="Describe the project deliverables, timeline, and expectations..."
                />
              </div>
              
              <div className="flex gap-3">
                <button type="submit" className="flex-1 btn-primary py-3">
                  <i className="fas fa-paper-plane mr-2"></i>Send Contract
                </button>
                <button type="button" onClick={() => setShowHireModal(false)} className="flex-1 btn-secondary py-3">
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

export default FindFreelancers;