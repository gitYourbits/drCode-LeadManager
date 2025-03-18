import React, { useState, useEffect } from "react";
import { getLeads, postAPI } from "../services/api.js";
import LeadForm from "./components/LeadForm";
import LeadDashboard from "./components/LeadDashboard";

const App = () => {
  const [leads, setLeads] = useState([]);

  // Fetch leads from the backend
  useEffect(() => {
    getLeads()
      .then((response) => {
        setLeads(response.data);
      })
      .catch((error) => {
        console.error("Error fetching leads:", error);
      });
  }, []);

  // Handle form submission
  const handleLeadSubmit = (leadData) => {
    postAPI(leadData)
      .then(() => {
        alert("Lead submitted successfully!");
        setLeads((prevLeads) => [...prevLeads, leadData]);
      })
      .catch((error) => {
        console.error("Error submitting lead:", error);
      });
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-dark">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark w-100 position-absolute top-0 px-4">
        <a className="navbar-brand text-black fw-bold" href="#">
          <h1>Real Estate Lead Management</h1>
        </a>
      </nav>

      {/* Form Container */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <LeadForm onSubmit={handleLeadSubmit} />
          </div>
        </div>
      </div>

      {/* Leads Dashboard */}
      <div className="container mt-4">
        <LeadDashboard leads={leads} />
      </div>
    </div>
  );
};

export default App;
