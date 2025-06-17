import api from "./api"; // นำเข้า Axios instance
console.log(api);

const API_URL = "/user"; // กำหนด URL สำหรับ API ของผู้ใช้ 

// ฟังก์ชันสำหรับลงทะเบียนผู้ใช้
const signup = async (userData) => {
  //console.log("User Data being sent:", userData); 
  return await api.post(`${API_URL}/signup`, userData);
};

// ฟังก์ชันสำหรับเข้าสู่ระบบผู้ใช้
const login = async (userData) => {
  return await api.post(`${API_URL}/login`, userData);
};

// ฟังก์ชันสำหรับออกจากระบบผู้ใช้
const logout = async () => {
  return await api.post(`${API_URL}/logout`);
};

// ฟังก์ชันสำหรับอัปเดตโปรไฟล์ผู้ใช้
const updateProfile = async (userData) => {
  return await api.put(`${API_URL}/update`, userData);
};

//รวมไว้ใน object เดียว เพื่อเรียกใช้งานได้ง่าย 
const userService = {
  signup,
  login,
  logout,
  updateProfile,
};

export default userService;