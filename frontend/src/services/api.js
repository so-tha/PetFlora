import axios from 'axios';

const API_URL = '/api/plants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const plantsAPI = {
  getAll: () => api.get('/'),
  getToxic: () => api.get('/toxic'),
  getNonToxic: () => api.get('/non-toxic'),
  search: (query) => api.get('/search', { params: { q: query } }),
  getById: (id) => api.get(`/${id}`),
  getStats: () => api.get('/stats'),
  filterByFamily: (family) => api.get('/family', { params: { family } }),
};

export default api;
