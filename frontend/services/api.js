import axios from "axios";

const BASE_URI = "http://localhost:3000"; // Ensure this matches your backend port

const API = axios.create({
    baseURL: BASE_URI
});

export const postAPI = async (data) => {
    return API.post('/leads/api', data);
};

export const getLeads = async () => {
    return API.get('/leads'); // Fetch leads
};
