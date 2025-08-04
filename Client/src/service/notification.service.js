import api from "./api";

const API_URL = "/notify";

// เรียกฟังก์ชันแจ้งเตือน 3/7 วัน 
const runNotificationJob = () => {
  return api.get(`${API_URL}/test`);
};

// ดึงการแจ้งเตือนทั้งหมดของผู้ใช้
const getNotificationsByUserId = () => {
  return api.get(`${API_URL}/get`);
};

// ทำเครื่องหมายว่าอ่านแล้วเฉพาะรายการเดียว
const markAsRead = (id) => {
  return api.put(`${API_URL}/read/${id}`);
};

// ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
const markAllAsRead = () => {
  return api.put(`${API_URL}/read-all`);
};

const NotificationService = {
  runNotificationJob,
  getNotificationsByUserId,
  markAsRead,
  markAllAsRead
};

export default NotificationService;
