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

   const UpdateStandardVaccine = async (vaccineId) => {
    return await api.put(`${API_URL}/put/${vaccineId}`);
  };

  
  const vaccineService = {
    addvaccine,
    getvaccine,
    getvaccineById,
    UpdateStandardVaccine
  };
  
  export default vaccineService;
  