const express = require('express');
const router = express.Router();
const { getAPI } = require('../controllers/aiFetch');
const prisma = require('../config/db');

// API endpoint for lead submission with scoring
router.post('/api', getAPI);

// Get all leads with Prisma
router.get('/', async (req, res) => {
  try {
    // Get all leads with related user information
    const leads = await prisma.leads.findMany({
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
      }
    });

    // Transform the data for frontend
    const transformedLeads = leads.map(lead => {
      return {
        user_id: lead.id,
        name: lead.User.name,
        email: lead.User.email,
        phone: "N/A", // Not stored in our schema
        budget: "N/A", // Not explicitly stored in our schema
        urgency: "N/A", // Not explicitly stored in our schema
        lead_score: lead.rating,
        context: lead.context,
        location: lead.User.location,
        createdAt: lead.createdAt
      };
    });

    res.status(200).json(transformedLeads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// Get a single lead by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const lead = await prisma.leads.findUnique({
      where: { id },
      include: {
        User: true,
        Employee: true
      }
    });
    
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    
    res.status(200).json(lead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ error: "Failed to fetch lead" });
  }
});

// Add a new lead and save it to database
router.post('/', async (req, res) => {
  try {
    const leadData = req.body;
    
    // First create or find the user
    const user = await prisma.user.upsert({
      where: { 
        email: leadData.email || `user-${Date.now()}@example.com` 
      },
      update: { 
        name: leadData.name,
        location: leadData.location
      },
      create: {
        email: leadData.email || `user-${Date.now()}@example.com`,
        name: leadData.name,
        location: leadData.location
      }
    });
    
    // Find any employee to handle the lead (first one for simplicity)
    let employee = await prisma.employee.findFirst();
    
    // If no employee exists, create a default one
    if (!employee) {
      employee = await prisma.employee.create({
        data: {
          name: "Default Handler",
          email: "handler@example.com"
        }
      });
    }
    
    // Now create the lead
    const lead = await prisma.leads.create({
      data: {
        context: JSON.stringify(leadData),
        rating: leadData.lead_score || 1,
        createdBy: user.id,
        handledBy: employee.id
      },
      include: {
        User: true,
        Employee: true
      }
    });
    
    res.status(201).json(lead);
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ error: "Failed to create lead" });
  }
});

// Legacy routes
router.get('/about', (req, res) => {
  res.send('About page');
});

router.get('/contact', (req, res) => {
  res.send('Contact page');
});

module.exports = router;
