import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const FreelancerContracts = () => {
  const { user, token } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/contracts/freelancer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContracts(response.data.contracts);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  // Accept Contract
  const handleAcceptContract = async (contractId) => {
    if (window.confirm('Do you want to accept this contract?')) {
      try {
        await axios.put(
          `http://localhost:5000/api/contracts/${contractId}/accept`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Contract accepted!');
        fetchContracts();
        setShowModal(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error accepting contract');
      }
    }
  };

  // Reject Contract
  const handleRejectContract = async (contractId) => {
    if (window.confirm('Are you sure you want to reject this contract?')) {
      try {
        await axios.put(
          `http://localhost:5000/api/contracts/${contractId}/reject`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Contract rejected');
        fetchContracts();
        setShowModal(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error rejecting contract');
      }
    }
  };

  // Mark as Completed
  const handleCompleteContract = async (contractId) => {
    if (window.confirm('Mark this project as completed?')) {
      try {
        await axios.put(
          `http://localhost:5000/api/contracts/${contractId}/complete`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Project marked as completed!');
        fetchContracts();
        setShowModal(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error completing contract');
      }
    }
  };

  // Send Message
  const handleSendMessage = async (contractId) => {
    if (!newMessage.trim()) return;
    try {
      await axios.post(
        `http://localhost:5000/api/contracts/${contractId}/message`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Message sent');
      setNewMessage('');
      fetchContracts();
    } catch (error) {
      toast.error('Error sending message');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Pending</span>;
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Completed</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        <i className="fas fa-file-contract mr-2 text-red-500"></i>
        My Contracts ({contracts.length})
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border">
          <i className="fas fa-file-contract text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No contracts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map(contract => (
            <div key={contract._id} className="bg-white rounded-xl border p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                {/* Left side - Contract Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-800">{contract.projectTitle}</h3>
                    {getStatusBadge(contract.status)}
                  </div>
                  <p className="text-gray-600 text-sm mb-1">
                    <i className="fas fa-user mr-1 text-red-500"></i> Client: {contract.clientName}
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    <i className="fas fa-dollar-sign mr-1 text-red-500"></i> Amount: ${contract.amount}
                  </p>
                  <p className="text-gray-500 text-sm">
                    <i className="fas fa-calendar mr-1"></i> From: {new Date(contract.startDate).toLocaleDateString()} - To: {new Date(contract.endDate).toLocaleDateString()}
                  </p>
                </div>

                {/* Right side - Action Buttons */}
                <div className="flex flex-col gap-2 ml-4 min-w-[120px]">
                  <button
                    onClick={() => {
                      setSelectedContract(contract);
                      setShowModal(true);
                    }}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                  >
                    <i className="fas fa-eye mr-1"></i> View Details
                  </button>

                  {contract.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptContract(contract._id)}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                      >
                        <i className="fas fa-check mr-1"></i> Accept
                      </button>
                      <button
                        onClick={() => handleRejectContract(contract._id)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                      >
                        <i className="fas fa-times mr-1"></i> Reject
                      </button>
                    </>
                  )}

                  {contract.status === 'active' && (
                    <button
                      onClick={() => handleCompleteContract(contract._id)}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                    >
                      <i className="fas fa-check-double mr-1"></i> Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contract Details Modal */}
      {showModal && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                <i className="fas fa-file-contract text-red-500 mr-2"></i>
                Contract Details
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Basic Info */}
              <div className="mb-6 bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-lg mb-3">Contract Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Project Title</p>
                    <p className="font-semibold">{selectedContract.projectTitle}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Amount</p>
                    <p className="font-semibold text-green-600">${selectedContract.amount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Client</p>
                    <p className="font-semibold">{selectedContract.clientName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Description</p>
                    <p className="font-semibold">{selectedContract.description}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    {getStatusBadge(selectedContract.status)}
                  </div>
                  <div>
                    <p className="text-gray-500">Start Date</p>
                    <p>{new Date(selectedContract.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">End Date</p>
                    <p>{new Date(selectedContract.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Scope of Work */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Scope of Work</h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedContract.scope}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Messages</h4>
                <div className="bg-gray-50 rounded-xl p-4 h-64 overflow-y-auto mb-3">
                  {selectedContract.messages && selectedContract.messages.length > 0 ? (
                    selectedContract.messages.map((msg, idx) => (
                      <div key={idx} className={`mb-3 flex ${msg.senderId === user?._id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-lg ${
                          msg.senderId === user?._id 
                            ? 'bg-red-500 text-white rounded-br-none' 
                            : 'bg-white border border-gray-200 rounded-bl-none'
                        }`}>
                          <p className="text-xs opacity-80 mb-1">{msg.senderName}</p>
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No messages yet</p>
                  )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(selectedContract._id)}
                    placeholder="Type your message..."
                    className="input-field flex-1"
                  />
                  <button
                    onClick={() => handleSendMessage(selectedContract._id)}
                    className="btn-primary px-4"
                  >
                    <i className="fas fa-paper-plane"></i> Send
                  </button>
                </div>
              </div>

              {/* Action Buttons in Modal */}
              {selectedContract.status === 'pending' && (
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleAcceptContract(selectedContract._id)}
                    className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 font-semibold"
                  >
                    <i className="fas fa-check mr-2"></i> Accept Contract
                  </button>
                  <button
                    onClick={() => handleRejectContract(selectedContract._id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 font-semibold"
                  >
                    <i className="fas fa-times mr-2"></i> Reject Contract
                  </button>
                </div>
              )}

              {selectedContract.status === 'active' && (
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleCompleteContract(selectedContract._id)}
                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 font-semibold"
                  >
                    <i className="fas fa-check-double mr-2"></i> Mark as Completed
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerContracts;