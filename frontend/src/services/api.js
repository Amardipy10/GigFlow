import axios from 'axios';

// Get the URL from environment variables
const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  // FIX: Removed the || '/api' fallback. 
  // In production, Vite needs the absolute URL to find your Render backend.
  baseURL: baseURL,
  withCredentials: true 
});

// DEBUG HELPER: This interceptor logs the exact URL being called in the console.
// This will help you see if a request is going to Vercel (wrong) or Render (right).
api.interceptors.request.use(config => {
  if (import.meta.env.DEV) {
    console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

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
  // Added try/catch safety within the service layer
  try {
    const { data } = await api.get('/gigs', { params: { search } });
    return data;
  } catch (error) {
    console.error("Error in getGigs service:", error);
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