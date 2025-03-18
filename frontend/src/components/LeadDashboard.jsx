import React from "react";

const LeadDashboard = ({ leads }) => {
  // Function to calculate Lead Score based on criteria
  const calculateLeadScore = (lead) => {
    let score = 0;
    if (lead.budget) score += 20; // Profit Potential
    if (lead.urgency === "1 month") score += 30; // Urgency
    if (lead.specificProperty === "Yes") score += 25; // Specific Property Interest
    return score;
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg w-full">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Lead Dashboard</h2>
      {leads.length === 0 ? (
        <p className="text-gray-500 text-center">No leads yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="border p-3">Name</th>
                <th className="border p-3">Phone</th>
                <th className="border p-3">Budget</th>
                <th className="border p-3">Urgency</th>
                <th className="border p-3">Score</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, index) => (
                <tr key={index} className="text-center odd:bg-gray-100 even:bg-gray-50 hover:bg-gray-200">
                  <td className="border p-3">{lead.name}</td>
                  <td className="border p-3">{lead.phone}</td>
                  <td className="border p-3">{lead.budget}</td>
                  <td className="border p-3">{lead.urgency}</td>
                  <td className="border p-3 font-bold text-blue-600">{calculateLeadScore(lead)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeadDashboard;