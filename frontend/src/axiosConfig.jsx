import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:5001', // local dev
  baseURL: 'http://3.26.65.198:5001', // EC2 deployment
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
