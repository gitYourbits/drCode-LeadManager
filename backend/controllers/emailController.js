/**
 * Email Campaign Controller
 * Handles email campaign management and sending
 */

const prisma = require('../config/db');
const emailService = require('../services/emailService');

/**
 * Send emails to leads based on criteria
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
async function sendCampaignEmails(req, res) {
  try {
    const {
      highPriorityCount = 0,
      mediumPriorityCount = 0,
      lowPriorityCount = 0,
      testMode = false
    } = req.body;
    
    // Validate inputs
    const totalLeads = highPriorityCount + mediumPriorityCount + lowPriorityCount;
    if (totalLeads <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: "You must select at least one lead to send emails to" 
      });
    }
    
    // Get high priority leads (score 4-5)
    const highPriorityLeads = highPriorityCount > 0 ? await prisma.leads.findMany({
      where: {
        rating: {
          gte: 4
        }
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
            location: true
          }
        }
      },
      orderBy: {
        rating: 'desc'
      },
      take: highPriorityCount
    }) : [];
    
    // Get medium priority leads (score 3)
    const mediumPriorityLeads = mediumPriorityCount > 0 ? await prisma.leads.findMany({
      where: {
        rating: 3
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
            location: true
          }
        }
      },
      take: mediumPriorityCount
    }) : [];
    
    // Get low priority leads (score 1-2)
    const lowPriorityLeads = lowPriorityCount > 0 ? await prisma.leads.findMany({
      where: {
        rating: {
          lte: 2
        }
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
            location: true
          }
        }
      },
      take: lowPriorityCount
    }) : [];
    
    // Transform the data for the email service
    const transformLeads = (leads) => leads.map(lead => {
      let contextData = {};
      try {
        contextData = JSON.parse(lead.context);
      } catch (e) {
        console.error("Error parsing context data:", e);
      }
      
      return {
        user_id: lead.id,
        name: lead.User.name,
        email: lead.User.email,
        phone: contextData.phone || "N/A",
        budget: contextData.budget || "N/A",
        urgency: contextData.urgency || "N/A",
        lead_score: lead.rating,
        context: contextData,
        location: lead.User.location || contextData.location || "N/A",
        createdAt: lead.createdAt
      };
    });
    
    const highLeads = transformLeads(highPriorityLeads);
    const mediumLeads = transformLeads(mediumPriorityLeads);
    const lowLeads = transformLeads(lowPriorityLeads);
    
    // Combine all leads
    const allLeads = [...highLeads, ...mediumLeads, ...lowLeads];
    
    // If test mode, just return the leads that would receive emails
    if (testMode) {
      return res.json({
        success: true,
        testMode: true,
        totalLeads: allLeads.length,
        leadsToEmail: {
          highPriority: highLeads,
          mediumPriority: mediumLeads,
          lowPriority: lowLeads
        }
      });
    }
    
    // Send the emails
    const results = await emailService.sendBatchEmails(allLeads, {
      delay: 1000  // 1 second delay between emails to avoid rate limiting
    });
    
    res.json({
      success: true,
      campaign: {
        totalSent: results.total,
        successful: results.successful,
        failed: results.failed,
        details: results.details
      }
    });
  } catch (error) {
    console.error("Error sending campaign emails:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Generate a preview of email content for a specific lead
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
async function previewEmail(req, res) {
  try {
    const { leadId, emailType } = req.params;
    
    // Get the lead from the database
    const lead = await prisma.leads.findUnique({
      where: {
        id: leadId
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
            location: true
          }
        }
      }
    });
    
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }
    
    // Transform lead data
    let contextData = {};
    try {
      contextData = JSON.parse(lead.context);
    } catch (e) {
      console.error("Error parsing context data:", e);
    }
    
    const transformedLead = {
      user_id: lead.id,
      name: lead.User.name,
      email: lead.User.email,
      phone: contextData.phone || "N/A",
      budget: contextData.budget || "N/A",
      urgency: contextData.urgency || "N/A",
      lead_score: lead.rating,
      context: contextData,
      location: lead.User.location || contextData.location || "N/A",
      createdAt: lead.createdAt
    };
    
    // Generate email content
    const content = await emailService.generateEmailContent(
      transformedLead, 
      emailType || (lead.rating >= 4 ? 'personalized' : lead.rating === 3 ? 'promotional' : 'basic')
    );
    
    res.json({
      success: true,
      preview: {
        lead: transformedLead,
        emailType: emailType || (lead.rating >= 4 ? 'personalized' : lead.rating === 3 ? 'promotional' : 'basic'),
        content: content
      }
    });
  } catch (error) {
    console.error("Error generating email preview:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Send a single test email
 * @param {Object} req Request object
 * @param {Object} res Response object
 */
async function sendTestEmail(req, res) {
  try {
    const { leadId, emailType, recipient } = req.body;
    
    // Get the lead from the database
    const lead = await prisma.leads.findUnique({
      where: {
        id: leadId
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
            location: true
          }
        }
      }
    });
    
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }
    
    // Transform lead data
    let contextData = {};
    try {
      contextData = JSON.parse(lead.context);
    } catch (e) {
      console.error("Error parsing context data:", e);
    }
    
    const transformedLead = {
      user_id: lead.id,
      name: lead.User.name,
      email: recipient || lead.User.email, // Allow overriding recipient for testing
      phone: contextData.phone || "N/A",
      budget: contextData.budget || "N/A",
      urgency: contextData.urgency || "N/A",
      lead_score: lead.rating,
      context: contextData,
      location: lead.User.location || contextData.location || "N/A",
      createdAt: lead.createdAt
    };
    
    // Send the email
    const result = await emailService.sendEmail(
      transformedLead, 
      emailType || (lead.rating >= 4 ? 'personalized' : lead.rating === 3 ? 'promotional' : 'basic')
    );
    
    res.json({
      success: result.success,
      details: result
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  sendCampaignEmails,
  previewEmail,
  sendTestEmail
};
