import api from "./api";

const API_URL = "/children";

const addChild = async (childData) => {
  return await api.post(`${API_URL}/add`, childData, {
  });
};

const getChildren = async () => {
  return await api.get(`${API_URL}/get`);
};

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
