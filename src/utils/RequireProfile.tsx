// src/utils/RequireProfile.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const RequireProfile = ({ children }: { children: JSX.Element }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const profile = user?.profile || {};
  const isComplete = profile.firstName && profile.ageGroup && profile.job;

  return isComplete ? children : <Navigate to="/profile/setup" />;
};

export default RequireProfile;
