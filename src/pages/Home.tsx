import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { createApi } from 'unsplash-js';
import { recommendationService } from '../services/api';

interface Recommendation {
  locationId: number;
  name: string;
  category: string[];
  address?: string;
  city?: string;
  country: string;
  itemRating?: number;
}

const unsplash = createApi({
  accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '',
});

const Home = () => {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [photoUrls, setPhotoUrls] = useState<{ [key: string]: string }>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // Clear photo URLs when recommendations change
  useEffect(() => {
    if (recommendations.length === 0) {
      setPhotoUrls({});
    }
  }, [recommendations]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    // Clear previous recommendations before new search
    setRecommendations([]);
    
    try {
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).userId : null;

      const results = await recommendationService.getRecommendations(userId, searchQuery);
      console.log('Search results:', results);
      
      // Check if the results are valid
      if (Array.isArray(results) && results.length > 0) {
        setRecommendations(results);
      } else if (results && typeof results === 'object' && Array.isArray(results.recommendations)) {
        // Some APIs return { recommendations: [...] }
        setRecommendations(results.recommendations);
      } else {
        // No results or unexpected format
        setRecommendations([]);
        setError('No destinations found for your search. Try a different keyword.');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Failed to get recommendations. Please try again.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPhotos = async () => {
      // Don't try to fetch photos if there are no recommendations
      if (recommendations.length === 0) return;
      
      const updatedPhotoUrls: { [key: string]: string } = {};

      await Promise.all(
        recommendations.map(async (place) => {
          try {
            const endpoint = `https://api.unsplash.com/search/photos?query=${place.name}${place.address}${place.city}&page=1&per_page=1&client_id=${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`;
            const res = await fetch(endpoint);
            if (!res.ok) {
              setError(res.statusText)
            }
            const json = await res.json();
            if (json) {
              updatedPhotoUrls[place.name] = json.results[0].urls.regular;
            } else {
              // Try to get by category as fallback
              const categoryResult = await unsplash.search.getPhotos({
                query: `${place.name} ${place.category}`,
                page: 1,
                perPage: 1,
              });
              
              if (categoryResult.response?.results.length) {
                updatedPhotoUrls[place.category] = categoryResult.response.results[0].urls.regular;
              }
            }
          } catch (error) {
            console.error('Failed to fetch photo:', error);
          }
        })
      );

      setPhotoUrls(updatedPhotoUrls);
    };

    if (recommendations.length > 0) {
      fetchPhotos();
    }

    if (recommendations.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [recommendations]);

  return (
    <div>
      <div
        className="relative h-[600px] bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2070&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-white text-center">
          <h1 className="text-5xl font-bold mb-6">Discover Your Next Adventure</h1>
          <p className="text-xl mb-8 max-w-2xl">
            Find personalized travel recommendations and plan your perfect trip with our expert guides.
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search anywhere you want to go..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-6 bg-teal-500 hover:bg-teal-600 rounded-r-lg flex items-center transition-colors"
                disabled={loading}
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          {error && <div className="mt-4 text-red-400">{error}</div>}
        </div>
      </div>

      {recommendations.length > 0 && (
        <section ref={resultsRef} className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Recommended Destinations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommendations.map((place, index) => (
                <div key={index} 
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => {
                      // Store in localStorage as a fallback
                      localStorage.setItem(`destination_${place.name}`, JSON.stringify(place));
                      
                      // Use React Router's state for immediate navigation
                      navigate(`/destination/${encodeURIComponent(place.name)}`, {
                        state: { locationData: place }
                      });
                    }}>
                  <div className="relative h-48 overflow-hidden">
                    {(photoUrls[place.name] || photoUrls[place.category]) ? (
                      <img
                        src={photoUrls[place.name] || photoUrls[place.category]}
                        alt={place.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">Image loading...</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{place.name}</h3>
                    <p className="text-gray-600 mb-2">{place.country}</p>
                    {/* {place.itemRating !== undefined && (
                      <div className="flex items-center mb-2">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{place.itemRating.toFixed(1)}</span>
                      </div>
                    )} */}
                    <p className="text-sm text-gray-500 mt-2">{place.category.join(', ').replace(/_/g, ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;