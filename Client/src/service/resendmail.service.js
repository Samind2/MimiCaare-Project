import api from "./api";

const API_URL = "/send-mail";

const sendMail = (data) => {
  return api.post(`${API_URL}/from-standard`, data);
};


const sendPasswordToMail = (data) => {
    return api.put(`${API_URL}/send-password`, data);
}

export default {
  sendMail,
  sendPasswordToMail,
};