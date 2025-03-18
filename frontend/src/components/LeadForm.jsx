import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { LeadAPI } from "../services/api";

const LeadForm = ({ onLeadSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    budget: "",
    urgency: "3",
    propertyType: "Apartment",
    location: "",
    specificProperty: "No",
    showOptionalQuestions: false,
    intentQuestions: {
      timeframe: "3-6 months",
      financing: "Not Sure",
      viewedProperties: "0-5"
    },
    sentimentQuestions: {
      motivationFactor: "balanced",
      decisionStyle: "balanced"
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNestedInputChange = (category, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [category]: {
        ...prevData[category],
        [field]: value
      }
    }));
  };

  const toggleOptionalQuestions = () => {
    setFormData((prevData) => ({
      ...prevData,
      showOptionalQuestions: !prevData.showOptionalQuestions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting lead data:", formData);
      const response = await LeadAPI.createLead(formData);
      console.log("Lead submitted successfully:", response.data);
      
      // Call the provided callback with the new lead data
      onLeadSubmit({
        ...formData,
        id: response.data.id || response.data._id || `lead-${Date.now()}`, // Use API response ID if available
        lead_score: response.data.score || Math.floor(Math.random() * 5) + 1, // Fallback score if API doesn't return one
        createdAt: new Date().toISOString()
      });
      
      // Reset form data
      setFormData({
        name: "",
        email: "",
        phone: "",
        budget: "",
        urgency: "3",
        propertyType: "Apartment",
        location: "",
        specificProperty: "No",
        showOptionalQuestions: false,
        intentQuestions: {
          timeframe: "3-6 months",
          financing: "Not Sure",
          viewedProperties: "0-5"
        },
        sentimentQuestions: {
          motivationFactor: "balanced",
          decisionStyle: "balanced"
        }
      });
      
      toast.success("Lead submitted successfully!");
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error("Error submitting lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold mb-4 text-slate-700">Submit New Lead</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Information */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div>
              <label className="block text-slate-700 font-medium mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-2" htmlFor="phone">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800"
                placeholder="+91 1234567890"
              />
            </div>
          </motion.div>

          {/* Property Details */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div>
              <label className="block text-slate-700 font-medium mb-2" htmlFor="budget">
                Budget (in ₹)
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800"
                placeholder="50000"
                min="1000"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-2" htmlFor="propertyType">
                Property Type
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800 bg-white"
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Townhouse">Townhouse</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Farmhouse">Farmhouse</option>
              </select>
            </div>
            
            <div>
              <label className="block text-slate-700 font-medium mb-2" htmlFor="location">
                Preferred Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800"
                placeholder="Delhi"
              />
            </div>
          </motion.div>
        </div>
        
        {/* Urgency & Specific Property */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div>
            <label className="block text-slate-700 font-medium mb-2" htmlFor="urgency">
              How urgently are you looking to buy?
            </label>
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800 bg-white"
            >
              <option value="1">Just Browsing</option>
              <option value="2">Within a Year</option>
              <option value="3">3-6 Months</option>
              <option value="4">1-3 Months</option>
              <option value="5">Highly Likely</option>
            </select>
          </div>
          
          <div>
            <label className="block text-slate-700 font-medium mb-2" htmlFor="specificProperty">
              Interested in a specific property?
            </label>
            <select
              id="specificProperty"
              name="specificProperty"
              value={formData.specificProperty}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800 bg-white"
            >
              <option value="No">No specific property in mind</option>
              <option value="Yes">Yes, I have a specific property</option>
            </select>
          </div>
        </motion.div>
        
        {/* Optional Questions Toggle */}
        <motion.div 
          className="pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button
            type="button"
            onClick={toggleOptionalQuestions}
            className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center transition-colors"
          >
            <svg 
              className={`w-5 h-5 mr-2 transform transition-transform ${formData.showOptionalQuestions ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
            {formData.showOptionalQuestions ? "Hide Optional Questions" : "Show Optional Questions"}
          </button>
        </motion.div>
        
        {/* Optional Questions */}
        <AnimatePresence>
          {formData.showOptionalQuestions && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-6">
                <h3 className="text-lg font-medium text-slate-700 border-b border-slate-200 pb-2">Optional Questions</h3>
                
                {/* Intent Questions */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-700">Purchase Timeline</h4>
                  
                  <div>
                    <label className="block text-slate-600 mb-2" htmlFor="timeframe">
                      What is your expected timeframe for making a purchase?
                    </label>
                    <select
                      id="timeframe"
                      value={formData.intentQuestions.timeframe}
                      onChange={(e) => handleNestedInputChange("intentQuestions", "timeframe", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800 bg-white"
                    >
                      <option value="Immediate">Immediate (within 1 month)</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6-12 months">6-12 months</option>
                      <option value="Just researching">Just researching, no timeframe</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-slate-600 mb-2" htmlFor="financing">
                      What is your current financing status?
                    </label>
                    <select
                      id="financing"
                      value={formData.intentQuestions.financing}
                      onChange={(e) => handleNestedInputChange("intentQuestions", "financing", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800 bg-white"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Not Sure">Not Sure</option>
                      <option value="Pre-Approved">Pre-Approved</option>
                      <option value="Fully Financed">Fully Financed</option>
                      <option value="Cash Buyer">Cash Buyer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-slate-600 mb-2" htmlFor="viewedProperties">
                      How many properties have you viewed so far?
                    </label>
                    <select
                      id="viewedProperties"
                      value={formData.intentQuestions.viewedProperties}
                      onChange={(e) => handleNestedInputChange("intentQuestions", "viewedProperties", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800 bg-white"
                    >
                      <option value="0-5">0-5 properties</option>
                      <option value="6-10">6-10 properties</option>
                      <option value="11-20">11-20 properties</option>
                      <option value="20+">More than 20 properties</option>
                    </select>
                  </div>
                </div>
                
                {/* Sentiment Questions */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-700">Your Decision Style</h4>
                  
                  <div>
                    <label className="block text-slate-600 mb-2" htmlFor="motivationFactor">
                      What factor motivates your property purchase most?
                    </label>
                    <select
                      id="motivationFactor"
                      value={formData.sentimentQuestions.motivationFactor}
                      onChange={(e) => handleNestedInputChange("sentimentQuestions", "motivationFactor", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800 bg-white"
                    >
                      <option value="practical">Practical/Investment Value</option>
                      <option value="balanced">Balanced Approach</option>
                      <option value="emotional">Emotional Connection/Lifestyle</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-slate-600 mb-2" htmlFor="decisionStyle">
                      How would you describe your decision-making style?
                    </label>
                    <select
                      id="decisionStyle"
                      value={formData.sentimentQuestions.decisionStyle}
                      onChange={(e) => handleNestedInputChange("sentimentQuestions", "decisionStyle", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800 bg-white"
                    >
                      <option value="analytical">Analytical/Fact-Driven</option>
                      <option value="balanced">Balanced</option>
                      <option value="intuitive">Intuitive/Feeling-Based</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Submit Button */}
        <motion.div 
          className="mt-6 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 bg-indigo-600 text-white font-medium rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : "Submit"}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default LeadForm;
