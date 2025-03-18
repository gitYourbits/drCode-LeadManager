const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Initialize database with a default employee if none exists
async function initializeDatabase() {
  try {
    // Check if we have any employees
    const employeeCount = await prisma.employee.count();
    if (employeeCount === 0) {
      console.log("Creating default employee");
      await prisma.employee.create({
        data: {
          id: "1",
          name: "Default Handler",
          email: "handler@example.com"
        }
      });
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Run the initialization
initializeDatabase();

module.exports = prisma;
