// src/services/api.ts
import axios from 'axios';

// Base configuration for API requests
const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance for API endpoints
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Define TypeScript interfaces based on backend models
export interface User {
  userId: number;
  email: string;
  profile?: UserProfile;
  preferences?: UserPreferences;
  favourites?: string[];
  savedTrips?: Record<string, TripDetails>;
  cluster?: number;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  gender?: string;
  ageGroup?: number;
  location?: string;
  job?: string;
}

export interface UserPreferences {
  userId?: number;
  environments?: string[];
  food?: string[]; // Note: Always use 'food' to match the API
  activities?: string[];
}

export interface LocationData {
  locationId: number;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  category?: string[];
  description?: string;
  rating?: number;
}

export interface RatingData {
  avgRating: number;
  totalRatings: number;
  ratings: {
    userId: number;
    rating: number;
    locationId: number;
  }[];
}

export interface RatingModel {
  userId: number;
  locationId: number; // Always use locationId, not itemId
  rating: number;
}

export interface TripDetails {
  tripId: string;
  name: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  itinerary?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ProfileUpdateModel {
  userId: number;
  firstName?: string;
  lastName?: string;
  gender?: string;
  ageGroup?: number;
  location?: string;
  job?: string;
}

export interface FavouritesOperation {
  operation: 'add' | 'remove';
  place: string;
}

export interface FavouritesRequest {
  operations: FavouritesOperation[];
}

export interface RecommendationsRequest {
  userId: number | null;
  userInput: string | null;
  n: number;
}

export interface RecommendationModel {
  locationId: number;
  name: string;
  category?: string[];
  address?: string;
  city?: string;
  country: string;
  itemRating?: number;
}

// Authentication services
export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await api.post('/users/auth/login', { 
        email, 
        password 
      });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  async register(firstName: string, lastName: string, email: string, password: string) {
    try {
      const response = await api.post('/users/auth/register', { 
        firstName, 
        lastName, 
        email, 
        password 
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// User profile and preferences services
export const userService = {
  async getUserProfile(userId: number): Promise<User> {
    try {
      const response = await api.get(`/users/get-user-details`, {
        params: { userId: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },
  
  async updateProfile(userId: number, profileData: Partial<ProfileUpdateModel>) {
    try {
      const updateData: ProfileUpdateModel = {
        userId,
        ...profileData
      };
      
      const response = await api.patch('/users/profile', updateData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
  
  async updatePreferences(userId: number, preferences: UserPreferences) {
    try {
      const response = await api.patch(`/users/update-preferences`, {
        ...preferences,
        user_id: userId
      }, {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  },
  
  async updateFavourites(userId: number, operations: FavouritesOperation[]) {
    try {
      const request: FavouritesRequest = { operations };
      
      const response = await api.patch(`/users/update-favourites`, request, {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Update favorites error:', error);
      throw error;
    }
  },
  
  async addTrip(userId: number, tripData: TripDetails) {
    try {
      const response = await api.post(`/users/add-trip`, tripData, {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Add trip error:', error);
      throw error;
    }
  },
  
  async updateTrip(userId: number, tripData: TripDetails) {
    try {
      const response = await api.patch(`/users/update-trip`, tripData, {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Update trip error:', error);
      throw error;
    }
  },
  
  async deleteTrip(userId: number, tripId: string) {
    try {
      const response = await api.delete(`/users/delete-trip`, {
        params: { user_id: userId, trip_id: tripId }
      });
      return response.data;
    } catch (error) {
      console.error('Delete trip error:', error);
      throw error;
    }
  },

  async getUserTrips(userId: number): Promise<TripDetails[]> {
    try {
      // Since there's no direct endpoint, get trips from user profile
      const user = await this.getUserProfile(userId);
      if (user.savedTrips) {
        return Object.values(user.savedTrips);
      }
      return [];
    } catch (error) {
      console.error('Get user trips error:', error);
      throw error;
    }
  }
};

// Location and recommendation services
export const locationService = {
  async getLocationById(locationId: number): Promise<LocationData> {
    try {
      const response = await api.get(`/locations/id`, {
        params: { locationId }
      });
      return response.data;
    } catch (error) {
      console.error('Get location by ID error:', error);
      throw error;
    }
  },
  
  async getLocationByName(name: string): Promise<LocationData> {
    try {
      const response = await api.get(`/locations/name`, {
        params: { name: encodeURIComponent(name) }
      });
      return response.data;
    } catch (error) {
      console.error('Get location by name error:', error);
      throw error;
    }
  }
};

// Recommendation services
export const recommendationService = {
  async getRecommendations(userId: number | null, keyword: string | null, count: number = 10): Promise<LocationData[]> {
    try {
      const request: RecommendationsRequest = {
        userId,
        userInput: keyword,
        n: count
      };
      
      const response = await api.post('/recommendations/', request);
      return response.data;
    } catch (error) {
      console.error('Get recommendations error:', error);
      throw error;
    }
  },
  
  async getUserRatings(userId: number): Promise<RatingModel[]> {
    try {
      const response = await api.get(`/recommendations/ratings/user`, {
        params: { user_id: userId }
      });
      return response.data || [];
    } catch (error) {
      console.error('Get user ratings error:', error);
      throw error;
    }
  },

  async updateUserRating(userId: number, locationId: number, rating: number) {
    try {
      const response = await api.patch('/recommendations/ratings/user', { 
        userId: userId,
        locationId: locationId,
        rating: rating
      });
      return response.data;
    } catch (error) {
      console.error('Update user ratings error:', error);
      throw error;
    }
  },

  async updateUserFavourites(userId: number, operation: string, place: string) {
    try {
      const response = await api.patch('/users/update-favourites', {
        userId,
        params: {
          operations: [{ operation, place }]
        }
      });
      return response.data;
    } catch (error) {
      console.error('Update user favourites error:', error);
      throw error;
    }
  },
  
  async rateDestination(userId: number, locationId: number, rating: number) {
    try {
      const ratingData = { userId, locationId, rating };
      const response = await api.post('/recommendations/ratings/user', ratingData);
      return response.data;
    } catch (error) {
      console.error('Rate destination error:', error);
      throw error;
    }
  },
  
  async updateRating(userId: number, locationId: number, rating: number) {
    try {
      const ratingData = { userId, locationId, rating };
      const response = await api.patch('/recommendations/ratings/user', ratingData);
      return response.data;
    } catch (error) {
      console.error('Update rating error:', error);
      throw error;
    }
  },
  
  async deleteRating(userId: number, locationId: number) {
    try {
      const response = await api.delete(`/recommendations/ratings/user`, {
        params: { user_id: userId, item_id: locationId }
      });
      return response.data;
    } catch (error) {
      console.error('Delete rating error:', error);
      throw error;
    }
  },
  
  async getLocationRatings(locationId: number) {
    try {
      const response = await api.get(`/recommendations/ratings/destination`, {
        params: { location_id: locationId }
      });
      return response.data;
    } catch (error) {
      console.error('Get location ratings error:', error);
      throw error;
    }
  }
};

// Export services
export { api };