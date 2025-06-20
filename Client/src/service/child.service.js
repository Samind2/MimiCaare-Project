import api from "./api";

const API_URL = "/children";

// ฟังก์ชันสำหรับเพิ่มเด็ก
const addChild = async (childData) => {
  return await api.post(`${API_URL}/add`, childData, {
  });
};

// ฟังก์ชันสำหรับดึงข้อมูลเด็กทั้งหมด
const getChildren = async () => {
  return await api.get(`${API_URL}/get`);
};

// ฟังก์ชันสำหรับดึงข้อมูลเด็กตาม ID
const getChildById = async (childId) => {
  return await api.get(`${API_URL}/get/${childId}`);
};


const updateChild = async (childId, childData) => {
  return await api.put(`${API_URL}/update/${childId}`, childData);
};

const childService = {
  addChild,
  getChildren,
  getChildById,
  updateChild,
};

export default childService;
