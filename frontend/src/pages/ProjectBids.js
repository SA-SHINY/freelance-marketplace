import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProjectBids = () => {
  const { projectId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(response.data.project);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
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
        toast.success('Bid accepted!');
        fetchProject();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error accepting bid');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="mb-4 text-gray-600 hover:text-red-500">
            ← Back
          </button>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-2xl font-bold">{project?.title}</h1>
            <p className="text-gray-600 mt-2">{project?.description}</p>
            <p className="text-green-600 font-bold mt-2">Budget: ${project?.amount}</p>
          </div>

          <h2 className="text-xl font-bold mb-4">Bids Received ({project?.proposals?.length || 0})</h2>
          
          {project?.proposals?.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-500">No bids received yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {project?.proposals?.map(proposal => (
                <div key={proposal._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{proposal.freelancerName}</h3>
                      <p className="text-2xl text-green-600 font-bold mt-1">${proposal.bidAmount}</p>
                      <p className="text-gray-600 mt-2">{proposal.coverLetter}</p>
                      <p className="text-gray-400 text-sm mt-2">Submitted: {new Date(proposal.submittedAt).toLocaleString()}</p>
                    </div>
                    {proposal.status === 'pending' && (
                      <button
                        onClick={() => handleAcceptBid(proposal)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Accept Bid
                      </button>
                    )}
                    {proposal.status === 'accepted' && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">Accepted</span>
                    )}
                    {proposal.status === 'rejected' && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">Rejected</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectBids;