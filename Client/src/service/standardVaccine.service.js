import api from "./api";

const API_URL = "/standardVaccine";

const addvaccine = async (vaccineData) => {
    return await api.post(`${API_URL}/add`, vaccineData, {
    });
  };

  const getvaccine = async () => {
    return await api.get(`${API_URL}/all`);
  };
  
  const getvaccineById = async (vaccineId) => {
    return await api.get(`${API_URL}/get/${vaccineId}`);
  };

   const UpdateStandardVaccine = async (vaccineId, vaccineData) => {
    return await api.put(`${API_URL}/update/${vaccineId}` , vaccineData);
  };

   const DeleteStandardVaccine = async (vaccineId) => {
    return await api.delete(`${API_URL}/delete/${vaccineId}`);
  };

  
  const vaccineService = {
    addvaccine,
    getvaccine,
    getvaccineById,
    UpdateStandardVaccine,
    DeleteStandardVaccine
  };
  
  export default vaccineService;
  