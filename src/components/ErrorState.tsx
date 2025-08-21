import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
      <div className="flex">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        <div className="ml-3">
          <p className="text-red-700">{message}</p>
          <p className="text-red-600 mt-2 text-sm">
            Please try again later or check if the destination exists.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;