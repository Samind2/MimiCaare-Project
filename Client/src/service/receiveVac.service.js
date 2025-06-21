import api from "./api";

const API_URL = "/receiveVaccine";

const addFromStandard = (data) => {
  return api.post(`${API_URL}/from-standard`, data);
};

const addCustom = (data) => {
  return api.post(`${API_URL}/custom`, data);
};

const updateById = (id, data) => {
  return api.put(`${API_URL}/${id}`, data);
};

const deleteById = (id) => {
  return api.delete(`${API_URL}/${id}`);
};

const getAll = () => {
  return api.get(`${API_URL}/all`);
};

const getById = (id) => {
  return api.get(`${API_URL}/get/${id}`);
};

const getByChildId = (childId) => {
  return api.get(`${API_URL}/children/${childId}`);
};

export default {
  addFromStandard,
  addCustom,
  updateById,
  deleteById,
  getAll,
  getById,
  getByChildId,
};
