import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import ProfileSetup from './pages/ProfileSetup';
import ProfileDashboard from './pages/ProfileDashboard';
import Destinations from './pages/Destinations';
import Destination from './pages/Destination';
import About from './pages/About';
import PlanTrip from './pages/PlanTrip';
import TripDashboard from './pages/TripDashboard';
import Survey from './pages/Survey';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              
              {/* Authentication required */}
              <Route 
                path="/destinations" 
                element={
                  <ProtectedRoute requiresAuth={true}>
                    <Destinations />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/destination/:name" 
                element={
                  <ProtectedRoute requiresAuth={true}>
                    <Destination />
                  </ProtectedRoute>
                }
              />
              
              <Route 
                path="/plan-trip" 
                element={
                  <ProtectedRoute requiresAuth={true}>
                    <PlanTrip />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute requiresAuth={true}>
                    <ProfileDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile/setup" 
                element={
                  <ProtectedRoute requiresAuth={true}>
                    <ProfileSetup />
                  </ProtectedRoute>
                } 
              />
              
              {/* Authentication and complete profile required */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requiresAuth={true} requiresProfile={true}>
                    <TripDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/survey" 
                element={
                  <ProtectedRoute requiresAuth={true} requiresProfile={true}>
                    <Survey />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;