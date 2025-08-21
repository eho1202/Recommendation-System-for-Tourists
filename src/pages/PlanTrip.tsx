import React from 'react';
import FlightSearchForm from '../components/FlightSearchForm';

const PlanTrip = () => {
  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Plan Your Trip</h1>
      <div className="max-w-2xl mx-auto">
        <FlightSearchForm />
      </div>
    </div>
  );
};

export default PlanTrip;