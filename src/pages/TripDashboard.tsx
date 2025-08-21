import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, TripDetails } from '../services/api';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';

const TripDashboard: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user?.userId) return;
      
      try {
        setLoading(true);
        
        // Since there's no direct endpoint for getting trips in the provided routes,
        // we'll get the user profile which should contain the saved trips
        const userData = await userService.getUserProfile(user.userId);
        
        // Extract trips from the user data
        let userTrips: TripDetails[] = [];
        if (userData.savedTrips) {
          userTrips = Object.values(userData.savedTrips);
        }
        
        setTrips(userTrips);
      } catch (err) {
        console.error('Failed to load saved trips:', err);
        setError('Unable to load your trips. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [user]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date not specified';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!user?.userId) return;
    
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await userService.deleteTrip(user.userId, tripId);
        setTrips(trips.filter(trip => trip.tripId !== tripId));
      } catch (err) {
        console.error('Failed to delete trip:', err);
        setError('Unable to delete trip. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">My Trips</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {trips.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <h3 className="text-xl font-medium text-gray-600 mb-4">You don't have any saved trips yet</h3>
          <p className="text-gray-500 mb-6">Start planning your next adventure now!</p>
          <a 
            href="/plan-trip" 
            className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
          >
            Plan a Trip
            <ChevronRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div 
              key={trip.tripId}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition hover:shadow-lg"
            >
              <div className="h-40 bg-gray-200 relative">
                {/* Image placeholder - in a real app you'd use actual trip images */}
                <img 
                  src={`https://source.unsplash.com/800x600/?${encodeURIComponent(trip.destination || 'travel')}`}
                  alt={trip.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{trip.name}</h3>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{trip.destination}</span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {trip.startDate && trip.endDate 
                      ? `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`
                      : 'Dates not specified'}
                  </span>
                </div>
                
                {trip.itinerary && trip.itinerary.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Itinerary:</p>
                    <p className="text-sm">{trip.itinerary.join(' → ')}</p>
                  </div>
                )}
                
                <div className="flex justify-between mt-4">
                  <button
                    className="px-4 py-2 bg-teal-100 text-teal-800 rounded-md hover:bg-teal-200 transition"
                    onClick={() => window.location.href = `/plan-trip?edit=${trip.tripId}`}
                  >
                    Edit
                  </button>
                  
                  <button
                    className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition"
                    onClick={() => handleDeleteTrip(trip.tripId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripDashboard;