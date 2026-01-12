// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true // Important for cookie-based auth
});

// Auth
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

// Gigs
export const getGigs = async (search = '') => {
  const { data } = await api.get('/gigs', { params: { search } });
  return data;
};

export const createGig = async (gigData) => {
  const { data } = await api.post('/gigs', gigData);
  return data;
};

// Bids
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

// Dashboard APIs
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

// Message APIs
export const sendMessage = async (gigId, text) => {
  const { data } = await api.post('/messages', { gigId, text });
  return data;
};

export const getMessages = async (gigId) => {
  const { data } = await api.get(`/messages/${gigId}`);
  return data;
};

export default api;