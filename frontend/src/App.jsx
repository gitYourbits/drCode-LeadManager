import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LeadForm from "./components/LeadForm";
import LeadDashboard from "./components/LeadDashboard";
import EmailCampaign from "./components/EmailCampaign";
import DatabaseManager from "./components/DatabaseManager";
import HexagonLoader from "./components/HexagonLoader";
import { LeadAPI } from "./services/api.js";
import { toast } from "react-toastify";

const App = () => {
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("form"); // "form", "dashboard", "email", or "database"
  const [loading, setLoading] = useState(true);

  // Fetch leads from the backend
  useEffect(() => {
    setLoading(true);
    LeadAPI.getLeads()
      .then((response) => {
        console.log("Fetched leads:", response.data);
        setLeads(response.data || []);
        if (response.data && response.data.length > 0) {
          toast.info(`Loaded ${response.data.length} leads`);
        }
      })
      .catch((error) => {
        console.error("Error fetching leads:", error);
        toast.error("Failed to load leads. Please try again later.");
        // Continue with empty leads array rather than failing
        setLeads([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Handle form submission
  const handleLeadSubmit = (leadData) => {
    try {
      // Ensure the lead has an ID
      const leadWithId = {
        ...leadData,
        id: leadData.id || leadData.user_id || `lead-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      };
      
      // Add the lead to the local state immediately for UI responsiveness
      setLeads((prevLeads) => [...prevLeads, leadWithId]);
      
      // Switch to dashboard tab after submission
      setActiveTab("dashboard");
      
      // Show success message
      toast.success("Lead successfully added!");
    } catch (error) {
      console.error("Error handling lead submission:", error);
      toast.error("Something went wrong while adding the lead.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      {/* Header */}
      <motion.header 
        className="bg-slate-800 shadow-md border-b border-slate-700"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              className="flex items-center mb-4 md:mb-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <svg 
                className="h-8 w-8 text-indigo-400 mr-3" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h1 className="text-3xl font-bold text-indigo-400">
                Advanced Lead Management
              </h1>
            </motion.div>
            
            <motion.div 
              className="flex space-x-2 bg-slate-700 p-1 rounded-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <button
                className={`px-4 py-2 rounded-md transition-all ${
                  activeTab === "form" 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "bg-transparent text-slate-300 hover:bg-slate-600"
                }`}
                onClick={() => setActiveTab("form")}
              >
                Add Lead
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-all ${
                  activeTab === "dashboard" 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "bg-transparent text-slate-300 hover:bg-slate-600"
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                Dashboard {leads.length > 0 && <span className="ml-1 bg-indigo-700 text-white text-xs px-2 py-0.5 rounded-full">{leads.length}</span>}
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-all ${
                  activeTab === "email" 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "bg-transparent text-slate-300 hover:bg-slate-600"
                }`}
                onClick={() => setActiveTab("email")}
              >
                Email Marketing
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-all ${
                  activeTab === "database" 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "bg-transparent text-slate-300 hover:bg-slate-600"
                }`}
                onClick={() => setActiveTab("database")}
              >
                Manage Database
              </button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content - Flex grow to push footer down */}
      <div className="flex-grow container mx-auto px-4 py-8">
        {loading ? (
          <HexagonLoader isFullScreen={false} />
        ) : (
          <div className="mt-4">
            {activeTab === "form" ? (
              <LeadForm onLeadSubmit={handleLeadSubmit} />
            ) : activeTab === "dashboard" ? (
              <LeadDashboard leads={leads} />
            ) : activeTab === "email" ? (
              <EmailCampaign />
            ) : (
              <DatabaseManager />
            )}
          </div>
        )}
      </div>
      
      {/* Footer - Fixed at bottom */}
      <footer className="bg-slate-900 text-slate-300 py-6 border-t border-slate-700">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-semibold">Advanced Lead Management System</p>
          <p className="text-indigo-400 text-sm mt-2">Powered by AI-Enhanced Scoring Algorithm</p>
          <div className="flex justify-center space-x-4 mt-4">
            <a href="https://github.com/gitYourbits/drCode-LeadManager" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-400 transition-colors">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <span className="text-slate-500">|</span>
            <p className="text-slate-400 text-xs">&#169; {new Date().getFullYear()} Lead Management System</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
