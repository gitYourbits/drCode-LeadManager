const express = require('express');
const router = express.Router();
const { getAPI } = require('../controllers/aiFetch');
const prisma = require('../config/db');
const dbManager = require('../config/dbManager');
const emailController = require('../controllers/emailController');

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
      // Parse the context JSON string to object
      let contextData = {};
      try {
        contextData = JSON.parse(lead.context);
      } catch (e) {
        console.error("Error parsing context data:", e);
      }

      // Filter out test leads
      if (
        (contextData.name === 'John Doe' || 
         contextData.name === 'Jane Smith' || 
         contextData.name === 'Test User') && 
        req.query.includeTestData !== 'true'
      ) {
        return null; // Will be filtered out below
      }

      return {
        user_id: lead.id,
        name: lead.User.name,
        email: lead.User.email,
        // Extract data from context if available, otherwise fallback to N/A
        phone: contextData.phone || "N/A",
        budget: contextData.budget || "N/A", 
        urgency: contextData.urgency || "N/A",
        lead_score: lead.rating,
        context: contextData, // Send parsed object instead of string
        location: lead.User.location || contextData.location || "N/A",
        createdAt: lead.createdAt
      };
    }).filter(lead => lead !== null); // Remove null entries (test data)

    res.json(transformedLeads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific lead by ID
router.get('/:id', async (req, res) => {
  try {
    const lead = await prisma.leads.findUnique({
      where: { id: req.params.id },
      include: {
        User: {
          select: {
            name: true,
            email: true,
            location: true
          }
        },
        Employee: true
      }
    });

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    // Parse context data
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
      createdAt: lead.createdAt,
      handledBy: lead.Employee ? lead.Employee.name : "Unassigned"
    };

    res.json(transformedLead);
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a lead
router.delete('/:id', async (req, res) => {
  try {
    await prisma.leads.delete({
      where: { id: req.params.id }
    });
    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete all test leads
router.delete('/test/remove', async (req, res) => {
  try {
    // Get all leads with user info
    const leads = await prisma.leads.findMany({
      include: {
        User: {
          select: {
            name: true
          }
        }
      }
    });

    // Filter for test leads
    const testLeadIds = [];
    for (const lead of leads) {
      let contextData = {};
      try {
        contextData = JSON.parse(lead.context);
      } catch (e) {
        continue;
      }

      if (
        contextData.name === 'John Doe' || 
        contextData.name === 'Jane Smith' || 
        lead.User.name === 'John Doe' || 
        lead.User.name === 'Jane Smith' || 
        contextData.name === 'Test User' ||
        lead.User.name === 'Test User'
      ) {
        testLeadIds.push(lead.id);
      }
    }

    // Delete test leads
    if (testLeadIds.length > 0) {
      await prisma.leads.deleteMany({
        where: {
          id: {
            in: testLeadIds
          }
        }
      });
      res.json({ message: `${testLeadIds.length} test leads deleted successfully` });
    } else {
      res.json({ message: "No test leads found" });
    }
  } catch (error) {
    console.error("Error deleting test leads:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete ALL leads (CAUTION: Dangerous operation)
router.delete('/all/remove', async (req, res) => {
  try {
    // Delete all leads from the database
    const deletedCount = await prisma.leads.deleteMany({});
    
    res.json({ 
      message: `All leads deleted successfully. ${deletedCount.count} records removed.`,
      count: deletedCount.count
    });
  } catch (error) {
    console.error("Error deleting all leads:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new lead
router.post('/', async (req, res) => {
  try {
    const { name, email, phoneNumber, budget, urgency, leadScore } = req.body;

    // Create a new lead
    const lead = await prisma.leads.create({
      data: {
        context: JSON.stringify({
          name,
          email,
          phone: phoneNumber,
          budget,
          urgency
        }),
        rating: leadScore || 1,
        User: {
          connectOrCreate: {
            where: { email },
            create: {
              name,
              email,
              location: "Unknown"
            }
          }
        },
        Employee: {
          connect: {
            id: "1" // Default employee ID
          }
        }
      }
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ error: error.message });
  }
});

// Email marketing campaign endpoints
router.post('/email/campaign', emailController.sendCampaignEmails);
router.get('/email/preview/:leadId/:emailType?', emailController.previewEmail);
router.post('/email/test', emailController.sendTestEmail);

// Database management endpoints
router.get('/database/status', async (req, res) => {
  try {
    // Check if the database is connected and running
    const employeeCount = await prisma.employee.count();
    const userCount = await prisma.user.count();
    const leadCount = await prisma.leads.count();
    
    // Check database health
    const isHealthy = await dbManager.checkDatabaseHealth();
    
    res.json({
      status: isHealthy ? 'healthy' : 'issues detected',
      counts: {
        employees: employeeCount,
        users: userCount,
        leads: leadCount
      },
      databaseInfo: {
        path: dbManager.DB_FILE_PATH || 'Unknown',
        type: 'SQLite',
        backupDir: dbManager.BACKUP_DIR
      }
    });
  } catch (error) {
    console.error("Error checking database status:", error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// List database backups
router.get('/database/backups', async (req, res) => {
  try {
    const backups = dbManager.listBackups();
    res.json(backups);
  } catch (error) {
    console.error("Error listing backups:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a database backup
router.post('/database/backup', async (req, res) => {
  try {
    const success = await dbManager.createBackup();
    if (success) {
      res.json({ message: "Backup created successfully" });
    } else {
      res.status(500).json({ error: "Failed to create backup" });
    }
  } catch (error) {
    console.error("Error creating backup:", error);
    res.status(500).json({ error: error.message });
  }
});

// Restore a database backup
router.post('/database/restore/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const success = await dbManager.restoreBackup(filename);
    if (success) {
      res.json({ message: `Restored backup: ${filename}` });
    } else {
      res.status(500).json({ error: `Failed to restore backup: ${filename}` });
    }
  } catch (error) {
    console.error("Error restoring backup:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete ALL users (but keep employees)
router.delete('/users/remove', async (req, res) => {
  try {
    // First, get the count of users before deletion
    const userCount = await prisma.user.count();
    
    // Then delete all users which will cascade delete their leads
    await prisma.user.deleteMany({});
    
    res.json({ 
      message: `All users deleted successfully. ${userCount} records removed.`,
      count: userCount
    });
  } catch (error) {
    console.error("Error deleting all users:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete ALL employees
router.delete('/employees/remove', async (req, res) => {
  try {
    console.log("Starting employee deletion process...");
    
    // First, get the count of employees before deletion
    const employeeCount = await prisma.employee.count();
    console.log(`Current employee count: ${employeeCount}`);
    
    // If there's only one employee (the default one), don't do anything
    if (employeeCount <= 1) {
      console.log("Only one employee exists, skipping deletion");
      return res.json({ 
        message: "No additional employees to delete. The default employee is maintained.",
        count: 0
      });
    }
    
    // Get the default employee or create one if it doesn't exist
    let defaultEmployee = await prisma.employee.findFirst({
      where: { id: "1" }
    });
    
    if (!defaultEmployee) {
      console.log("Default employee not found, creating one");
      defaultEmployee = await prisma.employee.create({
        data: {
          id: "1",
          name: "Default Employee",
          email: "default@example.com"
        }
      });
    } else {
      console.log(`Found default employee: ${defaultEmployee.id}`);
    }
    
    // First, get all leads handled by non-default employees
    const leadsToUpdate = await prisma.leads.findMany({
      where: {
        handledBy: {
          not: defaultEmployee.id
        }
      }
    });
    console.log(`Found ${leadsToUpdate.length} leads to reassign`);
    
    // Update each lead individually to avoid Prisma limitations
    for (const lead of leadsToUpdate) {
      await prisma.leads.update({
        where: { id: lead.id },
        data: { handledBy: defaultEmployee.id }
      });
    }
    console.log("All leads reassigned to default employee");
    
    // Delete all employees except the default one
    const deleteResult = await prisma.employee.deleteMany({
      where: {
        id: {
          not: defaultEmployee.id
        }
      }
    });
    console.log(`Deleted ${deleteResult.count} employees`);
    
    res.json({ 
      message: `All employees deleted successfully (except the default one). ${deleteResult.count} records removed.`,
      count: deleteResult.count
    });
  } catch (error) {
    console.error("Error deleting all employees:", error);
    res.status(500).json({ error: error.message });
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
