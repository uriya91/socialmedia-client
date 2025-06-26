import axios from 'axios';
import { auth } from '../auth/firebaseConfig';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});


api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    config.headers['x-user-id'] = user.uid;
    config.headers['Authorization'] = `Bearer ${await user.getIdToken()}`;
  }
  return config;
});

export default api;
