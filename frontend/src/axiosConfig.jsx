import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // local dev
  // baseURL: 'http://<EC2-PUBLIC-IP>:5001', //
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
