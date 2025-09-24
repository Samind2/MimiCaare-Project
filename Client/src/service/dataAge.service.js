import api from "./api";

const API_URL = "/metaAgeRange";

const getAllAgeRanges = async () => {
  return await api.get(`${API_URL}/get-all`);
};

const getAgeRangeById = async (id) => {
  return await api.get(`${API_URL}/get/${id}`);
};

const addNewAgeRange = async (ageRangeData) => {
  return await api.post(`${API_URL}/add`, ageRangeData);
};

const updateAgeRangeById = async (id, updatedData) => {
  return await api.put(`${API_URL}/update/${id}`, updatedData);
};

const deleteAgeRangeById = async (id) => {
  return await api.delete(`${API_URL}/delete/${id}`);
};

const ageRangeService = {
  getAllAgeRanges,
  getAgeRangeById,
  addNewAgeRange,
  updateAgeRangeById,
  deleteAgeRangeById,
};

export default ageRangeService;
