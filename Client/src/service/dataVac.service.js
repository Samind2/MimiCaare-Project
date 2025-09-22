import api from "./api";

const API_URL = "/metaVaccine";

const getAllVaccines = () => {
  return api.get(`${API_URL}/get-all`);
};

const getVaccineById = (id) => {
  return api.get(`${API_URL}/get/${id}`);
};

const addNewVaccine = (data) => {
  return api.post(`${API_URL}/add`, data);
};

const updateVaccineById = (id, data) => {
  return api.put(`${API_URL}/update/${id}`, data);
};

const deleteVaccineById = (id) => {
  return api.delete(`${API_URL}/delete/${id}`);
};

const vaccineService = {
  getAllVaccines,
  getVaccineById,
  addNewVaccine,
  updateVaccineById,
  deleteVaccineById,
};

export default vaccineService;
