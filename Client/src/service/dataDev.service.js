import api from "./api";

const API_URL = "/metaDevelop";

const getAllDevelop = async () => {
  return await api.get(`${API_URL}/get-all`);
};

const getDevelopById = async (id) => {
  return await api.get(`${API_URL}/get/${id}`);
};


const getDevelopByCategory = async (category) => {
  return await api.get(`${API_URL}/get-by-category`, { params: { category } });
};

const getDevelopByCategoryAndDetail = async (category, detail) => {
  return await api.get(`${API_URL}/get-by-category-detail`, { params: { category, detail } });
};


const addNewDevelop = async (developData) => {
  return await api.post(`${API_URL}/add`, developData);
};

const updateDevelopById = async (id, updatedData) => {
  return await api.put(`${API_URL}/update/${id}`, updatedData);
};

const deleteDevelopById = async (id) => {
  return await api.delete(`${API_URL}/delete/${id}`);
};

const developDataService = {
  getAllDevelop,
  getDevelopById,
  getDevelopByCategory,
  getDevelopByCategoryAndDetail,
  addNewDevelop,
  updateDevelopById,
  deleteDevelopById,
};

export default developDataService;
