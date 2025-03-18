import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LeadAPI } from "../services/api.js";
import { toast } from "react-toastify";

const DatabaseManager = () => {
  const [databaseStatus, setDatabaseStatus] = useState(null);
  const [leads, setLeads] = useState([]);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState({
    status: false,
    leads: false,
    backups: false,
    action: false
  });
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    type: null, // "all", "lead", "test", "users", "employees"
    leadId: null
  });

  // Fetch database status
  const fetchDatabaseStatus = async () => {
    setLoading(prev => ({ ...prev, status: true }));
    try {
      const response = await LeadAPI.getDatabaseStatus();
      setDatabaseStatus(response.data);
    } catch (error) {
      toast.error("Failed to fetch database status");
      console.error("Error fetching database status:", error);
    } finally {
      setLoading(prev => ({ ...prev, status: false }));
    }
  };

  // Fetch leads
  const fetchLeads = async () => {
    setLoading(prev => ({ ...prev, leads: true }));
    try {
      const response = await LeadAPI.getLeads();
      setLeads(response.data);
    } catch (error) {
      toast.error("Failed to fetch leads");
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(prev => ({ ...prev, leads: false }));
    }
  };

  // Fetch backups
  const fetchBackups = async () => {
    setLoading(prev => ({ ...prev, backups: true }));
    try {
      const response = await LeadAPI.getDatabaseBackups();
      setBackups(response.data);
    } catch (error) {
      toast.error("Failed to fetch backups");
      console.error("Error fetching backups:", error);
    } finally {
      setLoading(prev => ({ ...prev, backups: false }));
    }
  };

  // Create backup
  const createBackup = async () => {
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await LeadAPI.createDatabaseBackup();
      toast.success("Database backup created successfully");
      await fetchBackups();
    } catch (error) {
      toast.error("Failed to create backup");
      console.error("Error creating backup:", error);
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Restore backup
  const restoreBackup = async (filename) => {
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await LeadAPI.restoreDatabaseBackup(filename);
      toast.success(`Restored backup: ${filename}`);
      await fetchDatabaseStatus();
      await fetchLeads();
      await fetchBackups();
    } catch (error) {
      toast.error("Failed to restore backup");
      console.error("Error restoring backup:", error);
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Delete lead
  const deleteLead = async (leadId) => {
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await LeadAPI.deleteLead(leadId);
      toast.success("Lead deleted successfully");
      await fetchLeads();
      await fetchDatabaseStatus();
    } catch (error) {
      toast.error("Failed to delete lead");
      console.error("Error deleting lead:", error);
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
      setConfirmDelete({ show: false, type: null, leadId: null });
    }
  };

  // Delete test leads
  const deleteTestLeads = async () => {
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await fetch('http://localhost:3000/leads/test/remove', {
        method: 'DELETE'
      });
      toast.success("Test leads deleted successfully");
      await fetchLeads();
      await fetchDatabaseStatus();
    } catch (error) {
      toast.error("Failed to delete test leads");
      console.error("Error deleting test leads:", error);
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
      setConfirmDelete({ show: false, type: null, leadId: null });
    }
  };

  // Delete all leads
  const deleteAllLeads = async () => {
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await LeadAPI.deleteAllLeads();
      toast.success("All leads deleted successfully");
      await fetchLeads();
      await fetchDatabaseStatus();
    } catch (error) {
      toast.error("Failed to delete all leads");
      console.error("Error deleting all leads:", error);
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
      setConfirmDelete({ show: false, type: null, leadId: null });
    }
  };

  // Delete all users
  const deleteAllUsers = async () => {
    setLoading(prev => ({ ...prev, action: true }));
    try {
      await LeadAPI.deleteAllUsers();
      toast.success("All users deleted successfully");
      await fetchDatabaseStatus();
    } catch (error) {
      toast.error("Failed to delete users");
      console.error("Error deleting users:", error);
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
      setConfirmDelete({ show: false, type: null, leadId: null });
    }
  };

  // Delete all employees
  const deleteAllEmployees = async () => {
    setLoading(prev => ({ ...prev, action: true }));
    try {
      const response = await LeadAPI.deleteAllEmployees();
      
      if (response.data.count === 0) {
        toast.info("No additional employees to delete. The default employee is maintained.");
      } else {
        toast.success(`${response.data.count} employees deleted successfully (default employee preserved)`);
      }
      
      await fetchDatabaseStatus();
    } catch (error) {
      toast.error("Failed to delete employees");
      console.error("Error deleting employees:", error);
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
      setConfirmDelete({ show: false, type: null, leadId: null });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDatabaseStatus();
    fetchLeads();
    fetchBackups();
  }, []);

  // Confirmation Dialog
  const ConfirmationDialog = () => {
    if (!confirmDelete.show) return null;

    let message = "";
    let action = null;

    if (confirmDelete.type === "all") {
      message = "Are you sure you want to delete ALL leads? This action cannot be undone!";
      action = deleteAllLeads;
    } else if (confirmDelete.type === "test") {
      message = "Are you sure you want to delete all test leads?";
      action = deleteTestLeads;
    } else if (confirmDelete.type === "lead") {
      message = "Are you sure you want to delete this lead?";
      action = () => deleteLead(confirmDelete.leadId);
    } else if (confirmDelete.type === "users") {
      message = "Are you sure you want to delete all users? This will keep employees, but may break lead connections.";
      action = deleteAllUsers;
    } else if (confirmDelete.type === "employees") {
      message = "Are you sure you want to delete all employees? This will keep the default employee.";
      action = deleteAllEmployees;
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-11/12 max-w-md border border-gray-700">
          <h3 className="text-xl font-medium text-white mb-4">Confirm Delete</h3>
          <p className="text-white mb-6">{message}</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setConfirmDelete({ show: false, type: null, leadId: null })}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={action}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <motion.div 
      className="bg-gray-900 p-6 rounded-lg shadow-lg w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-white">Database Management</h2>

      {/* Database Status Section */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-4 text-white">Database Status</h3>
        {loading.status ? (
          <div className="animate-pulse flex py-4">
            <div className="w-full space-y-3">
              <div className="h-6 bg-gray-700 rounded"></div>
              <div className="h-6 bg-gray-700 rounded w-3/4"></div>
              <div className="h-6 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ) : databaseStatus ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-3 rounded">
              <h4 className="text-sm text-indigo-300 mb-1">Status</h4>
              <p className={`text-lg font-semibold ${databaseStatus.status === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>
                {databaseStatus.status}
              </p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <h4 className="text-sm text-indigo-300 mb-1">Records</h4>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-400">Leads</p>
                  <p className="text-lg font-semibold text-white">{databaseStatus.counts.leads}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Users</p>
                  <p className="text-lg font-semibold text-white">{databaseStatus.counts.users}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Employees</p>
                  <p className="text-lg font-semibold text-white">{databaseStatus.counts.employees}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <h4 className="text-sm text-indigo-300 mb-1">Database Info</h4>
              <p className="text-sm text-white mb-1">{databaseStatus.databaseInfo.type}</p>
              <p className="text-xs text-gray-400 truncate">{databaseStatus.databaseInfo.path}</p>
            </div>
          </div>
        ) : (
          <p className="text-white">No database information available</p>
        )}
      </div>

      {/* Database Actions Section */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-4 text-white">Database Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={createBackup}
            disabled={loading.action}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Create Backup
          </button>
          <button
            onClick={() => setConfirmDelete({ show: true, type: "test" })}
            disabled={loading.action}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Delete Test Leads
          </button>
          <button
            onClick={() => setConfirmDelete({ show: true, type: "all" })}
            disabled={loading.action}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Delete All Leads
          </button>
          <button
            onClick={() => setConfirmDelete({ show: true, type: "users" })}
            disabled={loading.action}
            className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Delete All Users
          </button>
          <button
            onClick={() => setConfirmDelete({ show: true, type: "employees" })}
            disabled={loading.action}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Delete All Employees
          </button>
        </div>
      </div>

      {/* Leads Section */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-4 text-white">Leads ({leads.length})</h3>
        {loading.leads ? (
          <div className="animate-pulse flex py-4">
            <div className="w-full space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : leads.length === 0 ? (
          <p className="text-white py-3">No leads found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead className="text-xs uppercase bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, idx) => (
                  <tr 
                    key={lead.user_id} 
                    className={`border-b border-gray-700 ${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}`}
                  >
                    <td className="px-4 py-3">{lead.name}</td>
                    <td className="px-4 py-3">{lead.email}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        lead.lead_score >= 4 ? 'bg-green-900 text-green-200' : 
                        lead.lead_score === 3 ? 'bg-yellow-900 text-yellow-200' : 
                        'bg-red-900 text-red-200'
                      }`}>
                        {lead.lead_score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => setConfirmDelete({ show: true, type: "lead", leadId: lead.user_id })}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Lead"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Backups Section */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4 text-white">Backups</h3>
        {loading.backups ? (
          <div className="animate-pulse flex py-4">
            <div className="w-full space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : backups.length === 0 ? (
          <p className="text-white py-3">No backups found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {backups.map((backup) => (
              <div key={backup.name} className="bg-gray-700 p-3 rounded flex flex-col">
                <p className="text-sm text-white truncate mb-1">{backup.name}</p>
                <p className="text-xs text-gray-400 mb-3">
                  {formatDate(backup.created)} • {Math.round(backup.size / 1024)} KB
                </p>
                <button
                  onClick={() => restoreBackup(backup.name)}
                  disabled={loading.action}
                  className="text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mt-auto self-start"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog />
    </motion.div>
  );
};

export default DatabaseManager;
