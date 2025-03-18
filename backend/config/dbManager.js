/**
 * Database Management Utilities
 * Provides functionality for backing up and restoring the SQLite database
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const prisma = require('./db');

// Constants
const DB_FILE_PATH = path.resolve(__dirname, '../prisma/dev.db');
const BACKUP_DIR = path.resolve(__dirname, '../prisma/backup');
const MAX_BACKUPS = 5;

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`Created backup directory at ${BACKUP_DIR}`);
}

/**
 * Create a backup of the SQLite database
 */
async function createBackup() {
  try {
    // Check if database file exists
    if (!fs.existsSync(DB_FILE_PATH)) {
      console.warn(`Database file not found at ${DB_FILE_PATH}, skipping backup`);
      return false;
    }

    // Create a backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.db`);
    
    // Copy the database file to the backup location
    fs.copyFileSync(DB_FILE_PATH, backupPath);
    console.log(`Database backup created at ${backupPath}`);
    
    // Clean up old backups
    cleanupOldBackups();
    
    return true;
  } catch (error) {
    console.error('Error creating database backup:', error);
    return false;
  }
}

/**
 * Clean up old backups, keeping only the most recent MAX_BACKUPS
 */
function cleanupOldBackups() {
  try {
    // Get all backup files
    const backupFiles = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort by time descending (newest first)
    
    // Remove old backups
    if (backupFiles.length > MAX_BACKUPS) {
      const filesToRemove = backupFiles.slice(MAX_BACKUPS);
      filesToRemove.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`Removed old backup: ${file.name}`);
      });
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
  }
}

/**
 * Restore a backup file
 * @param {string} backupFilename - The name of the backup file to restore (not full path)
 */
async function restoreBackup(backupFilename) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFilename);
    
    // Check if backup file exists
    if (!fs.existsSync(backupPath)) {
      console.error(`Backup file not found: ${backupPath}`);
      return false;
    }
    
    // First create a backup of current state
    await createBackup();
    
    // Disconnect Prisma before modifying the database file
    await prisma.$disconnect();
    
    // Copy the backup to the database location
    fs.copyFileSync(backupPath, DB_FILE_PATH);
    console.log(`Database restored from backup: ${backupFilename}`);
    
    // Reconnect to the database by importing the module again
    return true;
  } catch (error) {
    console.error('Error restoring database:', error);
    return false;
  }
}

/**
 * List all available backup files
 * @returns {Array} Array of backup info objects with name and created date
 */
function listBackups() {
  try {
    // Get all backup files
    const backupFiles = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        created: new Date(fs.statSync(path.join(BACKUP_DIR, file)).mtime).toISOString(),
        size: fs.statSync(path.join(BACKUP_DIR, file)).size
      }))
      .sort((a, b) => new Date(b.created) - new Date(a.created)); // Sort by date descending
    
    return backupFiles;
  } catch (error) {
    console.error('Error listing backups:', error);
    return [];
  }
}

/**
 * Check if the database file exists and is valid
 * @returns {boolean} True if database is valid
 */
async function checkDatabaseHealth() {
  try {
    // Check if file exists
    if (!fs.existsSync(DB_FILE_PATH)) {
      console.error(`Database file not found at ${DB_FILE_PATH}`);
      return false;
    }
    
    // Try running a query to verify the database integrity
    const employeeCount = await prisma.employee.count();
    console.log(`Database health check: OK (${employeeCount} employees found)`);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Schedule regular backups (every hour)
setInterval(createBackup, 3600 * 1000);

// Create initial backup when server starts
createBackup();

module.exports = {
  createBackup,
  restoreBackup,
  listBackups,
  checkDatabaseHealth,
  DB_FILE_PATH,
  BACKUP_DIR
};
