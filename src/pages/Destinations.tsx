import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star } from 'lucide-react';
import { createApi } from 'unsplash-js';
import { recommendationService, locationService, RatingModel, LocationData, RecommendationModel } from '../services/api';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const unsplash = createApi({
  accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '',
});

const Destinations = () => {
  const [recommendations, setRecommendations] = useState<RecommendationModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.userId || 0; // Fallback to a default ID if not logged in

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const randomLocation = await recommendationService.getRecommendations(userId, null);
      
      if (Array.isArray(randomLocation) && randomLocation.length > 0) {
        setRecommendations(randomLocation);
        fetchImages(randomLocation);
      } else {
        setError('No recommendations found. Try adjusting your preferences.');
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setError("Could not load destinations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async (locations: RecommendationModel[]) => {
    const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
    if (!unsplashKey) return;
    
    const newImageUrls: Record<string, string> = {};
    
    await Promise.all(
      locations.map(async (location) => {
        try {
          const query = `${location.name}${location.address}${location.city}`;
          const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=1&per_page=1&client_id=${unsplashKey}`;
          
          const res = await fetch(endpoint);
          if (!res.ok) throw new Error(res.statusText);
          
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            newImageUrls[location.name] = data.results[0].urls.regular;
          }
        } catch (error) {
          console.error(`Failed to fetch image for ${location.name}:`, error);
        }
      })
    );
    
    setImageUrls(newImageUrls);
  }

  const handleViewDestination = (destination: RecommendationModel) => {
    localStorage.setItem(`destination_${destination.name}`, JSON.stringify(destination));
    navigate(`/destination/${encodeURIComponent(destination.name)}`, {
      state: { locationData: destination }
    });
  };

  // Render stars for ratings
  const renderStars = (rating: number = 0) => {
    return Array(5).fill(0).map((_, index) => {
      const starNumber = index + 1;
      const isFilled = rating >= starNumber;
      
      return (
        <Star
          key={index}
          className={`w-4 h-4 ${
            isFilled 
              ? 'text-yellow-500 fill-yellow-500' 
              : 'text-gray-300 stroke-gray-300'
          }`}
        />
      );
    });
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Recommended Destinations</h1>
        <button
          onClick={fetchRecommendations}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          Refresh Recommendations
        </button>
      </div>

      {error && <ErrorState message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((destination, index) => (
          <div 
            key={index}
            onClick={() => handleViewDestination(destination)}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition transform hover:scale-105 hover:shadow-lg"
          >
            <div className="h-48 bg-gray-200 relative">
              {imageUrls[destination.name] ? (
                <img 
                  src={imageUrls[destination.name]} 
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">Image loading...</span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-1">{destination.name}</h3>
              <p className="text-gray-600 mb-2">
                {destination.city && `${destination.city}, `}
                {destination.country}
              </p>
              
              {destination.itemRating !== undefined && (
                <div className="flex items-center mb-2">
                  <div className="flex mr-2">
                    {renderStars(destination.itemRating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {destination.itemRating.toFixed(1)}
                  </span>
                </div>
              )}
              
              {destination.category && destination.category.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {destination.category.map((cat, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                    >
                      {typeof cat === 'string' ? cat.replace(/_/g, ' ') : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {recommendations.length === 0 && !loading && !error && (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">No destinations found. Try adjusting your preferences.</p>
          <button
            onClick={fetchRecommendations}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Destinations;