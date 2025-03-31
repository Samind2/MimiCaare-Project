import api from "./api"; // นำเข้า Axios instance
console.log(api);

const API_URL = "/user";

const signup = async (userData) => {
  console.log("User Data being sent:", userData); // แสดงข้อมูลที่กำลังส่งไป
  return await api.post(`${API_URL}/signup`, userData);
};

const login = async (userData) => {
  return await api.post(`${API_URL}/login`, userData);
};

const logout = async () => {
  return await api.post(`${API_URL}/logout`);
};

const updateProfile = async (userData) => {
  return await api.put(`${API_URL}/update`, userData);
};

const userService = {
  signup,
  login,
  logout,
  updateProfile,
};

export default userService;
