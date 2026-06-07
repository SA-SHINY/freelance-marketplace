import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Navbar = () => {
  const { user, logout, isAuthenticated, isFreelancer, isClient } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Define handleLogout function
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = async (notification) => {
    await handleMarkAsRead(notification._id);
    
    if (notification.relatedType === 'project' && notification.relatedId) {
      if (notification.type === 'new_bid') {
        navigate(`/projects/${notification.relatedId}/bids`);
      } else {
        navigate(`/projects/${notification.relatedId}`);
      }
    } else if (notification.relatedType === 'contract' && notification.relatedId) {
      navigate(`/contracts/${notification.relatedId}`);
    }
    
    setShowNotifications(false);
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'bid_accepted': return '✅';
      case 'bid_rejected': return '❌';
      case 'new_bid': return '💰';
      case 'project_completed': return '🎉';
      case 'contract_sent': return '📄';
      case 'contract_accepted': return '✓';
      case 'new_message': return '💬';
      default: return '🔔';
    }
  };

  const getNotificationBgColor = (notif) => {
    if (!notif.read) return 'bg-red-50 hover:bg-red-100';
    return 'hover:bg-gray-50';
  };

  return (
    <nav className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent hover:text-red-500 transition" style={{ marginRight: '200px' }}>
            FreelanceMarket
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative text-gray-500 hover:text-red-500 transition"
                    >
                      <i className="fas fa-bell text-xl"></i>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                          <h3 className="font-semibold text-gray-800">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="text-xs text-red-500 hover:text-red-600">
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">No notifications</div>
                          ) : (
                            notifications.map(notif => (
                              <div 
                                key={notif._id} 
                                className={`p-3 cursor-pointer transition border-b border-gray-100 ${getNotificationBgColor(notif)}`}
                                onClick={() => handleNotificationClick(notif)}
                              >
                                <div className="flex items-start gap-2">
                                  <span className="text-xl">{getNotificationIcon(notif.type)}</span>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                                    <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center space-x-2 focus:outline-none group">
                    <i className="fas fa-user-circle text-2xl text-gray-500 group-hover:text-red-500 transition"></i>
                    <span className="hidden md:inline text-gray-700 group-hover:text-gray-900 transition">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span className={`hidden md:inline px-2 py-1 rounded text-sm transition ${
                      isFreelancer() 
                        ? 'bg-red-50 text-red-600 border border-red-200 group-hover:bg-red-100'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 group-hover:bg-gray-200'
                    }`}>
                      {user?.role}
                    </span>
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-200">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-500 transition" onClick={() => setShowDropdown(false)}>
                        <i className="fas fa-user mr-2"></i> Profile Settings
                      </Link>
                      {isFreelancer() && (
                        <Link to="/portfolio" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-500 transition" onClick={() => setShowDropdown(false)}>
                          <i className="fas fa-briefcase mr-2"></i> My Portfolio
                        </Link>
                      )}
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-500 transition" onClick={() => setShowDropdown(false)}>
                        <i className="fas fa-tachometer-alt mr-2"></i> Dashboard
                      </Link>
                      <hr className="my-1 border-gray-200" />
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 hover:text-red-700 transition">
                        <i className="fas fa-sign-out-alt mr-2"></i> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-red-500 transition">
                  <i className="fas fa-sign-in-alt mr-1"></i> Login
                </Link>
                <Link to="/register" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-md hover:shadow-red-500/20">
                  <i className="fas fa-user-plus mr-1"></i> Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;