import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, ProfileUpdateModel } from '../services/api';

const ageGroups = [
  { label: '25 or under', value: 1 },
  { label: '26 - 35', value: 2 },
  { label: '36 - 45', value: 3 },
  { label: '46 - 60', value: 4 },
  { label: '61+', value: 5 },
];

const jobs = [
  'scientist', 'tradesman/craftsman', 'retired', 'customer service',
  'technician/engineer', 'writer', 'unemployed', 'executive/managerial',
  'doctor/health care', 'farmer', 'self-employed', 'academic/educator',
  'K-12 student', 'college/grad student', 'homemaker', 'artist', 'other',
  'lawyer', 'clerical/admin', 'sales/marketing', 'programmer',
];

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    gender: user?.profile?.gender || '',
    ageGroup: user?.profile?.ageGroup || 0,
    location: user?.profile?.location || '',
    job: user?.profile?.job || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.userId) {
      setError('You must be logged in to update your profile.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // For numeric ageGroup
      const profileData: ProfileUpdateModel = {
        userId: user.userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        ageGroup: Number(formData.ageGroup),
        location: formData.location,
        job: formData.job
      };
      
      // Call the API to update the profile
      const result = await userService.updateProfile(user.userId, profileData);
      
      // Get the complete user profile again
      const updatedUser = await userService.getUserProfile(user.userId);
      
      // Update the user in context and local storage
      updateUser(updatedUser);
      
      navigate('/survey');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.detail || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Complete Your Profile</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName || ''}
            onChange={handleChange}
            required
            className="w-1/2 p-3 border rounded"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName || ''}
            onChange={handleChange}
            required
            className="w-1/2 p-3 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Gender</label>
          <select
            name="gender"
            value={formData.gender || ''}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Age Group</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ageGroups.map((group) => (
              <label key={group.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="ageGroup"
                  value={group.value}
                  checked={formData.ageGroup === group.value}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, ageGroup: Number(e.target.value) }))
                  }
                  required
                />
                {group.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Location</label>
          <input
            type="text"
            name="location"
            placeholder="e.g. Canada"
            value={formData.location || ''}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Job</label>
          <select
            name="job"
            value={formData.job || ''}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded"
          >
            <option value="">Select job</option>
            {jobs.map((job) => (
              <option key={job} value={job}>
                {job}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 text-white w-full py-3 rounded hover:bg-teal-700 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Continue to Survey'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;