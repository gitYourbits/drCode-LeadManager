import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LeadAPI } from "../services/api.js";
import { toast } from "react-toastify";

const EmailCampaign = () => {
  // Campaign settings state
  const [campaignSettings, setCampaignSettings] = useState({
    highPriorityCount: 0,
    mediumPriorityCount: 0,
    lowPriorityCount: 0,
    testMode: true
  });

  // Lead counts state
  const [leadCounts, setLeadCounts] = useState({
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    total: 0
  });

  // Campaign status state
  const [campaignStatus, setCampaignStatus] = useState({
    running: false,
    completed: false,
    results: null
  });

  // Email preview state
  const [previewData, setPreviewData] = useState({
    lead: null,
    emailType: null,
    content: ""
  });
  
  // Preview loading state
  const [previewLoading, setPreviewLoading] = useState({
    high: false,
    medium: false,
    low: false
  });
  
  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Fetch lead counts on component mount
  useEffect(() => {
    fetchLeadCounts();
  }, []);

  // Fetch counts of leads by priority
  const fetchLeadCounts = async () => {
    try {
      const response = await LeadAPI.getLeads();
      const leads = response.data || [];

      const highPriority = leads.filter(lead => parseInt(lead.lead_score) >= 4).length;
      const mediumPriority = leads.filter(lead => parseInt(lead.lead_score) === 3).length;
      const lowPriority = leads.filter(lead => parseInt(lead.lead_score) <= 2).length;

      setLeadCounts({
        highPriority,
        mediumPriority,
        lowPriority,
        total: leads.length
      });

      // Default to sending to all leads
      setCampaignSettings(prev => ({
        ...prev,
        highPriorityCount: highPriority,
        mediumPriorityCount: mediumPriority,
        lowPriorityCount: lowPriority
      }));
    } catch (error) {
      console.error("Error fetching lead counts:", error);
      toast.error("Failed to fetch lead information");
    }
  };

  // Handle change in campaign settings
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCampaignSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : parseInt(value)
    }));
  };

  // Handle preview button click
  const handlePreviewEmail = async (priority) => {
    try {
      setPreviewLoading(prev => ({ ...prev, [priority]: true }));
      // Get a random lead of the selected priority
      const response = await LeadAPI.getLeads();
      const leads = response.data || [];
      
      let filteredLeads = [];
      if (priority === 'high') {
        filteredLeads = leads.filter(lead => parseInt(lead.lead_score) >= 4);
      } else if (priority === 'medium') {
        filteredLeads = leads.filter(lead => parseInt(lead.lead_score) === 3);
      } else {
        filteredLeads = leads.filter(lead => parseInt(lead.lead_score) <= 2);
      }
      
      if (filteredLeads.length === 0) {
        toast.warning(`No ${priority} priority leads available for preview`);
        setPreviewLoading(prev => ({ ...prev, [priority]: false }));
        return;
      }
      
      // Select a random lead
      const randomLead = filteredLeads[Math.floor(Math.random() * filteredLeads.length)];
      
      // Determine email type
      const emailType = priority === 'high' ? 'personalized' : 
                       priority === 'medium' ? 'promotional' : 'basic';
      
      // Fetch preview
      const previewResponse = await LeadAPI.previewEmail(randomLead.user_id, emailType);
      
      if (previewResponse.data && previewResponse.data.success) {
        setPreviewData(previewResponse.data.preview);
        setShowModal(true);
        toast.info(`Generated ${emailType} email preview`);
      } else {
        toast.error("Failed to generate email preview");
      }
      setPreviewLoading(prev => ({ ...prev, [priority]: false }));
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("Failed to generate email preview");
      setPreviewLoading(prev => ({ ...prev, [priority]: false }));
    }
  };

  // Handle send campaign button click
  const handleSendCampaign = async () => {
    // Validate settings
    const totalToSend = campaignSettings.highPriorityCount + 
                       campaignSettings.mediumPriorityCount + 
                       campaignSettings.lowPriorityCount;
    
    if (totalToSend === 0) {
      toast.warning("Please select at least one lead to email");
      return;
    }
    
    try {
      setCampaignStatus({
        running: true,
        completed: false,
        results: null
      });
      
      const response = await LeadAPI.sendEmailCampaign(campaignSettings);
      
      if (response.data && response.data.success) {
        setCampaignStatus({
          running: false,
          completed: true,
          results: response.data
        });
        
        if (campaignSettings.testMode) {
          toast.success(`Would send emails to ${totalToSend} leads in production mode`);
        } else {
          toast.success(`Successfully sent emails to ${response.data.campaign.successful} leads`);
        }
      } else {
        setCampaignStatus({
          running: false,
          completed: true,
          results: {
            error: "Failed to send campaign"
          }
        });
        toast.error("Failed to send email campaign");
      }
    } catch (error) {
      console.error("Error sending campaign:", error);
      setCampaignStatus({
        running: false,
        completed: true,
        results: {
          error: error.message
        }
      });
      toast.error(`Failed to send email campaign: ${error.message}`);
    }
  };

  useEffect(() => {
    const styles = document.createElement('style');
    styles.innerHTML = `
      .email-preview * {
        color: #1f2937 !important; /* text-gray-800 equivalent */
      }
    `;
    document.head.appendChild(styles);
  }, []);

  useEffect(() => {
    // Add custom CSS to style the email preview for dark mode
    const style = document.createElement('style');
    style.innerHTML = `
      .email-preview {
        color: white !important;
      }
      .email-preview * {
        color: white !important;
      }
      .email-preview a {
        color: #93c5fd !important;
        text-decoration: underline;
      }
      .email-preview .content {
        background-color: #1f2937 !important;
        color: white !important;
      }
      .email-preview .footer {
        color: #d1d5db !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <motion.div 
      className="bg-gray-900 p-6 rounded-lg shadow-lg w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-white">Email Marketing Campaigns</h2>
      
      {campaignStatus.running ? (
        <div className="animate-pulse text-center py-8 px-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full border-4 border-t-indigo-500 border-b-indigo-700 border-l-indigo-600 border-r-indigo-600 animate-spin"></div>
            <p className="text-lg font-semibold text-white">Running Email Campaign...</p>
            <p className="text-sm text-indigo-300">This may take a moment depending on the number of emails being sent.</p>
          </div>
        </div>
      ) : campaignStatus.completed && campaignStatus.results ? (
        <div>
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-4 text-white">Campaign Results</h3>
            <div className={`p-4 rounded-lg ${campaignStatus.results.error ? 'bg-red-900' : 'bg-gray-800'} mb-4`}>
              <p className="text-lg font-semibold text-white">{campaignStatus.results.error ? 'Error' : 'Success'}</p>
              {campaignStatus.results.error ? (
                <p className="text-red-300">{campaignStatus.results.error}</p>
              ) : (
                <>
                  <p className="text-indigo-300 mb-2">
                    Sent emails to {campaignStatus.results.campaign?.successful || 0} leads
                  </p>
                  {campaignStatus.results.campaign?.failed > 0 && (
                    <p className="text-yellow-300 mb-2">
                      Failed to send {campaignStatus.results.campaign?.failed} emails
                    </p>
                  )}
                </>
              )}
            </div>
            
            {campaignStatus.results.campaign && campaignStatus.results.campaign.details && campaignStatus.results.campaign.details.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3 text-white">Detailed Results</h4>
                <div className="bg-gray-800 rounded-lg p-1">
                  {campaignStatus.results.campaign.details.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 mb-1 rounded ${idx % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'} flex justify-between items-center`}
                    >
                      <div>
                        <p className="font-medium text-white">{item.name || 'Unknown Lead'}</p>
                        <p className="text-sm text-indigo-300">
                          {item.email || 'No email'} (Type: {item.type || 'Unknown'})
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.success ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                      }`}>
                        {item.success ? 'Sent' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={() => setCampaignStatus({ running: false, completed: false, results: null })}
                className="mt-4 w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Start New Campaign
              </button>
            </div>
          </div>
        </div>
      ) : previewData.content && showModal ? (
        // Email Preview Modal
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-5 w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-white">Email Preview</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {previewData.lead && (
              <div className="mb-4 p-3 bg-gray-700 rounded-lg text-sm">
                <p className="text-white"><span className="font-medium">To:</span> {previewData.lead.name} &lt;{previewData.lead.email}&gt;</p>
                <p className="text-white"><span className="font-medium">Type:</span> {previewData.emailType} (Score: {previewData.lead.lead_score})</p>
              </div>
            )}
            
            <div className="p-4 border border-gray-700 rounded-lg bg-gray-800 text-white email-preview">
              <div 
                dangerouslySetInnerHTML={{ __html: previewData.content }} 
                className="text-white"
              />
            </div>
          </div>
        </div>
      ) : (
        // Default view
        <div>
          <form onSubmit={(e) => {
            e.preventDefault();
            return false;
          }}>
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-4 text-white">Campaign Settings</h3>
              <p className="text-sm text-indigo-300 mb-3">
                Configure how many leads from each priority level should receive emails
              </p>
              
              {/* High Priority Leads */}
              <div className="mb-4">
                <label className="flex justify-between items-center text-white mb-2">
                  <span>
                    <span className="font-semibold">High Priority Leads (Score 4-5)</span>
                    <span className="ml-2 text-sm text-indigo-300">
                      Available: {leadCounts.highPriority}
                    </span>
                  </span>
                  <button
                    onClick={() => handlePreviewEmail('high')}
                    disabled={previewLoading.high}
                    className={`text-xs py-1 px-2 rounded hover:bg-indigo-700 transition-colors ${
                      previewLoading.high ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {previewLoading.high ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      'Preview Email'
                    )}
                  </button>
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    name="highPriorityCount"
                    min="0"
                    max={leadCounts.highPriority}
                    value={campaignSettings.highPriorityCount}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-indigo-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <input
                    type="number"
                    name="highPriorityCount"
                    min="0"
                    max={leadCounts.highPriority}
                    value={campaignSettings.highPriorityCount}
                    onChange={handleInputChange}
                    className="w-16 ml-3 p-1 border border-gray-600 rounded text-center text-white bg-gray-700"
                  />
                </div>
                <p className="text-xs text-indigo-300 mt-1">
                  Personalized property recommendations with marketing content
                </p>
              </div>
              
              {/* Medium Priority Leads */}
              <div className="mb-4">
                <label className="flex justify-between items-center text-white mb-2">
                  <span>
                    <span className="font-semibold">Medium Priority Leads (Score 3)</span>
                    <span className="ml-2 text-sm text-indigo-300">
                      Available: {leadCounts.mediumPriority}
                    </span>
                  </span>
                  <button
                    onClick={() => handlePreviewEmail('medium')}
                    disabled={previewLoading.medium}
                    className={`text-xs py-1 px-2 rounded hover:bg-indigo-700 transition-colors ${
                      previewLoading.medium ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {previewLoading.medium ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      'Preview Email'
                    )}
                  </button>
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    name="mediumPriorityCount"
                    min="0"
                    max={leadCounts.mediumPriority}
                    value={campaignSettings.mediumPriorityCount}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-indigo-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <input
                    type="number"
                    name="mediumPriorityCount"
                    min="0"
                    max={leadCounts.mediumPriority}
                    value={campaignSettings.mediumPriorityCount}
                    onChange={handleInputChange}
                    className="w-16 ml-3 p-1 border border-gray-600 rounded text-center text-white bg-gray-700"
                  />
                </div>
                <p className="text-xs text-indigo-300 mt-1">
                  Promotional emails with general property information
                </p>
              </div>
              
              {/* Low Priority Leads */}
              <div className="mb-4">
                <label className="flex justify-between items-center text-white mb-2">
                  <span>
                    <span className="font-semibold">Low Priority Leads (Score 1-2)</span>
                    <span className="ml-2 text-sm text-indigo-300">
                      Available: {leadCounts.lowPriority}
                    </span>
                  </span>
                  <button
                    onClick={() => handlePreviewEmail('low')}
                    disabled={previewLoading.low}
                    className={`text-xs py-1 px-2 rounded hover:bg-indigo-700 transition-colors ${
                      previewLoading.low ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {previewLoading.low ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      'Preview Email'
                    )}
                  </button>
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    name="lowPriorityCount"
                    min="0"
                    max={leadCounts.lowPriority}
                    value={campaignSettings.lowPriorityCount}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-indigo-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <input
                    type="number"
                    name="lowPriorityCount"
                    min="0"
                    max={leadCounts.lowPriority}
                    value={campaignSettings.lowPriorityCount}
                    onChange={handleInputChange}
                    className="w-16 ml-3 p-1 border border-gray-600 rounded text-center text-white bg-gray-700"
                  />
                </div>
                <p className="text-xs text-indigo-300 mt-1">
                  Basic check-in emails with minimal property information
                </p>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-white">Email Settings</h3>
              </div>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="testMode"
                  name="testMode"
                  checked={campaignSettings.testMode}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="testMode" className="ml-2 text-white">
                  Test Mode (doesn't actually send emails)
                </label>
              </div>
              
              <div className="bg-gray-700 p-3 rounded text-sm text-indigo-300 mb-4">
                <p className="flex items-center">
                  <span className="mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </span>
                  When test mode is enabled, the system will simulate sending emails without actually delivering them.
                </p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div className="text-indigo-300">
                Total emails to send: {campaignSettings.highPriorityCount + campaignSettings.mediumPriorityCount + campaignSettings.lowPriorityCount}
              </div>
              <button
                type="button"
                onClick={handleSendCampaign}
                disabled={campaignSettings.highPriorityCount + campaignSettings.mediumPriorityCount + campaignSettings.lowPriorityCount === 0}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  campaignSettings.highPriorityCount + campaignSettings.mediumPriorityCount + campaignSettings.lowPriorityCount === 0 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                Send Campaign Emails
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
};

export default EmailCampaign;
