import React, { useState } from "react";
import { postAPI } from "../../services/api";

const LeadForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    propertyType: "",
    budget: "",
    urgency: "1",
    location: "",
    specificProperty: "No",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const categorizeLead = (data) => {
    const budget = parseInt(data.budget?.replace(/,/g, ""), 10) || 0;
    const property_cost = 0.2 * budget;
    const potential_profit = budget - property_cost;
    return potential_profit;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    const leadCategory = categorizeLead(formData);
    const assignedLead = { ...formData, category: leadCategory };

    onSubmit(assignedLead);
    console.log("Lead Submitted:", assignedLead);

    window.alert("Lead submitted successfully!");
    const response = await postAPI(assignedLead);

    setFormData({
      name: "",
      phone: "",
      email: "",
      propertyType: "",
      budget: "",
      urgency: "1", // Reset to default
      location: "",
      specificProperty: "No",
    });


  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
        <h2 className="text-center text-white text-2xl mb-4">🏡 Add a Lead</h2>
        <form onSubmit={handleSubmit}>
          {[
            { name: "name", placeholder: "Full Name" },
            { name: "phone", placeholder: "Phone Number" },
            { name: "email", placeholder: "Email Address", type: "email" },
            { name: "propertyType", placeholder: "Property Type (Apartment, Villa, etc.)" },
            { name: "budget", placeholder: "Budget (₹)" },
            { name: "location", placeholder: "Preferred Location" },
          ].map(({ name, placeholder, type = "text" }) => (
            <div key={name} className="mb-3">
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={formData[name]}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}

          {/* Urgency Dropdown */}
          <div className="mb-3">
            <label className="text-white block mb-1">Urgency Level</label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="5">Highly Likely</option>
              <option value="4">Likely</option>
              <option value="3">Neutral</option>
              <option value="2">Unlikely</option>
              <option value="1">Least Likely</option>
            </select>
          </div>

          {/* Specific Property Dropdown */}
          <div className="mb-3">
            <label className="text-white block mb-1">Specific Property in Mind?</label>
            <select
              name="specificProperty"
              value={formData.specificProperty}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Submit Lead 🚀
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
