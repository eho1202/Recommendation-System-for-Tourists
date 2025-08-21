import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, UserPreferences } from '../services/api';

const environments = ['Tropical', 'Cold', 'Hot', 'Beaches', 'Mountains', 'Forests', 'Deserts', 'Lakes', 'City Vibes', 'Countryside'];
const foodOptions = ['Japanese', 'French', 'Italian', 'Mexican', 'Indian', 'Thai', 'Fast Food', 'Halal', 'Vegan', 'Vegetarian'];
const activities = ['Hiking', 'Nightlife', 'Museums', 'Rock Climbing', 'Camping', 'Concert', 'Skiing', 'Swimming', 'Spa', 'Historical Tours'];

const Survey: React.FC = () => {
  const [selected, setSelected] = useState<UserPreferences>({
    environments: [],
    food: [], // Correctly using 'food' to match the API model
    activities: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const toggleSelection = (category: keyof UserPreferences, option: string) => {
    setSelected((prev) => {
      const current = prev[category] || [];
      
      return {
        ...prev,
        [category]: current.includes(option)
          ? current.filter((item) => item !== option)
          : [...current, option]
      };
    });
  };

  const handleSubmit = async () => {
    if (!user || !user.userId) {
      setError('You must be logged in to update preferences.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Add userId to preferences
      const preferencesData: UserPreferences = {
        ...selected,
        userId: user.userId
      };
      
      // Update preferences through the API
      await userService.updatePreferences(user.userId, preferencesData);
      
      // Get the updated user profile
      const updatedUser = await userService.getUserProfile(user.userId);
      
      // Update the user in context and local storage
      updateUser(updatedUser);
      
      navigate('/');
    } catch (err: any) {
      console.error('Failed to save preferences:', err);
      setError(err.response?.data?.detail || 'An error occurred while saving. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title: string, category: keyof UserPreferences, options: string[]) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = selected[category]?.includes(option);
          
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleSelection(category, option)}
              className={`px-4 py-2 rounded-full border transition ${
                isSelected
                  ? 'bg-teal-500 text-white border-teal-500'
                  : 'bg-gray-200 text-gray-700 border-gray-300'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-10">
        Select options which best describe your interests
      </h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {renderSection('Environments', 'environments', environments)}
      {renderSection('Food', 'food', foodOptions)}
      {renderSection('Activities', 'activities', activities)}

      <div className="text-center mt-10">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export default Survey;