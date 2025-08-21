import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, MapPin, Tag, Bookmark } from 'lucide-react';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { useAuth } from '../context/AuthContext';
import { locationService, recommendationService, userService, LocationData, RatingData } from '../services/api';
import AuthModal from '../components/AuthModal';
import Toast from '../components/Toast';

const Destination: React.FC = () => {
  // Get name from URL parameter
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, getUserId } = useAuth();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  
  // Try to get location data from React Router state first
  const locationFromState = location.state?.locationData as LocationData | undefined;
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [locationData, setLocationData] = useState<LocationData | null>(locationFromState || null);
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!locationFromState);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [favouriteSubmitted, setFavouriteSubmitted] = useState<boolean>(false);
  const [hoverFavourite, setHoverFavourite] = useState<boolean>(false);
  const [isInFavorites, setIsInFavorites] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [showToast, setShowToast] = useState<boolean>(false);

  // Check if user has already rated this location
  useEffect(() => {
    if (ratingData?.ratings && isAuthenticated) {
      const userId = getUserId();
      const existingRating = ratingData.ratings.find(r => r.userId === userId);
      if (existingRating) {
        setUserRating(existingRating.rating);
        setRatingSubmitted(true);
      }
    }
  }, [ratingData, isAuthenticated, getUserId]);

  // Check if user has already added this location to favorites
  useEffect(() => {
    if (isAuthenticated && user?.favourites && locationData) {
      setIsInFavorites(user.favourites.includes(locationData.name));
    }
  }, [isAuthenticated, user, locationData]);

  useEffect(() => {
    window.scrollTo(0, 0);
    // If we already have location data from state, we can skip the API call
    if (locationFromState) {
      setLocationData(locationFromState);
      fetchLocationImage(locationFromState);
      // Fetch the ratings data
      if (locationFromState.locationId) {
        fetchLocationRatings(locationFromState.locationId);
      }
      return;
    }
    
    const fetchLocationDetails = async () => {
      if (!name) {
        setError('Location name is missing');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const decodedName = decodeURIComponent(name);
        
        // Try to get from localStorage as fallback
        const storedData = localStorage.getItem(`destination_${decodedName}`);
        
        if (storedData) {
          // Location found in localStorage
          const parsedData = JSON.parse(storedData) as LocationData;
          setLocationData(parsedData);
          fetchLocationImage(parsedData);
          
          // Fetch the latest ratings data
          if (parsedData.locationId) {
            fetchLocationRatings(parsedData.locationId);
          }
        } else {
          setError('Could not find location details. Please go back and try again.');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching location details:', err);
        setError('Failed to load destination details. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchLocationDetails();
  }, [name, locationFromState, getUserId]);

  const fetchLocationRatings = async (locationId: number) => {
    try {
      const ratings = await recommendationService.getLocationRatings(locationId);
      setRatingData(ratings);
      
      // Check if the user has already rated this location
      if (isAuthenticated && ratings?.ratings) {
        const userId = getUserId();
        const existingRating = ratings.ratings.find(r => r.userId === userId);
        if (existingRating) {
          setUserRating(existingRating.rating);
          setRatingSubmitted(true);
        }
      }
    } catch (err) {
      console.error('Error fetching location ratings:', err);
    }
  };

  // Separate function to fetch the image
  const fetchLocationImage = async (location: LocationData) => {
    try {
      const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
      if (!unsplashKey) {
        console.error('Missing Unsplash API key');
        setIsLoading(false);
        return;
      }
      
      const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(location.name + ' ' + (location.country || ''))}}&page=1&per_page=1&client_id=${unsplashKey}`;
      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const json = await res.json();
      if (json && json.results && json.results.length > 0) {
        setBackgroundImage(json.results[0].urls.regular);
      }
    } catch (imgError) {
      console.error('Failed to fetch image:', imgError);
      // Continue without an image - not a critical error
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Handle star rating hover
  const handleStarHover = (rating: number) => {
    if (!hoverFavourite && !favouriteSubmitted) {
      setHoverRating(rating);
    }
  };

  // Handle star rating click
  const handleStarClick = (rating: number) => {
    if (!isSubmittingRating) {
      if (isAuthenticated && locationData) {
        setUserRating(rating);
        submitRating(rating);
      } else {
        // Open auth modal if not authenticated
        setAuthModalMode('login');
        setIsAuthModalOpen(true);
      }
    }
  };

  // Submit rating to the server
  const submitRating = async (rating: number) => {
    if (!locationData) return;
    
    try {
      setIsSubmittingRating(true);
      
      const userId = getUserId();
      if (!userId) {
        console.error('User is not authenticated');
        setIsSubmittingRating(false);
        setAuthModalMode('login');
        setIsAuthModalOpen(true);
        return;
      }

      if (ratingSubmitted) {
        // Update existing rating
        await recommendationService.updateUserRating(
          userId,
          locationData.locationId,
          rating
        );
      } else {
        // Create new rating
        await recommendationService.rateDestination(userId, locationData.locationId, rating);
      }

      // Update the rating display
      setRatingSubmitted(true);
      
      // Refetch ratings data to get updated counts
      fetchLocationRatings(locationData.locationId);
      
      // Update location data with new rating if available
      try {
        const updatedLocation = await locationService.getLocationById(locationData.locationId);
        setLocationData(updatedLocation);
        
        // Update localStorage
        if (name) {
          const decodedName = decodeURIComponent(name);
          localStorage.setItem(`destination_${decodedName}`, JSON.stringify(updatedLocation));
        }
      } catch (updateErr) {
        console.error('Error updating location data:', updateErr);
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating. Please try again later.');
    } finally {
      setIsSubmittingRating(false);
      window.location.reload();
    }
  };

  const handleFavouriteHover = (isHovering: boolean) => {
    if (!isInFavorites) {
      setHoverFavourite(isHovering);
    }
  };

  const handleFavouriteClick = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      setAuthModalMode('login');
      return;
    }
    
    if (!locationData || favouriteSubmitted) return;
    
    // Toggle favorite state
    const operation = isInFavorites ? 'remove' : 'add';
    const currentStatus = isInFavorites; // Save current status for later use
    
    try {
      setFavouriteSubmitted(true);
      const userId = getUserId();
      
      if (!userId) {
        setError('User ID not found. Please try logging in again.');
        setFavouriteSubmitted(false); // Reset submission state
        return;
      }
  
      // Use userService to update favorites
      await userService.updateFavourites(userId, [
        { operation, place: locationData.name }
      ]);
      
      // Update local state
      setIsInFavorites(!currentStatus);
      
      // Show toast notification
      setToastMessage(
        currentStatus 
          ? `Removed ${locationData.name} from favorites` 
          : `Added ${locationData.name} to favorites`
      );
      setToastType('success');
      setShowToast(true);
      
    } catch (err) {
      console.error('Error updating favorites:', err);
      setToastMessage('Failed to update favorites. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setFavouriteSubmitted(false); // Reset the submission state when done
      window.location.reload();
    }
  };


  // Handle auth modal success
  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    // If we were trying to rate, retry now that we're logged in
    if (hoverRating > 0) {
      setUserRating(hoverRating);
      submitRating(hoverRating);
    }
  };

  // Render stars for ratings
  const renderStars = (count: number, interactive = false) => {
    return Array(5).fill(0).map((_, index) => {
      const starNumber = index + 1;
      const isFilled = interactive 
        ? (hoverRating || userRating) >= starNumber
        : count >= starNumber;
      
      return (
        <Star
          key={index}
          className={`w-6 h-6 ${
            isFilled 
              ? 'text-yellow-500 fill-yellow-500' 
              : 'text-gray-300 stroke-gray-300'
          } ${interactive && !isSubmittingRating ? 'cursor-pointer' : ''}`}
          onMouseEnter={interactive ? () => handleStarHover(starNumber) : undefined}
          onMouseLeave={interactive ? () => handleStarHover(0) : undefined}
          onClick={interactive ? () => handleStarClick(starNumber) : undefined}
        />
      );
    });
  };

  // Function to handle adding to favourites
  const renderFavouriteButton = () => {
    return (
    <div className="flex flex-col items-center">
      <button
        className={`flex items-center gap-2 focus:outline-none ${favouriteSubmitted ? 'opacity-70 cursor-not-allowed' : ''}`}
        onMouseEnter={() => handleFavouriteHover(true)}
        onMouseLeave={() => handleFavouriteHover(false)}
        onClick={handleFavouriteClick}
        disabled={favouriteSubmitted}
      >
        <Bookmark
          className={`w-6 h-6 ${
            isInFavorites 
              ? 'text-teal-500 fill-teal-500' 
              : hoverFavourite 
                ? 'text-teal-400' 
                : 'text-gray-400'
          } transition-colors`}
        />
        <span className="text-sm font-medium">
          {favouriteSubmitted 
            ? 'Updating...'
            : isInFavorites 
              ? 'Saved to Favorites' 
              : 'Add to Favorites'
          }
        </span>
      </button>
    </div>
  );
  };

  // Open auth modal with mode
  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Function to handle adding to trip plan
  const handleAddToTrip = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    
    // Navigate to plan trip page with this destination
    navigate('/plan-trip', { 
      state: { selectedDestination: locationData } 
    });
  };

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    
    return address
      .toLowerCase()
      .split(' ')
      .map(word => {
        // Handle special cases like 'st', 'e', etc.
        if (word === 'st') return 'St';
        if (word === 'e' || word === 'w' || word === 'n' || word === 's') return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  return (
    <div>
      {/* Hero section with background image */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
      <div
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: backgroundImage 
            ? `url("${backgroundImage}")` 
            : 'url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2070&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <button 
            onClick={handleBack}
            className="absolute top-8 left-4 md:left-8 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all"
          >
            <ArrowLeft className="h-5 w-5 text-gray-800" />
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {locationData?.name || decodeURIComponent(name || '')}
          </h1>
          {locationData && (
            <p className="text-xl text-white">
              {locationData.city ? `${locationData.city}, ` : ''}
              {locationData.country}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading && <LoadingState />}
        
        {error && <ErrorState message={error} />}
        
        {!isLoading && !error && locationData && (
          <>
            {/* Rating section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Overall Rating</h2>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {renderStars(ratingData?.avgRating || locationData.rating || 0)}
                    </div>
                    <span className="text-lg font-medium">
                      {(ratingData?.avgRating || locationData.rating || 0).toFixed(1)} 
                    </span>
                    <span className="text-gray-500 ml-2">
                      ({ratingData?.totalRatings || 0} ratings)
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <h3 className="text-lg font-medium mb-1">
                    {ratingSubmitted ? 'Your Rating' : 'Rate this Destination'}
                  </h3>
                  <div className="flex items-center">
                    <div className="flex">
                      {renderStars(userRating, true)}
                    </div>
                    {isSubmittingRating && (
                      <span className="ml-2 text-blue-600 text-sm">
                        Submitting...
                      </span>
                    )}
                    {ratingSubmitted && !isSubmittingRating && (
                      <span className="ml-2 text-green-600 text-sm">
                        Thanks for rating!
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 md:mt-0">
                  <div className="flex items-center">
                    <div className="flex">
                      {renderFavouriteButton()}
                    </div>
                    {/* Success message */}
                    {successMessage && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg text-green-800 text-sm">
                        {successMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-blue-800 text-sm">
                  <p>
                    <button 
                      onClick={() => openAuthModal('signup')}
                      className="font-medium underline"
                    >
                      Sign up
                    </button> or <button 
                      onClick={() => openAuthModal('login')}
                      className="font-medium underline"
                    >
                      log in
                    </button> to rate this destination
                  </p>
                </div>
              )}
            </div>

            {/* Destination Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">About {locationData.name}</h2>
              
              {locationData.description && (
                <div className="mb-6">
                  <p className="text-gray-700">{locationData.description.replace(/_/g, ' ')}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-teal-600 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Location</h3>
                    <p className="text-gray-600">
                      {locationData.address && formatAddress(locationData.address)}
                      {locationData.address && (locationData.city || locationData.country) && <br />}
                      {locationData.city && `${locationData.city}`}
                      {locationData.city && locationData.country && ', '}
                      {locationData.country && `${locationData.country}`}
                    </p>
                  </div>
                </div>
                
                {locationData.category && locationData.category.length > 0 && (
                  <div className="flex items-start">
                    <Tag className="w-5 h-5 text-teal-600 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(locationData.category) 
                          ? locationData.category.map((cat, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-teal-50 text-teal-700 text-sm rounded-full"
                              >
                                {typeof cat === 'string' ? cat.replace(/_/g, ' ') : ''}
                              </span>
                            ))
                          : (
                            <span className="px-2 py-1 bg-teal-50 text-teal-700 text-sm rounded-full">
                              {locationData.category}
                            </span>
                          )
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Trip Planning Section */}
            <div className="bg-teal-50 rounded-lg shadow-md p-6 mb-8 border border-teal-100">
              <h2 className="text-2xl font-semibold mb-4 text-teal-800">Plan Your Visit</h2>
              
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="md:flex-1">
                  <p className="text-teal-700 mb-4">
                    Ready to explore {locationData.name}? Add it to your trip plan and get started with your itinerary.
                  </p>
                  <button 
                    onClick={handleAddToTrip}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Plan Trip to {locationData.name}
                  </button>
                  
                  {!isAuthenticated && (
                    <p className="mt-3 text-sm text-teal-600">
                      <span className="cursor-pointer underline" onClick={() => openAuthModal('login')}>
                        Sign in
                      </span> to save your trip plans
                    </p>
                  )}
                </div>
                
                <div className="md:flex-1 bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium text-lg mb-3 text-teal-700">Best Time to Visit</h3>
                  <div className="flex items-start mb-3">
                    <Calendar className="w-5 h-5 text-teal-600 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      The ideal time to visit {locationData.name} depends on your preferences.
                      For the best weather conditions, consider visiting during the spring or fall months.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* For guest users, show sign-up prompt */}
            {!isAuthenticated && (
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-8">
                <h3 className="text-xl font-bold text-blue-800 mb-2">Create an account</h3>
                <p className="text-blue-700 mb-4">
                  Sign up to get personalized recommendations based on your preferences and save your favorite destinations.
                </p>
                <button 
                  onClick={() => openAuthModal('signup')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-block"
                >
                  Sign Up
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />
    </div>
  );
};

export default Destination;