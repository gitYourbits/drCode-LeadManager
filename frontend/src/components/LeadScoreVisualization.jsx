import React from "react";
import { motion } from "framer-motion";

const LeadScoreVisualization = ({ lead }) => {
  // Score colors based on priority level
  const getScoreColor = (score) => {
    const numScore = Number(score);
    if (numScore === 5) return "bg-red-600"; // Highest priority
    if (numScore === 4) return "bg-orange-500";
    if (numScore === 3) return "bg-yellow-500";
    if (numScore === 2) return "bg-blue-600";
    return "bg-green-600"; // Lowest priority
  };

  // Score label based on priority level
  const getScoreLabel = (score) => {
    const numScore = Number(score);
    if (numScore === 5) return "Urgent Priority";
    if (numScore === 4) return "High Priority";
    if (numScore === 3) return "Medium Priority";
    if (numScore === 2) return "Low Priority";
    return "Very Low Priority";
  };

  // Calculate percentage for progress bar
  const getPercentage = (score) => {
    return (Number(score) / 5) * 100;
  };

  // Format value to handle undefined/null values
  const formatValue = (value, prefix = '', fallback = 'N/A') => {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }
    return `${prefix}${value}`;
  };

  // Render factor bar
  const FactorBar = ({ label, value, maxValue = 5 }) => {
    const numValue = isNaN(Number(value)) ? 0 : Number(value);
    const percentage = (numValue / maxValue) * 100;
    
    return (
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-white">{label}</span>
          <span className="text-sm font-medium text-white">{isNaN(numValue) ? 'N/A' : numValue}/{maxValue}</span>
        </div>
        <motion.div 
          className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="bg-indigo-500 h-2.5 rounded-full" 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>
      </div>
    );
  };

  // If lead is null, show loading state
  if (!lead) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full h-full flex items-center justify-center">
        <p className="text-indigo-300 text-center text-lg">Select a lead to view detailed analysis</p>
      </div>
    );
  }

  // Generate a consistent ID for leads that don't have one yet
  const leadId = lead.id || lead.user_id || `temp-${new Date().getTime().toString(36)}`;

  return (
    <motion.div 
      className="bg-gray-800 p-6 rounded-lg shadow-lg w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4 text-white">Lead Score Analysis</h2>
      
      <div>
        {/* Score Badge */}
        <div className="flex items-center mb-6">
          <motion.div 
            className={`text-white text-4xl font-bold rounded-full w-16 h-16 flex items-center justify-center ${getScoreColor(lead.lead_score)}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
          >
            {lead.lead_score || '?'}
          </motion.div>
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-white">{getScoreLabel(lead.lead_score)}</h3>
            <p className="text-indigo-300">Lead ID: {leadId}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <motion.div 
            className="w-full bg-gray-700 rounded-full h-4 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className={`${getScoreColor(lead.lead_score)} h-4 rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${getPercentage(lead.lead_score)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </motion.div>
        </div>
        
        {/* Lead Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div 
            className="bg-gray-900 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-semibold text-lg mb-3 text-indigo-300">Basic Information</h4>
            <p className="text-indigo-300"><span className="font-medium text-white">Name:</span> {formatValue(lead.name)}</p>
            <p className="text-indigo-300"><span className="font-medium text-white">Contact:</span> {formatValue(lead.phone)}</p>
            <p className="text-indigo-300"><span className="font-medium text-white">Email:</span> {formatValue(lead.email)}</p>
            <p className="text-indigo-300"><span className="font-medium text-white">Property Type:</span> {formatValue(lead.propertyType)}</p>
            <p className="text-indigo-300"><span className="font-medium text-white">Budget:</span> {formatValue(lead.budget, '₹')}</p>
            <p className="text-indigo-300"><span className="font-medium text-white">Location:</span> {formatValue(lead.location)}</p>
          </motion.div>
          
          <motion.div 
            className="bg-gray-900 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="font-semibold text-lg mb-3 text-indigo-300">Scoring Factors</h4>
            <FactorBar label="Profit Potential" value={lead.category ? Math.min(5, Math.max(1, Math.round(lead.category / 50000))) : 3} />
            <FactorBar label="Urgency" value={lead.urgency} />
            <FactorBar label="Intent" value={lead.specificProperty === "Yes" ? 4 : 2} />
            <FactorBar label="Interest Level" value={lead.specificProperty === "Yes" ? 4 : 2} />
          </motion.div>
        </div>
        
        {/* Intent Analysis and Sentiment Analysis - Always shown */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-gray-900 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-lg mb-3 text-indigo-300">Intent Analysis</h4>
            <p className="text-indigo-300"><span className="font-medium text-white">Purchase Timeframe:</span> {formatValue(lead.intentQuestions?.timeframe || '3-6 months')}</p>
            <p className="text-indigo-300"><span className="font-medium text-white">Financing Status:</span> {formatValue(lead.intentQuestions?.financing || 'Not Started')}</p>
            <p className="text-indigo-300"><span className="font-medium text-white">Properties Viewed:</span> {formatValue(lead.intentQuestions?.viewedProperties || '0-5')}</p>
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-lg mb-3 text-indigo-300">Sentiment Analysis</h4>
            <p className="text-indigo-300"><span className="font-medium text-white">Primary Motivation:</span> {formatValue(lead.sentimentQuestions?.motivationFactor || 'balanced')}</p>
            <p className="text-indigo-300"><span className="font-medium text-white">Decision Style:</span> {formatValue(lead.sentimentQuestions?.decisionStyle || 'balanced')}</p>
          </div>
        </motion.div>
        
        {/* Business Rules Section - Always shown */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="bg-gray-900 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-lg mb-3 text-indigo-300">Business Rules Applied</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-indigo-300"><span className="font-medium text-white">Location Priority:</span> {['Delhi', 'Mumbai', 'Bangalore', 'Karnatka', 'Hyderabad'].includes(lead.location) ? 'High' : 'Standard'}</p>
                <p className="text-indigo-300"><span className="font-medium text-white">Price Range:</span> {lead.budget > 100000 ? 'Premium' : lead.budget > 50000 ? 'Mid-range' : 'Budget'}</p>
              </div>
              <div>
                <p className="text-indigo-300"><span className="font-medium text-white">Customer Type:</span> {lead.specificProperty === 'Yes' ? 'Targeted' : 'General'}</p>
                <p className="text-indigo-300"><span className="font-medium text-white">VIP Status:</span> {lead.budget > 200000 || lead.urgency > 4 ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LeadScoreVisualization;
