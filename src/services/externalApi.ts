// src/services/externalApi.ts
import axios from 'axios';

const externalApi = axios.create({
  baseURL: 'https://tourism-recommendation-system.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const register = async (email: string, password: string, firstName: string, lastName: string) => {
  const res = await externalApi.post('/users/auth/register', {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
  });
  return res.data;
};


export const login = async (email: string, password: string) => {
  const res = await externalApi.post('/users/auth/login', {
    email: email,
    password: password,
  });
  return res.data;
};

export const getUserInfo = async (userId: string) => {
  const res = await externalApi.get(`/users/get-user-details`, {
    params: {
      userId: userId,
    }
  });
  return res.data;
};

export const getRecommendations = async (userId: string | null, userInput: string | null) => {
  console.log(userId, userInput)
  const res = await externalApi.post(`/recommendations/`, {
    userId: userId,
    userInput: userInput || null,
    n: 10
  });
  return res.data;
};

// export const searchDestinations = async (userId: string, keyword: string) => {
//   const res = await externalApi.post(`/recommendations/`, {
//     params: {
//       userId: userId || null,
//       userInput: keyword || null,
//       n: 10
//     },
//   });
//   return res.data;
// };

export const getLocationDetail = async (locationId: number) => {
  const res = await externalApi.get(`/locations/id`, {
    params: {
      locationId: locationId,
    },
  });
  return res.data;
}

export const getLocationRatings = async (locationId: number) => {
  const res = await externalApi.get("/recommendations/ratings/destination", {
    params: {
      location_id: locationId
    },
  });
  return res.data;
}

export const rateDestination = async (userId: number, locationId: number, rating: number) => {
  const res = await externalApi.patch('/recommendations/ratings/user', {
    userId: userId,
    locationId: locationId,
    rating: rating,
  });
  return res.data;
};

export const getSavedTrips = async (userId: string) => {
  const res = await externalApi.get(`/users/get_saved_trips`, {
    params: {
      userId: userId,
    },
  });
  return res.data.saved_trips;
};

export const saveTrip = async ({
  userId,
  tripName,
  destinations,
}: {
  userId: string;
  tripName: string;
  destinations: string[];
}) => {
  const res = await externalApi.post('/users/save_trip', {
    user_id: userId,
    trip_name: tripName,
    destinations,
  });
  return res.data;
};
export const getDestinationRating = async (locationId: number) => {
  const res = await externalApi.get("/recommendations/ratings/destination", {
    params: { location_id: locationId },
  });
  return res.data?.average || 0;
};

export const getUserRatings = async (userId: string) => {
  const res = await externalApi.get("/recommendations/ratings/user", {
    params: { userId },
  });
  return res.data?.ratings || [];
};

export const updateUserRating = async ({
  userId,
  itemId,
  rating,
}: {
  userId: number;
  itemId: number;
  rating: number;
}) => {
  const res = await externalApi.patch("/recommendations/ratings/user", {
    userId,
    locationId: itemId,
    rating,
  });
  return res.data;
};

export const updateUserDetails = async (userId: string, profile: any) => {
  const res = await externalApi.put(`/users/${userId}`, { profile });
  return res.data;
}