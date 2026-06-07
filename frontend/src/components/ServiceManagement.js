import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ServiceManagement = () => {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showWorkSampleModal, setShowWorkSampleModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showSamplesList, setShowSamplesList] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    price: '',
    priceType: 'hourly',
    deliveryTime: '3-7 days',
    skills: '',
    availability: 'Available now'
  });
  const [workSample, setWorkSample] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: ''
  });

  const categories = [
    'Web Development', 'Mobile Development', 'Design', 'Writing', 'Marketing',
    'Video Editing', 'Data Science', 'AI/ML', 'Cybersecurity', 'Cloud Services',
    'IT Support', 'Consulting', 'Other'
  ];

  const priceTypes = ['hourly', 'fixed', 'monthly'];
  const deliveryTimes = ['Less than 1 day', '1-3 days', '3-7 days', '1-2 weeks', '2-4 weeks', '1+ month'];
  const availabilityOptions = ['Full-time', 'Part-time', 'Available now', 'Busy', 'On leave'];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/services/my-services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()) : [];
    
    const serviceData = {
      ...formData,
      skills: skillsArray,
      price: parseFloat(formData.price)
    };
    
    try {
      if (editingService) {
        await axios.put(`http://localhost:5000/api/services/${editingService._id}`, serviceData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Service updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/services/create', serviceData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Service created successfully');
      }
      
      setShowModal(false);
      setEditingService(null);
      setFormData({
        title: '',
        description: '',
        category: 'Web Development',
        price: '',
        priceType: 'hourly',
        deliveryTime: '3-7 days',
        skills: '',
        availability: 'Available now'
      });
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`http://localhost:5000/api/services/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Service deleted successfully');
        fetchServices();
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      priceType: service.priceType,
      deliveryTime: service.deliveryTime,
      skills: service.skills?.join(', ') || '',
      availability: service.availability
    });
    setShowModal(true);
  };

  const handleAddWorkSample = async (e) => {
    e.preventDefault();
    if (!workSample.title) {
      toast.error('Please enter a title for the work sample');
      return;
    }
    
    try {
      await axios.post(
        `http://localhost:5000/api/services/${selectedService._id}/work-sample`,
        workSample,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Work sample added successfully');
      setShowWorkSampleModal(false);
      setWorkSample({ title: '', description: '', imageUrl: '', link: '' });
      fetchServices();
    } catch (error) {
      toast.error('Failed to add work sample');
    }
  };

  const handleDeleteWorkSample = async (serviceId, sampleId) => {
    if (window.confirm('Are you sure you want to delete this work sample?')) {
      try {
        await axios.delete(`http://localhost:5000/api/services/${serviceId}/work-sample/${sampleId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Work sample deleted');
        fetchServices();
      } catch (error) {
        toast.error('Failed to delete work sample');
      }
    }
  };

  const getAvailabilityColor = (availability) => {
    switch(availability) {
      case 'Available now': return 'bg-green-100 text-green-700';
      case 'Full-time': return 'bg-blue-100 text-blue-700';
      case 'Part-time': return 'bg-yellow-100 text-yellow-700';
      case 'Busy': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">My Services</h2>
          <p className="text-gray-500 text-sm">Manage your service listings</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setFormData({
              title: '',
              description: '',
              category: 'Web Development',
              price: '',
              priceType: 'hourly',
              deliveryTime: '3-7 days',
              skills: '',
              availability: 'Available now'
            });
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Add New Service
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border">
          <i className="fas fa-briefcase text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No services added yet</p>
          <p className="text-gray-400 text-sm mt-2">Click "Add New Service" to create your first service</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map(service => (
            <div key={service._id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{service.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getAvailabilityColor(service.availability)}`}>
                      {service.availability}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-2xl font-bold text-red-600">${service.price}</span>
                    <span className="text-gray-500 text-sm">/{service.priceType}</span>
                    <span className="text-gray-500 text-sm">⏱️ {service.deliveryTime}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {service.skills?.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">{skill}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">Category: {service.category}</p>
                  
                  {service.workSamples && service.workSamples.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-semibold text-gray-600 mb-2">
                        📷 Work Samples ({service.workSamples.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {service.workSamples.slice(0, 2).map((sample, idx) => (
                          <div key={idx} className="bg-gray-50 rounded p-2 text-xs">
                            <p className="font-medium">{sample.title}</p>
                            {sample.description && <p className="text-gray-500 text-xs">{sample.description.substring(0, 50)}</p>}
                          </div>
                        ))}
                        {service.workSamples.length > 2 && (
                          <span className="text-xs text-gray-400">+{service.workSamples.length - 2} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedService(service);
                      setShowWorkSampleModal(true);
                    }}
                    className="btn-primary text-sm px-3 py-1.5"
                  >
                    <i className="fas fa-image mr-1"></i> Add Sample
                  </button>
                  <button
                    onClick={() => {
                      setSelectedService(service);
                      setShowSamplesList(true);
                    }}
                    className="btn-secondary text-sm px-3 py-1.5"
                  >
                    <i className="fas fa-eye mr-1"></i> View Samples
                  </button>
                  <button
                    onClick={() => handleEdit(service)}
                    className="btn-secondary text-sm px-3 py-1.5"
                  >
                    <i className="fas fa-edit mr-1"></i> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition"
                  >
                    <i className="fas fa-trash mr-1"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between">
              <h2 className="text-xl font-bold">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block font-semibold mb-2">Service Title *</label>
                <input type="text" name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="input-field" />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-2">Description *</label>
                <textarea rows="4" name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-semibold mb-2">Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="input-field">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-2">Price *</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required className="input-field" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-semibold mb-2">Price Type *</label>
                  <select value={formData.priceType} onChange={(e) => setFormData({...formData, priceType: e.target.value})} className="input-field">
                    {priceTypes.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-2">Delivery Time *</label>
                  <select value={formData.deliveryTime} onChange={(e) => setFormData({...formData, deliveryTime: e.target.value})} className="input-field">
                    {deliveryTimes.map(time => <option key={time} value={time}>{time}</option>)}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-2">Skills (comma separated)</label>
                <input type="text" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} className="input-field" placeholder="React, Node.js, MongoDB" />
              </div>
              <div className="mb-6">
                <label className="block font-semibold mb-2">Availability *</label>
                <select value={formData.availability} onChange={(e) => setFormData({...formData, availability: e.target.value})} className="input-field">
                  {availabilityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 btn-primary py-2">{editingService ? 'Update' : 'Create'} Service</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary py-2">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Work Sample Modal */}
      {showWorkSampleModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-4 border-b flex justify-between">
              <h2 className="text-xl font-bold">Add Work Sample - {selectedService.title}</h2>
              <button onClick={() => setShowWorkSampleModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleAddWorkSample} className="p-4">
              <div className="mb-3">
                <label className="block font-semibold mb-1">Title *</label>
                <input type="text" className="input-field" value={workSample.title} onChange={(e) => setWorkSample({...workSample, title: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="block font-semibold mb-1">Description</label>
                <textarea className="input-field" rows="2" value={workSample.description} onChange={(e) => setWorkSample({...workSample, description: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="block font-semibold mb-1">Image URL</label>
                <input type="url" className="input-field" placeholder="https://example.com/image.jpg" value={workSample.imageUrl} onChange={(e) => setWorkSample({...workSample, imageUrl: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Project Link</label>
                <input type="url" className="input-field" placeholder="https://example.com/project" value={workSample.link} onChange={(e) => setWorkSample({...workSample, link: e.target.value})} />
              </div>
              <button type="submit" className="w-full btn-primary py-2">Add Sample</button>
            </form>
          </div>
        </div>
      )}

      {/* View Samples Modal */}
      {showSamplesList && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between">
              <h2 className="text-xl font-bold">Work Samples - {selectedService.title}</h2>
              <button onClick={() => setShowSamplesList(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-4">
              {selectedService.workSamples && selectedService.workSamples.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedService.workSamples.map((sample, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      {sample.imageUrl && (
                        <img src={sample.imageUrl} alt={sample.title} className="w-full h-40 object-cover rounded mb-3" />
                      )}
                      <h3 className="font-semibold text-lg">{sample.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{sample.description}</p>
                      {sample.link && (
                        <a href={sample.link} target="_blank" rel="noopener noreferrer" className="text-red-500 text-sm mt-2 inline-block hover:underline">
                          View Project →
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteWorkSample(selectedService._id, sample._id)}
                        className="mt-3 text-red-600 text-sm hover:text-red-700"
                      >
                        <i className="fas fa-trash mr-1"></i> Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No work samples added yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;