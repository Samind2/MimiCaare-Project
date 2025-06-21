import api from "./api";

const API_URL = "/receiveDevelop";

// เพิ่มข้อมูลพัฒนาการที่ได้รับจากพัฒนาการมาตรฐาน
const addReceiveDevelop = (data) => {
  return api.post(`${API_URL}/add`, data);
};

// แก้ไขสถานะพัฒนาการ 
const updateReceiveDevelop = (id, statusUpdates) => {
  return api.put(`${API_URL}/update/${id}`, { statusUpdates });
};

// 3. ดึงข้อมูลพัฒนาการที่เคยบันทึกของเด็กห
const getReceiveDevelopByChildId = (childId) => {
  return api.get(`${API_URL}/getById/${childId}`);
};

const receiveDevelopService = {
  addReceiveDevelop,
  updateReceiveDevelop,
  getReceiveDevelopByChildId,
};

export default receiveDevelopService;
