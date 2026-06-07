import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const FindJobs = () => {
  const { user, token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);

  // Fetch jobs from API
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/projects/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(response.data.projects);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Categories for filter
  const categories = [
    'all',
    'Web Development',
    'Mobile Development',
    'Design',
    'Backend Development',
    'Frontend Development',
    'CMS Development',
    'Data Science',
    'Marketing',
    'Writing',
    'Video Editing'
  ];

  // Budget ranges
  const budgetRanges = [
    'all',
    'Under $1,000',
    '$1,000 - $2,500',
    '$2,500 - $5,000',
    '$5,000 - $10,000',
    '$10,000+'
  ];

  // Filter jobs based on search, category, and budget
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    
    let matchesBudget = true;
    if (selectedBudget !== 'all' && job.amount) {
      const budgetValue = job.amount;
      if (selectedBudget === 'Under $1,000') matchesBudget = budgetValue < 1000;
      else if (selectedBudget === '$1,000 - $2,500') matchesBudget = budgetValue >= 1000 && budgetValue <= 2500;
      else if (selectedBudget === '$2,500 - $5,000') matchesBudget = budgetValue >= 2500 && budgetValue <= 5000;
      else if (selectedBudget === '$5,000 - $10,000') matchesBudget = budgetValue >= 5000 && budgetValue <= 10000;
      else if (selectedBudget === '$10,000+') matchesBudget = budgetValue > 10000;
    }
    
    return matchesSearch && matchesCategory && matchesBudget;
  });

  const handleApplyJob = (jobTitle) => {
    toast.success(`Application sent for "${jobTitle}"!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Find Jobs
            </h1>
            <p className="text-gray-500 mt-1">Discover opportunities that match your skills</p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search jobs by title, description, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 transition"
                />
              </div>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-tag mr-2 text-red-500"></i>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 transition"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-dollar-sign mr-2 text-red-500"></i>
                  Budget Range
                </label>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 transition"
                >
                  {budgetRanges.map(range => (
                    <option key={range} value={range}>
                      {range === 'all' ? 'All Budgets' : range}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(searchTerm || selectedCategory !== 'all' || selectedBudget !== 'all') && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-md text-sm">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="hover:text-red-800">
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-md text-sm">
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory('all')} className="hover:text-red-800">
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
                {selectedBudget !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-md text-sm">
                    Budget: {selectedBudget}
                    <button onClick={() => setSelectedBudget('all')} className="hover:text-red-800">
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              <i className="fas fa-briefcase mr-2 text-red-500"></i>
              Found <span className="font-semibold text-gray-800">{filteredJobs.length}</span> jobs
            </p>
          </div>

          {/* Jobs Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredJobs.map(job => (
                <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className="p-6">
                    {/* Job Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                          {job.isUrgent && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                              <i className="fas fa-exclamation-circle mr-1"></i>Urgent
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span>
                            <i className="fas fa-building mr-1 text-red-500"></i>
                            {job.clientName}
                          </span>
                          <span>
                            <i className="fas fa-calendar mr-1 text-red-500"></i>
                            Posted: {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            <i className="fas fa-users mr-1 text-red-500"></i>
                            {job.proposals?.length || 0} proposals
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">${job.amount?.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Budget</div>
                      </div>
                    </div>

                    {/* Job Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {job.skills.slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Job Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          <i className="fas fa-clock mr-1 text-red-500"></i>
                          Duration: {job.duration}
                        </span>
                        <span className="text-sm text-gray-500">
                          <i className="fas fa-tag mr-1 text-red-500"></i>
                          {job.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleApplyJob(job.title)}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                      >
                        <i className="fas fa-paper-plane mr-2"></i>
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No jobs found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindJobs;