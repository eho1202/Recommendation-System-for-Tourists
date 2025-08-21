import React, { useState, ChangeEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, TripDetails } from '../services/api';
import { Plane, CalendarDays, Users, Clock, ArrowRight } from 'lucide-react';
import AuthModal from '../components/AuthModal';

// Updated interfaces based on the flight itinerary sample
interface FlightSegment {
  aircraft: {
    code: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  blacklistedInEU: boolean;
  carrierCode: string;
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  duration: string;
  id: string;
  number: string;
  numberOfStops: number;
  operating: {
    carrierCode: string;
  };
}

interface FlightItinerary {
  segments: FlightSegment[];
  duration?: string;
}

interface FlightData {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  itineraries: FlightItinerary[];
  [key: string]: any;
}

const FlightSearchForm: React.FC = () => {
  const { isAuthenticated, getUserId } = useAuth();
  const [formData, setFormData] = useState({
    currentLocation: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    travelers: '1',
  });

  const [flightResults, setFlightResults] = useState<FlightData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [savingTrip, setSavingTrip] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDateTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Convert duration from PT format to readable format
  const formatDuration = (duration: string): string => {
    // Handle format like PT3H45M
    const hours = duration.match(/(\d+)H/)?.[1] || '0';
    const minutes = duration.match(/(\d+)M/)?.[1] || '0';
    return `${hours}h ${minutes}m`;
  };

  const getAirlineCode = (code: string): string => {
    // Map airline codes to their names - in a real app, you'd use a complete database
    const airlines: Record<string, string> = {
      'AC': 'Air Canada',
      'UA': 'United Airlines',
      'AA': 'American Airlines',
      'DL': 'Delta Airlines',
      'WJ': 'WestJet',
    };
    return airlines[code] || code;
  };

  const searchFlights = async () => {
    const { currentLocation, destination, departureDate, returnDate, travelers } = formData;
    const today = new Date().toISOString().split('T')[0];

    // Validate inputs
    if (!currentLocation || !destination) {
      setErrorMessage('Please select both current location and destination.');
      return;
    } else if (currentLocation === destination) {
      setErrorMessage('Current location and destination cannot be the same.');
      return;
    }

    if (!departureDate || departureDate < today) {
      setErrorMessage('Please select a valid departure date.');
      return;
    } else if (!returnDate || returnDate < departureDate) {
      setErrorMessage('Please select a valid return date.');
      return;
    }

    // Reset previous results and errors
    setFlightResults([]);
    setErrorMessage('');
    setLoading(true);

    try {
      // In a real app, this would be stored securely and not hardcoded
      const clientId = 'YOUR_AMADEUS_API_KEY';
      const clientSecret = 'YOUR_AMADEUS_API_SECRET';

      // Mock flight data instead of actual API call for demonstration
      // This simulates the structure from the screenshot
      setTimeout(() => {
        const mockFlights: FlightData[] = [
          {
            id: 'flight1',
            price: {
              total: '450.79',
              currency: 'USD'
            },
            itineraries: [
              {
                segments: [
                  {
                    aircraft: { code: '223' },
                    arrival: { iataCode: 'DEN', at: '2025-04-26T19:20:00' },
                    blacklistedInEU: false,
                    carrierCode: 'UA',
                    departure: { iataCode: 'YYZ', terminal: '1', at: '2025-04-26T08:35:00' },
                    duration: 'PT3H45M',
                    id: '1',
                    number: '8651',
                    numberOfStops: 0,
                    operating: { carrierCode: 'AC' }
                  },
                  {
                    aircraft: { code: '319' },
                    arrival: { iataCode: 'LAX', terminal: '2', at: '2025-04-26T12:38:00' },
                    blacklistedInEU: false,
                    carrierCode: 'UA',
                    departure: { iataCode: 'DEN', at: '2025-04-26T11:15:00' },
                    duration: 'PT2H23M',
                    id: '2',
                    number: '430',
                    numberOfStops: 0,
                    operating: { carrierCode: 'UA' }
                  }
                ]
              },
              {
                segments: [
                  {
                    aircraft: { code: '320' },
                    arrival: { iataCode: 'YYZ', at: '2025-04-30T19:45:00' },
                    blacklistedInEU: false,
                    carrierCode: 'UA',
                    departure: { iataCode: 'LAX', terminal: '2', at: '2025-04-30T11:20:00' },
                    duration: 'PT5H25M',
                    id: '3',
                    number: '578',
                    numberOfStops: 0,
                    operating: { carrierCode: 'AC' }
                  }
                ]
              }
            ]
          },
          {
            id: 'flight2',
            price: {
              total: '525.35',
              currency: 'USD'
            },
            itineraries: [
              {
                segments: [
                  {
                    aircraft: { code: '737' },
                    arrival: { iataCode: 'LAX', at: '2025-04-26T12:15:00' },
                    blacklistedInEU: false,
                    carrierCode: 'AC',
                    departure: { iataCode: 'YYZ', terminal: '1', at: '2025-04-26T09:00:00' },
                    duration: 'PT5H15M',
                    id: '1',
                    number: '759',
                    numberOfStops: 0,
                    operating: { carrierCode: 'AC' }
                  }
                ]
              },
              {
                segments: [
                  {
                    aircraft: { code: '737' },
                    arrival: { iataCode: 'YYZ', at: '2025-04-30T22:30:00' },
                    blacklistedInEU: false,
                    carrierCode: 'AC',
                    departure: { iataCode: 'LAX', terminal: '2', at: '2025-04-30T14:15:00' },
                    duration: 'PT5H15M',
                    id: '2',
                    number: '760',
                    numberOfStops: 0,
                    operating: { carrierCode: 'AC' }
                  }
                ]
              }
            ]
          }
        ];

        setFlightResults(mockFlights);
        setLoading(false);
      }, 1500);
    } catch (error: any) {
      console.error('Flight search error:', error);
      setErrorMessage(`Failed to search flights: ${error.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  const handleSaveFlight = async (flightIndex: number, flight: FlightData) => {
    if (!isAuthenticated) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    const userId = getUserId();
    if (!userId) {
      setErrorMessage('User ID not found. Please try logging in again.');
      return;
    }

    try {
      setSavingTrip(flightIndex);

      // Get departure and arrival details from the outbound itinerary
      const outboundItinerary = flight.itineraries[0];
      const firstSegment = outboundItinerary.segments[0];
      const lastSegment = outboundItinerary.segments[outboundItinerary.segments.length - 1];
      
      // Get return flight details if available
      const hasReturn = flight.itineraries.length > 1;
      const returnItinerary = hasReturn ? flight.itineraries[1] : null;
      const returnLastSegment = returnItinerary?.segments[returnItinerary.segments.length - 1];

      // Create itinerary route
      const itineraryRoute = outboundItinerary.segments.map(segment => segment.departure.iataCode);
      // Add the final destination
      itineraryRoute.push(lastSegment.arrival.iataCode);
      
      // If there's a return flight, add those segments too
      if (returnItinerary) {
        returnItinerary.segments.forEach(segment => {
          itineraryRoute.push(segment.departure.iataCode);
        });
        // Add the final return destination
        if (returnLastSegment) {
          itineraryRoute.push(returnLastSegment.arrival.iataCode);
        }
      }

      // Generate trip ID with prefix and random number
      const tripId = `trip_${Math.floor(Math.random() * 1000000)}`;
      
      // Create trip object
      const tripData: TripDetails = {
        tripId,
        name: `Trip to ${lastSegment.arrival.iataCode}`,
        destination: lastSegment.arrival.iataCode,
        startDate: firstSegment.departure.at.split('T')[0],
        endDate: (returnLastSegment?.arrival.at || lastSegment.arrival.at).split('T')[0],
        itinerary: itineraryRoute
      };

      // Use the API service to add the trip
      await userService.addTrip(userId, tripData);
      
      // Success message
      alert('Trip added to your dashboard!');
    } catch (err: any) {
      console.error('Trip save failed:', err);
      setErrorMessage(`Could not save trip: ${err.message || 'Unknown error'}`);
    } finally {
      setSavingTrip(null);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Search Flights</h2>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <div className="relative">
                <input
                  type="text"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleChange}
                  placeholder="Airport code (e.g. YYZ)"
                  className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <Plane className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <div className="relative">
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Airport code (e.g. LAX)"
                  className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <Plane className="absolute left-3 top-3 h-5 w-5 text-gray-400 transform rotate-90" />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <CalendarDays className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <CalendarDays className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Travelers</label>
            <div className="relative">
              <select
                name="travelers"
                value={formData.travelers}
                onChange={handleChange}
                className="w-full p-3 pl-10 border rounded-lg appearance-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} Traveler{n > 1 ? 's' : ''}</option>
                ))}
              </select>
              <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <button
            onClick={searchFlights}
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                <span>Searching...</span>
              </>
            ) : (
              <span>Search Flights</span>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          <p>{errorMessage}</p>
        </div>
      )}

      {flightResults.length > 0 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-xl font-bold mb-2">Available Flights</h3>
          {flightResults.map((flight, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
              {/* Flight header with price */}
              <div className="bg-teal-50 p-4 border-b flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-lg">
                    {flight.itineraries[0].segments[0].departure.iataCode} → {
                      flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode
                    }
                  </h4>
                  <p className="text-sm text-gray-600">
                    {flight.itineraries.length > 1 ? 'Round trip' : 'One way'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-teal-700">${parseFloat(flight.price.total).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">per person</p>
                </div>
              </div>

              {/* Flight details */}
              <div className="p-4 divide-y">
                {/* Outbound flight */}
                <div className="pb-4">
                  <h5 className="font-semibold text-gray-700 mb-3">Outbound Flight</h5>
                  <div className="space-y-4">
                    {flight.itineraries[0].segments.map((segment, segIndex) => (
                      <div key={segIndex} className="flex items-start">
                        <div className="flex-1">
                          <p className="font-semibold">
                            {formatDateTime(segment.departure.at)}
                          </p>
                          <p className="text-sm">
                            {segment.departure.iataCode} {segment.departure.terminal && `(Terminal ${segment.departure.terminal})`}
                          </p>
                        </div>
                        
                        <div className="mx-4 flex flex-col items-center">
                          <p className="text-xs text-gray-500">
                            {formatDuration(segment.duration)}
                          </p>
                          <div className="w-24 h-0.5 bg-gray-300 my-1 relative">
                            <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-gray-500 rounded-full transform -translate-y-1/2"></div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {getAirlineCode(segment.operating.carrierCode)} {segment.number}
                          </p>
                        </div>
                        
                        <div className="flex-1 text-right">
                          <p className="font-semibold">
                            {formatDateTime(segment.arrival.at)}
                          </p>
                          <p className="text-sm">
                            {segment.arrival.iataCode} {segment.arrival.terminal && `(Terminal ${segment.arrival.terminal})`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Return flight if available */}
                {flight.itineraries.length > 1 && (
                  <div className="pt-4">
                    <h5 className="font-semibold text-gray-700 mb-3">Return Flight</h5>
                    <div className="space-y-4">
                      {flight.itineraries[1].segments.map((segment, segIndex) => (
                        <div key={segIndex} className="flex items-start">
                          <div className="flex-1">
                            <p className="font-semibold">
                              {formatDateTime(segment.departure.at)}
                            </p>
                            <p className="text-sm">
                              {segment.departure.iataCode} {segment.departure.terminal && `(Terminal ${segment.departure.terminal})`}
                            </p>
                          </div>
                          
                          <div className="mx-4 flex flex-col items-center">
                            <p className="text-xs text-gray-500">
                              {formatDuration(segment.duration)}
                            </p>
                            <div className="w-24 h-0.5 bg-gray-300 my-1 relative">
                              <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-gray-500 rounded-full transform -translate-y-1/2"></div>
                            </div>
                            <p className="text-xs text-gray-500">
                              {getAirlineCode(segment.operating.carrierCode)} {segment.number}
                            </p>
                          </div>
                          
                          <div className="flex-1 text-right">
                            <p className="font-semibold">
                              {formatDateTime(segment.arrival.at)}
                            </p>
                            <p className="text-sm">
                              {segment.arrival.iataCode} {segment.arrival.terminal && `(Terminal ${segment.arrival.terminal})`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flight itinerary visualization */}
                <div className="pt-4">
                  <h5 className="font-semibold text-gray-700 mb-3">Full Itinerary</h5>
                  <div className="flex items-center justify-center my-3">
                    {flight.itineraries.map((itinerary, itinIndex) => (
                      <div key={itinIndex} className="flex items-center">
                        {itinerary.segments.map((segment, segIdx) => (
                          <React.Fragment key={segIdx}>
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{segment.departure.iataCode}</span>
                            </div>
                            <div className="flex items-center mx-1">
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </div>
                            {segIdx === itinerary.segments.length - 1 && (
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-2 py-1 rounded-full">{segment.arrival.iataCode}</span>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                        {itinIndex === 0 && flight.itineraries.length > 1 && (
                          <div className="mx-2 border-t-2 border-dashed border-gray-300 w-6"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save trip button */}
                <div className="pt-4">
                  <button
                    onClick={() => handleSaveFlight(index, flight)}
                    disabled={savingTrip === index}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {savingTrip === index ? 'Saving...' : 'Save to My Trips'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
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

export default FlightSearchForm;