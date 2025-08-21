import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, User, TripDetails } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const ProfileDashboard: React.FC = () => {
  const { user: authUser, isAuthenticated, getUserId } = useAuth();
  const [user, setUser] = useState<User | null>(authUser);
  const [trips, setTrips] = useState<TripDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setError('You must be logged in to view your profile');
        return;
      }

      const userId = getUserId();
      if (!userId) {
        setError('User ID not found');
        return;
      }

      setLoading(true);
      try {
        // Fetch fresh user data
        const userData = await userService.getUserProfile(userId);
        setUser(userData);

        // Extract trips from user data
        if (userData.savedTrips) {
          setTrips(Object.values(userData.savedTrips));
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Unable to load your profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, getUserId]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!user) {
    return <ErrorState message="User profile not available" />;
  }

  const profile = user.profile || {};
  const preferences = user.preferences || {};

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 text-gray-800">
      <h1 className="text-4xl font-bold mb-10 text-center text-indigo-700">
        Welcome, {profile.firstName || 'Traveler'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">👤 Profile Info</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>Full Name:</strong> {profile.firstName} {profile.lastName}</li>
            <li><strong>Email:</strong> {user.email}</li>
            <li><strong>Gender:</strong> {profile.gender || 'Not specified'}</li>
            <li><strong>Age Group:</strong> {profile.ageGroup || 'Not specified'}</li>
            <li><strong>Job:</strong> {profile.job || 'Not specified'}</li>
            <li><strong>Location:</strong> {profile.location || 'Not specified'}</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-2xl font-semibold mb-4 text-purple-600">🌍 Preferences</h2>
          {preferences && Object.keys(preferences).length > 0 ? (
            <div className="space-y-3">
              {preferences.environments && preferences.environments.length > 0 && (
                <div>
                  <strong>Environments:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {preferences.environments.map((env, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {env}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {preferences.food && preferences.food.length > 0 && (
                <div>
                  <strong>Food:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {preferences.food.map((item, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {preferences.activities && preferences.activities.length > 0 && (
                <div>
                  <strong>Activities:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {preferences.activities.map((activity, idx) => (
                      <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400">No preferences found. Complete the survey to personalize your experience.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4 text-teal-600">🧳 Saved Trips</h2>
          {trips.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.map((trip) => (
                <div key={trip.tripId} className="border rounded p-4 bg-gray-50 shadow-sm hover:shadow-md">
                  <h3 className="font-semibold text-indigo-700 text-lg">{trip.name}</h3>
                  <p className="text-sm"><strong>Destination:</strong> {trip.destination}</p>
                  <p className="text-sm"><strong>Start:</strong> {trip.startDate || 'Not specified'}</p>
                  <p className="text-sm"><strong>End:</strong> {trip.endDate || 'Not specified'}</p>
                  {trip.itinerary && trip.itinerary.length > 0 && (
                    <p className="text-sm"><strong>Route:</strong> {trip.itinerary.join(' → ')}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No trips saved yet. Plan your first adventure!</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4 text-pink-600">❤️ Favorites</h2>
            {user.favourites && user.favourites.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.favourites.map((place, idx) => (
                <span key={idx} className="px-3 py-1 bg-pink-100 text-pink-800 text-sm rounded-lg">
                  {place}
                </span>
              ))} 
            </div>
            ) : (
              <p className="text-sm text-gray-400">No favorites added yet. Explore and save your favorite places!</p>
            )}
          </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;