import React from 'react';
import { MapPin, Tag, Info } from 'lucide-react';
import { LocationData } from '../services/api';

interface LocationDetailProps {
  location: LocationData;
}

const LocationDetail: React.FC<LocationDetailProps> = ({ location }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">About {location.name}</h2>
      
      {location.description && (
        <div className="mb-6">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-teal-600 mt-1 mr-2 flex-shrink-0" />
            <p className="text-gray-700">{location.description}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start">
          <MapPin className="w-5 h-5 text-teal-600 mt-1 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Location</h3>
            <p className="text-gray-600">
              {location.address && `${location.address}`}
              {location.address && (location.city || location.country) && <br />}
              {location.city && `${location.city}`}
              {location.city && location.country && ', '}
              {location.country && `${location.country}`}
            </p>
          </div>
        </div>
        
        {location.category && location.category.length > 0 && (
          <div className="flex items-start">
            <Tag className="w-5 h-5 text-teal-600 mt-1 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(location.category) 
                  ? location.category.map((cat, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-teal-50 text-teal-700 text-sm rounded-full"
                      >
                        {typeof cat === 'string' ? cat : 'Unknown'}
                      </span>
                    ))
                  : (
                    <span className="px-2 py-1 bg-teal-50 text-teal-700 text-sm rounded-full">
                      {location.category}
                    </span>
                  )
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDetail;