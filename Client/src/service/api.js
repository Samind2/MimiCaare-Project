import axios from "axios";
const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000'; // กำหนด URL สำรองถ้าค่าจาก .env ไม่ถูกต้อง
console.log("VITE_BASE_URL:", baseURL);
import TokenService from "./token.service";

const instance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,  // เปลี่ยนเป็น withCredentials: true
});

instance.interceptors.request.use(
  (config) => {
    const token = TokenService.getLocalAccessToken();
    if (token) {
      config.headers["x-access-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
