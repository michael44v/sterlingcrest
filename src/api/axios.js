import axios from 'axios';

const instance = axios.create({
 // baseURL: 'http://localhost:80/backend/northbridge/api.php',


  baseURL: 'https://bluevult.com/api/sterlingbank/api.php',
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message?.includes('Token expired')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin?expired=true';
      } else {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
