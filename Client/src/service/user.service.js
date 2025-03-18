import api from "./api";
const API_URL = "/user";

const getAllUser = async () => {
     return await api.get(`${API_URL}`); 
};
const userService = {
    getAllUser,
}
 export default userService;
