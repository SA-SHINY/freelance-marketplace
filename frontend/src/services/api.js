import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Freelancer specific APIs
export const freelancerAPI = {
  getAvailableProjects: () => api.get('/projects/available'),
  placeBid: (projectId, bidData) => api.post(`/projects/${projectId}/bid`, bidData),
  getMyBids: () => api.get('/freelancer/bids'),
};

// Client specific APIs
export const clientAPI = {
  postProject: (projectData) => api.post('/projects', projectData),
  getMyProjects: () => api.get('/client/projects'),
  getBidsForProject: (projectId) => api.get(`/projects/${projectId}/bids`),
  acceptBid: (bidId) => api.put(`/bids/${bidId}/accept`),
};

export default api;