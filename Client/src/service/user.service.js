import api from "./api";
console.log(api);

const API_URL = "/user";

const signup = async (userData ) => {
     return await api.post(`${API_URL}/signup`, userData); 
};
console.log("Signup API URL:", API_URL);

const login = async (userData) => {
    return await api.post(`${API_URL}/login`, userData);
}
const userService = {
    signup,
    login,
}
 export default userService;