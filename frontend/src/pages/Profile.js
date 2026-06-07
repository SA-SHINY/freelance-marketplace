import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [myProjects, setMyProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    phoneNumber: '',
    location: '',
    email: '',
    role: '',
    skills: [],
    hourlyRate: '',
    experience: '',
    companyName: '',
    companyWebsite: '',
    companySize: '',
    industry: '',
    budgetRange: '',
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      facebook: '',
      instagram: '',
      portfolio: ''
    }
  });

  // Fetch user's projects (for clients)
  const fetchMyProjects = async () => {
    if (user?.role === 'client') {
      try {
        const response = await axios.get('http://localhost:5000/api/projects/my-projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyProjects(response.data.projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    } else {
      setProjectsLoading(false);
    }
  };

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        bio: user.bio || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        email: user.email || '',
        role: user.role || '',
        skills: user.skills || [],
        hourlyRate: user.hourlyRate || '',
        experience: user.experience || '',
        companyName: user.companyName || '',
        companyWebsite: user.companyWebsite || '',
        companySize: user.companySize || '',
        industry: user.industry || '',
        budgetRange: user.budgetRange || '',
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || '',
          github: user.socialLinks?.github || '',
          twitter: user.socialLinks?.twitter || '',
          facebook: user.socialLinks?.facebook || '',
          instagram: user.socialLinks?.instagram || '',
          portfolio: user.socialLinks?.portfolio || ''
        }
      });
    }
    fetchMyProjects();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(
        'http://localhost:5000/api/auth/profile',
        profileData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setProfileData({
        name: user.name || '',
        bio: user.bio || '',
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        email: user.email || '',
        role: user.role || '',
        skills: user.skills || [],
        hourlyRate: user.hourlyRate || '',
        experience: user.experience || '',
        companyName: user.companyName || '',
        companyWebsite: user.companyWebsite || '',
        companySize: user.companySize || '',
        industry: user.industry || '',
        budgetRange: user.budgetRange || '',
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || '',
          github: user.socialLinks?.github || '',
          twitter: user.socialLinks?.twitter || '',
          facebook: user.socialLinks?.facebook || '',
          instagram: user.socialLinks?.instagram || '',
          portfolio: user.socialLinks?.portfolio || ''
        }
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      await axios.put(
        'http://localhost:5000/api/auth/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmNewPassword: passwordData.confirmNewPassword
        },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      toast.success('Password changed successfully! Please login again.');
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      
    } catch (error) {
      console.error('Password change error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error changing password';
      toast.error(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const openSocialLink = (url) => {
    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
    }
  };

  const stats = user?.role === 'freelancer' 
    ? [
        { label: 'Projects Completed', value: '12', icon: 'fas fa-check-circle', color: 'text-green-500' },
        { label: 'Hours Worked', value: '847', icon: 'fas fa-clock', color: 'text-blue-500' },
        { label: 'Client Rating', value: '4.9 ⭐', icon: 'fas fa-star', color: 'text-yellow-500' },
        { label: 'Earnings', value: '$24,500', icon: 'fas fa-dollar-sign', color: 'text-green-500' }
      ]
    : [
        { label: 'Projects Posted', value: myProjects.length.toString(), icon: 'fas fa-briefcase', color: 'text-blue-500' },
        { label: 'Active Projects', value: myProjects.filter(p => p.status === 'open').length.toString(), icon: 'fas fa-play-circle', color: 'text-green-500' },
        { label: 'In Progress', value: myProjects.filter(p => p.status === 'in-progress').length.toString(), icon: 'fas fa-spinner', color: 'text-yellow-500' },
        { label: 'Completed', value: myProjects.filter(p => p.status === 'completed').length.toString(), icon: 'fas fa-check-circle', color: 'text-purple-500' }
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-gray-500 mt-1">Manage your personal information and preferences</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-2 font-semibold transition-all duration-300 rounded-t-lg ${
                activeTab === 'profile'
                  ? 'text-red-600 border-b-2 border-red-500 bg-gray-50/50'
                  : 'text-gray-500 hover:text-red-500 hover:bg-gray-50/30'
              }`}
            >
              <i className="fas fa-user mr-2"></i>Profile Info
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-2 font-semibold transition-all duration-300 rounded-t-lg ${
                activeTab === 'password'
                  ? 'text-red-600 border-b-2 border-red-500 bg-gray-50/50'
                  : 'text-gray-500 hover:text-red-500 hover:bg-gray-50/30'
              }`}
            >
              <i className="fas fa-lock mr-2"></i>Change Password
            </button>
          </div>

          {/* Profile Info Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-red-500 to-red-600 relative">
                <div className="absolute -bottom-12 left-8">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <i className="fas fa-user-circle text-6xl text-gray-400"></i>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md"
                  >
                    <i className="fas fa-edit mr-2"></i>Edit Profile
                  </button>
                )}
              </div>

              <div className="pt-16 pb-8 px-8">
                {!isEditing ? (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profileData.role === 'freelancer' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          <i className={`fas ${profileData.role === 'freelancer' ? 'fa-code' : 'fa-building'} mr-1 text-xs`}></i>
                          {profileData.role === 'freelancer' ? 'Freelancer' : 'Client'}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 text-sm">{profileData.location || 'Location not set'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {stats.map((stat, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                          <i className={`${stat.icon} ${stat.color} text-2xl mb-2`}></i>
                          <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                          <div className="text-xs text-gray-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <i className="fas fa-user-circle mr-2 text-red-500"></i>About
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-600">{profileData.bio || 'No bio added yet'}</p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <i className="fas fa-address-card mr-2 text-red-500"></i>Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <i className="fas fa-envelope w-8 text-red-500"></i>
                          <div>
                            <div className="text-xs text-gray-500">Email</div>
                            <div className="text-sm text-gray-700">{profileData.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <i className="fas fa-phone w-8 text-red-500"></i>
                          <div>
                            <div className="text-xs text-gray-500">Phone</div>
                            <div className="text-sm text-gray-700">{profileData.phoneNumber || 'Not provided'}</div>
                          </div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <i className="fas fa-map-marker-alt w-8 text-red-500"></i>
                          <div>
                            <div className="text-xs text-gray-500">Location</div>
                            <div className="text-sm text-gray-700">{profileData.location || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <i className="fas fa-share-alt mr-2 text-red-500"></i>Social Links
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {profileData.socialLinks.linkedin && (
                          <button onClick={() => openSocialLink(profileData.socialLinks.linkedin)} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                            <i className="fab fa-linkedin text-blue-700 text-xl"></i>
                            <span className="text-sm text-gray-700">LinkedIn</span>
                          </button>
                        )}
                        {profileData.socialLinks.github && (
                          <button onClick={() => openSocialLink(profileData.socialLinks.github)} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                            <i className="fab fa-github text-gray-700 text-xl"></i>
                            <span className="text-sm text-gray-700">GitHub</span>
                          </button>
                        )}
                        {profileData.socialLinks.twitter && (
                          <button onClick={() => openSocialLink(profileData.socialLinks.twitter)} className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                            <i className="fab fa-twitter text-blue-400 text-xl"></i>
                            <span className="text-sm text-gray-700">Twitter</span>
                          </button>
                        )}
                        {!profileData.socialLinks.linkedin && !profileData.socialLinks.github && !profileData.socialLinks.twitter && (
                          <p className="text-gray-500 text-sm">No social links added</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
                      <div className="flex gap-2">
                        <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                          Cancel
                        </button>
                        <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                          {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Save Changes'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                        <input type="text" name="name" value={profileData.name} onChange={handleInputChange} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                        <input type="text" name="location" value={profileData.location} onChange={handleInputChange} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                        <input type="tel" name="phoneNumber" value={profileData.phoneNumber} onChange={handleInputChange} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                        <textarea name="bio" value={profileData.bio} onChange={handleInputChange} rows="4" className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn</label>
                        <input type="url" name="socialLinks.linkedin" value={profileData.socialLinks.linkedin} onChange={handleInputChange} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">GitHub</label>
                        <input type="url" name="socialLinks.github" value={profileData.socialLinks.github} onChange={handleInputChange} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Twitter</label>
                        <input type="url" name="socialLinks.twitter" value={profileData.socialLinks.twitter} onChange={handleInputChange} className="input-field" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      <i className="fas fa-key mr-2 text-red-500"></i>Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                      className="input-field"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      <i className="fas fa-lock mr-2 text-red-500"></i>New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      className="input-field"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      <i className="fas fa-check-circle mr-2 text-red-500"></i>Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmNewPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                      required
                      className="input-field"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="btn-primary w-full md:w-auto px-8 py-2"
                  >
                    {passwordLoading ? (
                      <><i className="fas fa-spinner fa-spin mr-2"></i>Changing...</>
                    ) : (
                      <><i className="fas fa-key mr-2"></i>Change Password</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;