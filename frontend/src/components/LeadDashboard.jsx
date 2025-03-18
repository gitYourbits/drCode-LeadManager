import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeadScoreVisualization from "./LeadScoreVisualization";

const LeadDashboard = ({ leads }) => {
  const [selectedLead, setSelectedLead] = useState(null);

  // Function to handle row click
  const handleRowClick = (lead) => {
    setSelectedLead(lead);
  };

  // Get color based on score
  const getScoreColor = (score) => {
    const numScore = Number(score);
    if (numScore === 5) return "text-red-600";
    if (numScore === 4) return "text-orange-500";
    if (numScore === 3) return "text-yellow-600";
    if (numScore === 2) return "text-blue-600";
    return "text-green-600";
  };

  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-lg w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold mb-4 text-slate-700">Lead Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Table */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {leads.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <p className="text-slate-500 text-lg">No leads available yet</p>
              <p className="text-slate-400 mt-2">Submit new leads using the form</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg shadow">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-700 to-indigo-500 text-white">
                    <th className="p-3 text-left font-semibold">Name</th>
                    <th className="p-3 text-left font-semibold">Phone</th>
                    <th className="p-3 text-left font-semibold">Budget</th>
                    <th className="p-3 text-left font-semibold">Urgency</th>
                    <th className="p-3 text-left font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, index) => (
                    <motion.tr 
                      key={index} 
                      className={`border-b border-slate-200 hover:bg-indigo-50 cursor-pointer transition-colors ${selectedLead === lead ? 'bg-indigo-100' : ''}`}
                      onClick={() => handleRowClick(lead)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <td className="p-3 text-slate-800">{lead.name}</td>
                      <td className="p-3 text-slate-800">{lead.phone}</td>
                      <td className="p-3 text-slate-800">₹{lead.budget}</td>
                      <td className="p-3 text-slate-800">{lead.urgency}</td>
                      <td className={`p-3 font-bold ${getScoreColor(lead.lead_score)}`}>
                        {lead.lead_score || 'N/A'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
        
        {/* Lead Score Visualization */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <LeadScoreVisualization key={selectedLead ? selectedLead.user_id : 'empty'} lead={selectedLead} />
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LeadDashboard;