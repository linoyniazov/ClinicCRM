import axios, {CanceledError, AxiosError} from 'axios';
export { CanceledError };
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const isAuthRoute = config.url?.includes('/auth/');
    
    if (isAuthRoute) {
      console.log('Interceptor: Auth route detected, skipping token');
      return config;
    }
    
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    
    const token = localStorage.getItem('token');
    console.log('Interceptor: Token from storage:', token ? 'Exists' : 'Missing');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Interceptor: Authorization Header set');
    } else {
      console.warn('Interceptor: No token found, sending request without Authorization header');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthRoute = error.config?.url?.includes('/auth/');
    
    if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthRoute) {
      console.error(`API Error ${error.response.status}: Unauthorized/Forbidden - Token expired or invalid`);
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Cleared token and user from localStorage');
      
      if (window.location.pathname !== '/login') {
        console.log('Redirecting to login page...');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
