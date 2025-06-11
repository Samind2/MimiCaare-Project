import api from "./api";

const API_URL = "/standardDevelop";

const addStandardDev = async (DevData) => {
    return await api.post(`${API_URL}/add`, DevData, {
    });
    }
const getDevelop = async () => {
    return await api.get(`${API_URL}/all`);
}

// const deleteStandardDev = async (id) => {
//     return await api.delete(`${API_URL}/delete/${id}`);
// }
const deleteStandardDev = async (id) => {
  return await api.delete(`${API_URL}/delete/${id}`);
}

      const standardDevService = {
    addStandardDev,
    getDevelop,
    deleteStandardDev

  };
  
  export default standardDevService;