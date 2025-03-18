import axios from "axios";

// Create axios instance with consistent configuration
const API = axios.create({
    baseURL: "http://localhost:3000/leads", // Updated to match Node.js Express backend routes
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});

// Add request interceptor for logging
API.interceptors.request.use((config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
});

// Add response interceptor for error handling
API.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.statusText}`);
        return response;
    },
    (error) => {
        console.error("API Error:", error.response || error.message);
        return Promise.reject(error);
    }
);

// API service functions
export const LeadAPI = {
    // Get all leads
    getLeads: () => API.get('/'),
    
    // Create a new lead
    createLead: (leadData) => API.post('/api', leadData), // Using the existing /api endpoint
    
    // Get a specific lead
    getLead: (leadId) => API.get(`/${leadId}`),
    
    // Update a lead
    updateLead: (leadId, leadData) => API.put(`/${leadId}`, leadData),
    
    // Delete a lead
    deleteLead: (leadId) => API.delete(`/${leadId}`)
};

export default API;
