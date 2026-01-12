import axios from 'axios';

// 1. Get the URL from environment variables
// Using a fallback directly to the Render URL ensures that if Vercel fails 
// to load the Env Var, it still points to the correct backend.
const baseURL = import.meta.env.VITE_API_URL || 'https://gigflow-icoc.onrender.com/api';

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true 
});

// 2. REQUEST INTERCEPTOR (Debug Helper)
api.interceptors.request.use(config => {
  // Logs the full URL in the console so you can verify it's hitting Render, not Vercel
  console.log(`📡 Sending ${config.method.toUpperCase()} to: ${config.baseURL}${config.url}`);
  return config;
});

// 3. RESPONSE INTERCEPTOR (The fix for your TypeError)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // This specific check prevents "Cannot read properties of null (reading 'status')"
    // It handles cases where the server is down, sleeping, or the URL is wrong.
    if (!error.response) {
      console.error("❌ Network Error: The server is not responding. It might be sleeping on Render.");
      return Promise.reject({
        message: "Server is waking up. Please refresh in 30 seconds.",
        status: 0
      });
    }
    return Promise.reject(error);
  }
);

// --- Auth APIs ---
export const register = async (name, email, password) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
};

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const logout = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

// --- Gigs APIs ---
export const getGigs = async (search = '') => {
  try {
    const { data } = await api.get('/gigs', { params: { search } });
    return data;
  } catch (error) {
    // Re-throwing so Home.jsx catch block can catch it
    throw error;
  }
};

export const createGig = async (gigData) => {
  const { data } = await api.post('/gigs', gigData);
  return data;
};

// --- Bids APIs ---
export const createBid = async (bidData) => {
  const { data } = await api.post('/bids', bidData);
  return data;
};

export const getBidsForGig = async (gigId) => {
  const { data } = await api.get(`/bids/${gigId}`);
  return data;
};

export const hireBid = async (bidId) => {
  const { data } = await api.patch(`/bids/${bidId}/hire`);
  return data;
};

// --- Dashboard APIs ---
export const getMyPostedGigs = async () => {
  const { data } = await api.get('/gigs/my-posted');
  return data;
};

export const getMyAssignedGigs = async () => {
  const { data } = await api.get('/bids/assigned/me');
  return data;
};

export const getMyApplications = async () => {
  const { data } = await api.get('/bids/applications/me');
  return data;
};

export const completeGig = async (gigId) => {
  const { data } = await api.patch(`/gigs/${gigId}/complete`);
  return data;
};

// --- Message APIs ---
export const sendMessage = async (gigId, text) => {
  const { data } = await api.post('/messages', { gigId, text });
  return data;
};

export const getMessages = async (gigId) => {
  const { data } = await api.get(`/messages/${gigId}`);
  return data;
};

export default api;