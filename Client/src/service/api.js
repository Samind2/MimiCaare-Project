import axios from "axios";
const baseURL = import.meta.env.VITE_BASE_URL;
console.log("VITE_BASE_URL:", baseURL);
const instance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;