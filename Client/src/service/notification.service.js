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

const NotificationService = {
  runNotificationJob,
  getNotificationsByUserId,
};

export default NotificationService;
