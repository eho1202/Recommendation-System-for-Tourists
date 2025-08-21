import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">About Us</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-4">
          Welcome to Travel Recommender, your personal guide to discovering amazing destinations around the world.
        </p>
        <p className="text-lg">
          Our mission is to help travelers find their perfect destinations and create unforgettable experiences.
        </p>
      </div>
    </div>
  );
};

export default About;