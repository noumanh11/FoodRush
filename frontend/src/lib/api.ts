import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(Array.isArray(message) ? message[0] : message));
  },
);

export default api;

// Auth
export const authApi = {
  register: (data: { email: string; password: string; name: string; role?: string; phone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Restaurants
export const restaurantsApi = {
  getAll: () => api.get('/restaurants'),
  getOne: (id: string) => api.get(`/restaurants/${id}`),
  getMy: () => api.get('/restaurants/my'),
  create: (data: object) => api.post('/restaurants', data),
  update: (id: string, data: object) => api.patch(`/restaurants/${id}`, data),
};

// Menus
export const menusApi = {
  getByRestaurant: (restaurantId: string) => api.get(`/restaurants/${restaurantId}/menu`),
  create: (restaurantId: string, data: object) =>
    api.post(`/restaurants/${restaurantId}/menu`, data),
  update: (id: string, data: object) => api.patch(`/menu/${id}`, data),
  remove: (id: string) => api.delete(`/menu/${id}`),
};

// Orders
export const ordersApi = {
  create: (data: object) => api.post('/orders', data),
  getMy: () => api.get('/orders/my'),
  getRestaurantOrders: (restaurantId: string) =>
    api.get(`/orders/restaurant/${restaurantId}`),
  getAllAdmin: () => api.get('/orders/admin/all'),
  getOne: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
  cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
};

// Chatbot
export const chatbotApi = {
  send: (message: string) => api.post('/chatbot/message', { message }),
};