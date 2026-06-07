import React from 'react';
import { useAuth } from '../context/AuthContext';
import FreelancerDashboard from './FreelancerDashboard';
import ClientDashboard from './ClientDashboard';

const Dashboard = () => {
  const { user, isFreelancer, isClient } = useAuth();

  if (isFreelancer()) {
    return <FreelancerDashboard />;
  }

  if (isClient()) {
    return <ClientDashboard />;
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to your Dashboard!
          </h1>
          <p className="text-gray-600">Role: {user?.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;