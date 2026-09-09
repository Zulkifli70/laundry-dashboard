import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const outletAPI = {
  getAll: () => api.get('/outlets'),
  create: (data) => api.post('/outlets', data),
  update: (id, data) => api.put(`/outlets/${id}`, data),
  delete: (id) => api.delete(`/outlets/${id}`),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const layananAPI = {
  getAll: () => api.get('/layanan'),
  create: (data) => api.post('/layanan', data),
  update: (id, data) => api.put(`/layanan/${id}`, data),
  delete: (id) => api.delete(`/layanan/${id}`),
};

export const transaksiAPI = {
  getAll: (params) => api.get('/transaksi', { params }),
  getById: (id) => api.get(`/transaksi/${id}`),
  create: (data) => api.post('/transaksi', data),
  update: (id, data) => api.put(`/transaksi/${id}`, data),
  delete: (id) => api.delete(`/transaksi/${id}`),
  export: (params) => api.get('/transaksi/export', { params, responseType: 'blob' }),
};

export const pengeluaranAPI = {
  getAll: (params) => api.get('/pengeluaran', { params }),
  create: (data) => api.post('/pengeluaran', data),
  update: (id, data) => api.put(`/pengeluaran/${id}`, data),
  delete: (id) => api.delete(`/pengeluaran/${id}`),
};

export const stokAPI = {
  getAll: (params) => api.get('/stok', { params }),
  create: (data) => api.post('/stok', data),
  update: (id, data) => api.put(`/stok/${id}`, data),
  delete: (id) => api.delete(`/stok/${id}`),
  adjust: (id, data) => api.put(`/stok/${id}/adjust`, data),
  getLog: (id) => api.get(`/stok/${id}/log`),
};

export default api;
