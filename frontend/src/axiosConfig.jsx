import axios from 'axios';

const axiosInstance = axios.create({
  // Create React App inlines REACT_APP_ variables at build time: local development
  // needs nothing
  baseURL: process.env.REACT_APP_API_URL ?? 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
