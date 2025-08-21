import { AxiosError } from 'axios';
import { useState } from 'react';

/**
 * A utility function to extract user-friendly error messages from API errors
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // Handle Axios errors
    const status = error.response?.status;
    const responseData = error.response?.data;

    // Check for FastAPI error format (detail field)
    if (responseData && typeof responseData === 'object' && 'detail' in responseData) {
      return responseData.detail as string;
    }

    // Handle specific status codes
    if (status === 401 || status === 403) {
      return 'Authentication error. Please log in again.';
    }

    if (status === 404) {
      return 'The requested resource was not found.';
    }

    if (status === 422) {
      return 'Invalid data provided. Please check your inputs.';
    }

    if (status === 500) {
      return 'Server error. Please try again later.';
    }

    // Use the Axios error message if available
    if (error.message) {
      return error.message;
    }
  }

  // For non-Axios errors, try to extract message
  if (error instanceof Error) {
    return error.message;
  }

  // Default error message
  return 'An unexpected error occurred. Please try again.';
}

/**
 * A utility to handle API errors consistently across the application
 */
export async function handleApiRequest<T>(
  requestFn: () => Promise<T>,
  onError?: (error: string) => void
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await requestFn();
    return { data, error: null };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    
    // Call the onError callback if provided
    if (onError) {
      onError(errorMessage);
    }
    
    // Log the error to the console
    console.error('API Error:', error);
    
    return { data: null, error: errorMessage };
  }
}

/**
 * Custom hook for tracking loading state during API calls
 */
export function useApiLoading() {
  const [isLoading, setIsLoading] = useState(false);
  
  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    try {
      return await fn();
    } finally {
      setIsLoading(false);
    }
  };
  
  return { isLoading, withLoading };
}

/**
 * Check for API response validation errors
 */
export function hasValidationErrors(error: unknown): boolean {
  if (error instanceof AxiosError && error.response?.status === 422) {
    return true;
  }
  return false;
}

/**
 * Extract validation errors from API response
 */
export function getValidationErrors(error: unknown): Record<string, string[]> {
  if (error instanceof AxiosError && 
      error.response?.status === 422 && 
      error.response.data && 
      typeof error.response.data === 'object' &&
      'detail' in error.response.data) {
      
    const detail = error.response.data.detail;
    if (Array.isArray(detail)) {
      // Convert FastAPI validation error format to field-error mapping
      const errorMap: Record<string, string[]> = {};
      
      detail.forEach((err: any) => {
        if (err.loc && Array.isArray(err.loc) && err.loc.length > 1) {
          const field = err.loc[1];
          if (!errorMap[field]) {
            errorMap[field] = [];
          }
          errorMap[field].push(err.msg);
        }
      });
      
      return errorMap;
    }
  }
  
  return {};
}

export default {
  getErrorMessage,
  handleApiRequest,
  hasValidationErrors,
  getValidationErrors
};