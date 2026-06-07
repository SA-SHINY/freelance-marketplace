import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Portfolio = () => {
  const { user, token } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    imageUrl: ''
  });

  // Fetch portfolio on component mount
  useEffect(() => {
    if (token) {
      fetchPortfolio();
    }
  }, [token]);

  const fetchPortfolio = async () => {
    try {
      console.log('Fetching portfolio...');
      const response = await axios.get('http://localhost:5000/api/auth/portfolio', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Portfolio response:', response.data);
      setPortfolio(response.data.portfolio || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      console.error('Error response:', error.response);
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    try {
      if (editingItem) {
        // Update existing portfolio item
        await axios.put(
          `http://localhost:5000/api/auth/portfolio/${editingItem._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Portfolio updated successfully');
      } else {
        // Add new portfolio item
        await axios.post(
          'http://localhost:5000/api/auth/portfolio',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Portfolio item added successfully');
      }
      
      // Reset form and close modal
      setFormData({ title: '', description: '', link: '', imageUrl: '' });
      setEditingItem(null);
      setShowModal(false);
      
      // Refresh portfolio list
      fetchPortfolio();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      link: item.link || '',
      imageUrl: item.imageUrl || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      try {
        await axios.delete(`http://localhost:5000/api/auth/portfolio/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Portfolio item deleted successfully');
        fetchPortfolio();
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to delete portfolio item');
      }
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ title: '', description: '', link: '', imageUrl: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 fade-in">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-2">
                My Portfolio
              </h1>
              <p className="text-gray-600">
                Showcase your best work to attract more clients
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="btn-primary flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              Add Portfolio Item
            </button>
          </div>

          {/* Portfolio Grid */}
          {portfolio.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
              <i className="fas fa-briefcase text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Portfolio Items Yet</h3>
              <p className="text-gray-500 mb-4">Start showcasing your work by adding your first portfolio item.</p>
              <button onClick={openAddModal} className="btn-primary">
                Add Your First Project
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="h-48 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <i className="fas fa-image text-5xl text-gray-400"></i>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {item.description}
                    </p>
                    
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1 mb-4"
                      >
                        <i className="fas fa-external-link-alt"></i>
                        View Project
                      </a>
                    )}
                    
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                      >
                        <i className="fas fa-edit mr-1"></i> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition"
                      >
                        <i className="fas fa-trash mr-1"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="input-field"
                    placeholder="Describe your project, technologies used, your role, etc."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Project URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="https://example.com/project"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Add an image URL to showcase your project
                  </p>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    {editingItem ? 'Update' : 'Add'} Portfolio
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;