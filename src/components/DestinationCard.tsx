// src/components/DestinationCard.tsx
import React from 'react';

interface DestinationCardProps {
  location: {
    name: string;
    address?: string;
    city?: string;
    country?: string;
    category?: string[];
    rating?: number;
    itemRating?: number;
  };
  imageUrl?: string;
  onAdd: () => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ location, imageUrl, onAdd }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-lg"
      onClick={onAdd}
    >
      <img
        src={imageUrl}
        alt={location.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{location.name}</h3>
        {(location.address || location.city) && (
          <p className="text-gray-600 mb-2">
            {location.address && `${location.address}, `}
            {location.city && location.country 
              ? `${location.city}, ${location.country}`
              : location.city || location.country}
          </p>
        )}
        {location.itemRating !== undefined && (
          <div className="flex items-center">
            <span className="text-yellow-500">★</span>
            <span className="ml-1">{location.itemRating.toFixed(1)}</span>
          </div>
        )}
        {location.category && (
          <div className="mt-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {location.category.join(', ').replace(/_/g, ' ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationCard;
