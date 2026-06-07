import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import PostProjectModal from '../components/PostProjectModal';
import FindFreelancers from '../components/FindFreelancers';

const ClientDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('myProjects');
  const [showPostModal, setShowPostModal] = useState(false);
  const [myProjects, setMyProjects] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contractsLoading, setContractsLoading] = useState(true);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [stats, setStats] = useState({
    totalProjects: 0,
    openProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0
  });

  // Function to get display budget
  const getDisplayBudget = (project) => {
    if (project.budget) {
      return project.budget;
    }
    return 'Budget not specified';
  };

  // Fetch client's projects - ONLY ONE FUNCTION
  const fetchMyProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects/my-projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Projects fetched:', response.data.projects.length);
      setMyProjects(response.data.projects);
      
      const total = response.data.projects.length;
      const open = response.data.projects.filter(p => p.status === 'open').length;
      const inProgress = response.data.projects.filter(p => p.status === 'in-progress').length;
      const completed = response.data.projects.filter(p => p.status === 'completed').length;
      
      setStats({ totalProjects: total, openProjects: open, inProgressProjects: inProgress, completedProjects: completed });
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contracts
  const fetchContracts = async () => {
    setContractsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/contracts/client', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContracts(response.data.contracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setContractsLoading(false);
    }
  };

  // Fetch proposals (bids received)
  const fetchProposals = async () => {
    setProposalsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/projects/my-proposals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProposals(response.data.proposals || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setProposalsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
    fetchContracts();
    fetchProposals();
  }, []);

  const handleProjectPosted = (newProject) => {
    setMyProjects(prev => [newProject, ...prev]);
    setStats(prev => ({
      ...prev,
      totalProjects: prev.totalProjects + 1,
      openProjects: prev.openProjects + 1
    }));
  };

  const handleUpdateStatus = async (projectId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/projects/${projectId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMyProjects(prev => prev.map(project => 
        project._id === projectId ? { ...project, status: newStatus } : project
      ));
      
      setStats(prev => {
        const oldStatus = myProjects.find(p => p._id === projectId)?.status;
        const newStats = { ...prev };
        if (oldStatus === 'open') newStats.openProjects--;
        if (oldStatus === 'in-progress') newStats.inProgressProjects--;
        if (oldStatus === 'completed') newStats.completedProjects--;
        if (newStatus === 'open') newStats.openProjects++;
        if (newStatus === 'in-progress') newStats.inProgressProjects++;
        if (newStatus === 'completed') newStats.completedProjects++;
        return newStats;
      });
      
      toast.success(`Project marked as ${newStatus}`);
    } catch (error) {
      toast.error('Error updating project status');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const deletedProject = myProjects.find(p => p._id === projectId);
        setMyProjects(prev => prev.filter(project => project._id !== projectId));
        
        setStats(prev => ({
          ...prev,
          totalProjects: prev.totalProjects - 1,
          openProjects: deletedProject?.status === 'open' ? prev.openProjects - 1 : prev.openProjects,
          inProgressProjects: deletedProject?.status === 'in-progress' ? prev.inProgressProjects - 1 : prev.inProgressProjects,
          completedProjects: deletedProject?.status === 'completed' ? prev.completedProjects - 1 : prev.completedProjects
        }));
        
        toast.success('Project deleted successfully');
      } catch (error) {
        toast.error('Error deleting project');
      }
    }
  };

  const handleAcceptBid = async (proposal) => {
    if (window.confirm(`Accept ${proposal.freelancerName}'s bid of $${proposal.bidAmount}?`)) {
      try {
        await axios.post(
          `http://localhost:5000/api/projects/accept-bid/${proposal._id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Bid accepted! You can now create a contract.');
        fetchProposals();
        fetchMyProjects();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error accepting bid');
      }
    }
  };

  const handleRejectBid = async (proposal) => {
    if (window.confirm(`Reject ${proposal.freelancerName}'s bid?`)) {
      try {
        setProposals(prev => prev.map(p => 
          p._id === proposal._id ? { ...p, status: 'rejected' } : p
        ));
        toast.info('Bid rejected');
      } catch (error) {
        toast.error('Error rejecting bid');
      }
    }
  };

  const handleViewContract = (contract) => {
    setSelectedContract(contract);
    setShowContractModal(true);
  };

  const handleSendMessage = async (contractId) => {
    if (!newMessage.trim()) return;
    
    try {
      await axios.post(
        `http://localhost:5000/api/contracts/${contractId}/message`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchContracts();
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      toast.error('Error sending message');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'terminated': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'open': return 'Open for Bids';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'pending': return 'Pending Freelancer Approval';
      case 'active': return 'Active';
      case 'terminated': return 'Terminated';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 fade-in">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-2">
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-gray-600">
                  Manage your projects, find freelancers, and track contracts
                </p>
                <div className="mt-4">
                  <span className="badge-red">
                    <i className="fas fa-building mr-1"></i> Client
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPostModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <i className="fas fa-plus"></i>
                Post New Project
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalProjects}</p>
                </div>
                <i className="fas fa-briefcase text-3xl text-blue-500"></i>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Open Projects</p>
                  <p className="text-2xl font-bold text-green-600">{stats.openProjects}</p>
                </div>
                <i className="fas fa-play-circle text-3xl text-green-500"></i>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inProgressProjects}</p>
                </div>
                <i className="fas fa-spinner text-3xl text-yellow-500"></i>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.completedProjects}</p>
                </div>
                <i className="fas fa-check-circle text-3xl text-purple-500"></i>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('myProjects')}
              className={`px-6 py-2 font-semibold transition-all duration-300 rounded-t-lg whitespace-nowrap ${
                activeTab === 'myProjects'
                  ? 'text-red-600 border-b-2 border-red-500 bg-gray-50/50'
                  : 'text-gray-500 hover:text-red-500 hover:bg-gray-50/30'
              }`}
            >
              <i className="fas fa-folder-open mr-2"></i>
              My Projects
            </button>
            <button
              onClick={() => setActiveTab('proposals')}
              className={`px-6 py-2 font-semibold transition-all duration-300 rounded-t-lg whitespace-nowrap ${
                activeTab === 'proposals'
                  ? 'text-red-600 border-b-2 border-red-500 bg-gray-50/50'
                  : 'text-gray-500 hover:text-red-500 hover:bg-gray-50/30'
              }`}
            >
              <i className="fas fa-file-alt mr-2"></i>
              Proposals Received ({proposals.length})
            </button>
            <button
              onClick={() => setActiveTab('findFreelancers')}
              className={`px-6 py-2 font-semibold transition-all duration-300 rounded-t-lg whitespace-nowrap ${
                activeTab === 'findFreelancers'
                  ? 'text-red-600 border-b-2 border-red-500 bg-gray-50/50'
                  : 'text-gray-500 hover:text-red-500 hover:bg-gray-50/30'
              }`}
            >
              <i className="fas fa-users mr-2"></i>
              Find Freelancers
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
          </div>

          {/* My Projects Tab */}
          {activeTab === 'myProjects' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  <i className="fas fa-folder-open mr-2 text-red-500"></i>
                  My Projects
                </h2>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                </div>
              ) : myProjects.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Yet</h3>
                  <p className="text-gray-500 mb-4">Post your first project to get started</p>
                  <button onClick={() => setShowPostModal(true)} className="btn-primary">
                    <i className="fas fa-plus mr-2"></i>Post a Project
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {myProjects.map(project => (
                    <div key={project._id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-800">{project.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                              {getStatusText(project.status)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm mb-3">
                            <span className="text-gray-500">
                              <i className="fas fa-tag mr-1 text-red-500"></i>
                              {project.category}
                            </span>
                            <span className="text-gray-500">
                              <i className="fas fa-dollar-sign mr-1 text-red-500"></i>
                              {getDisplayBudget(project)}
                            </span>
                            <span className="text-gray-500">
                              <i className="fas fa-clock mr-1 text-red-500"></i>
                              {project.duration}
                            </span>
                            <span className="text-gray-500">
                              <i className="fas fa-calendar mr-1 text-red-500"></i>
                              Posted: {new Date(project.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {project.skills && project.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {project.skills.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">{skill}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          {project.status === 'open' && (
                            <>
                              <button onClick={() => handleUpdateStatus(project._id, 'in-progress')} className="btn-primary text-sm px-3 py-1">Start Project</button>
                              <button onClick={() => handleDeleteProject(project._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Delete</button>
                            </>
                          )}
                          {project.status === 'in-progress' && (
                            <>
                              <button onClick={() => handleUpdateStatus(project._id, 'completed')} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Complete</button>
                              <button onClick={() => handleDeleteProject(project._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Delete</button>
                            </>
                          )}
                          {project.status === 'completed' && (
                            <span className="text-green-600 text-sm text-center">✓ Completed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Proposals Received Tab */}
          {activeTab === 'proposals' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  <i className="fas fa-file-alt mr-2 text-red-500"></i>
                  Proposals Received ({proposals.length})
                </h2>
                <p className="text-sm text-gray-500 mt-1">Freelancers who have bid on your projects</p>
              </div>
              
              {proposalsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
              ) : proposals.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No proposals received yet</p>
                  <p className="text-gray-400 text-sm mt-2">When freelancers bid on your projects, they will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {proposals.map(proposal => (
                    <div key={proposal._id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-800">{proposal.projectTitle}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              proposal.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {proposal.status === 'pending' ? 'Pending' : proposal.status === 'accepted' ? 'Accepted' : 'Rejected'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            <i className="fas fa-user mr-1 text-red-500"></i> Freelancer: {proposal.freelancerName}
                          </p>
                          <p className="text-gray-600 text-sm mb-2">
                            <i className="fas fa-dollar-sign mr-1 text-red-500"></i> Bid Amount: ${proposal.bidAmount?.toLocaleString()}
                          </p>
                          <p className="text-gray-500 text-xs mb-2">
                            <i className="fas fa-clock mr-1"></i> Submitted: {new Date(proposal.submittedAt).toLocaleString()}
                          </p>
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Cover Letter:</p>
                            <p className="text-sm text-gray-600">{proposal.coverLetter}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          {proposal.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAcceptBid(proposal)}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
                              >
                                <i className="fas fa-check mr-1"></i> Accept Bid
                              </button>
                              <button
                                onClick={() => handleRejectBid(proposal)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                              >
                                <i className="fas fa-times mr-1"></i> Reject
                              </button>
                            </>
                          )}
                          {proposal.status === 'accepted' && (
                            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm text-center">
                              <i className="fas fa-check-circle mr-1"></i> Accepted
                            </span>
                          )}
                          {proposal.status === 'rejected' && (
                            <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm text-center">
                              <i className="fas fa-times-circle mr-1"></i> Rejected
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

          {/* Find Freelancers Tab */}
          {activeTab === 'findFreelancers' && (
            <FindFreelancers onHireFreelancer={() => {
              toast.success('Contract sent to freelancer!');
              fetchContracts();
            }} />
          )}

          {/* Contracts Tab */}
          {activeTab === 'contracts' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  <i className="fas fa-file-contract mr-2 text-red-500"></i>
                  My Contracts ({contracts.length})
                </h2>
                <p className="text-sm text-gray-500 mt-1">Freelancers will accept or reject contracts</p>
              </div>
              
              {contractsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                </div>
              ) : contracts.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-file-contract text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No contracts yet</p>
                  <p className="text-gray-400 text-sm mt-2">Go to "Find Freelancers" to hire someone</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {contracts.map(contract => (
                    <div key={contract._id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-800">{contract.projectTitle}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(contract.status)}`}>
                              {getStatusText(contract.status)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            <i className="fas fa-user mr-1 text-red-500"></i> Freelancer: {contract.freelancerName}
                          </p>
                          <p className="text-gray-600 text-sm mb-2">
                            <i className="fas fa-dollar-sign mr-1 text-red-500"></i> Amount: ${contract.amount}
                          </p>
                          <p className="text-gray-500 text-sm">
                            <i className="fas fa-calendar mr-1"></i> Timeline: {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{contract.scope?.substring(0, 100)}...</p>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={() => handleViewContract(contract)}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                          >
                            <i className="fas fa-eye mr-1"></i> View & Message
                          </button>
                          {contract.status === 'completed' && (
                            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm text-center">
                              <i className="fas fa-check-circle mr-1"></i> Completed
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
        </div>
      </div>

      {/* Post Project Modal */}
      <PostProjectModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onProjectPosted={handleProjectPosted}
        token={token}
      />

      {/* Contract Details Modal */}
      {showContractModal && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                <i className="fas fa-file-contract text-red-500 mr-2"></i>
                Contract Details
              </h2>
              <button onClick={() => setShowContractModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{selectedContract.projectTitle}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Freelancer:</span> <p className="font-medium">{selectedContract.freelancerName}</p></div>
                  <div><span className="text-gray-500">Amount:</span> <p className="font-medium text-green-600">${selectedContract.amount}</p></div>
                  <div><span className="text-gray-500">Start Date:</span> <p>{new Date(selectedContract.startDate).toLocaleDateString()}</p></div>
                  <div><span className="text-gray-500">End Date:</span> <p>{new Date(selectedContract.endDate).toLocaleDateString()}</p></div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Scope of Work</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{selectedContract.scope}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Messages</h4>
                <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-3">
                  {selectedContract.messages && selectedContract.messages.length > 0 ? (
                    selectedContract.messages.map((msg, idx) => (
                      <div key={idx} className={`mb-3 ${msg.senderId === user?._id ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block max-w-[70%] p-3 rounded-lg ${msg.senderId === user?._id ? 'bg-red-500 text-white' : 'bg-white border border-gray-200'}`}>
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No messages yet</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(selectedContract._id)}
                    placeholder="Type your message..."
                    className="input-field flex-1"
                  />
                  <button onClick={() => handleSendMessage(selectedContract._id)} className="btn-primary px-4">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;