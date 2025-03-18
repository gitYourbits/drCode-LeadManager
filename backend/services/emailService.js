/**
 * Email Service for Lead Management System
 * Handles sending different types of emails based on lead scores
 */

const nodemailer = require('nodemailer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Email templates directory
const TEMPLATES_DIR = path.join(__dirname, '../templates/emails');

// Create template directory if it doesn't exist
if (!fs.existsSync(TEMPLATES_DIR)) {
  fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
}

// Configure transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Can be changed to any other service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

/**
 * Generate content using Hugging Face API
 * @param {Object} lead Lead information
 * @param {String} type Email type: 'basic', 'promotional', 'personalized'
 * @returns {Promise<String>} Generated email content
 */
async function generateEmailContent(lead, type) {
  try {
    const companyDetails = {
      name: "DrCode",
      contactPerson: "Property Specialist Team",
      phone: "+91 9876543210",
      email: "DrCode@gmail.com",
      website: "www.drcode.com"
    };

    // Example default prompts for each type
    const prompts = {
      basic: `Write a friendly check-in email to ${lead.name || 'Valued Customer'}, who recently showed interest in properties. Subject: A Quick Hello from DrCode! Keep it short and simple. End the email with a signature but do not use any placeholders like [Your Name] or [Company Name]. Use these details in the signature: Name: Property Specialist Team, Company: DrCode, Phone: +91 9876543210, Email: DrCode@gmail.com.`,
      promotional: `Write a promotional email to ${lead.name || 'Valued Customer'} about our real estate services. Subject: Exclusive Property Opportunities in ${lead.location || 'Your Area'}. They showed interest in ${lead.context?.property_type || 'properties'} in ${lead.location || 'our area'}. End the email with a signature but do not use any placeholders like [Your Name] or [Company Name]. Use these details in the signature: Name: Property Specialist Team, Company: DrCode, Phone: +91 9876543210, Email: DrCode@gmail.com.`,
      personalized: `Write a personalized marketing email to ${lead.name || 'Valued Customer'} who is highly interested in buying a ${lead.context?.property_type || 'property'} in ${lead.location || 'our area'} with a budget of ${lead.budget || 'undisclosed'}. Subject: Your Dream Home Awaits in ${lead.location || 'Your Desired Location'}. Focus on why this would be a great investment. Mention their urgency level which is ${lead.urgency || 3} out of 5. End the email with a signature but do not use any placeholders like [Your Name] or [Company Name]. Use these details in the signature: Name: Property Specialist Team, Company: DrCode, Phone: +91 9876543210, Email: DrCode@gmail.com.`
    };
    
    const prompt = prompts[type];
    
    // If we have a Hugging Face API key, use their API
    if (process.env.HUGGINGFACE_API_KEY) {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', 
        { inputs: prompt },
        { 
          headers: { 
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data[0] && response.data[0].generated_text) {
        // Remove the original prompt from the generated text
        let generatedText = response.data[0].generated_text;
        
        // The API sometimes returns the prompt followed by the actual response
        // We need to remove the prompt part
        if (generatedText.includes(prompt)) {
          generatedText = generatedText.replace(prompt, '').trim();
        }
        
        // Find where the actual content starts (after instructions about writing an email)
        const contentStartIndicators = [
          "Subject:", 
          "Hello", 
          "Dear", 
          "Hi,", 
          "Hi ", 
          "Greetings"
        ];
        
        for (const indicator of contentStartIndicators) {
          const index = generatedText.indexOf(indicator);
          if (index !== -1) {
            generatedText = generatedText.substring(index);
            break;
          }
        }
        
        return generatedText;
      }
    }
    
    // Fallback to pre-written templates if API call fails
    return getDefaultEmailContent(lead, type);
  } catch (error) {
    console.error('Error generating email content:', error);
    return getDefaultEmailContent(lead, type);
  }
}

/**
 * Get default email content if API generation fails
 * @param {Object} lead Lead information
 * @param {String} type Email type
 * @returns {String} Default email content
 */
function getDefaultEmailContent(lead, type) {
  const name = lead.name || 'Valued Customer';
  const location = lead.location || 'your desired location';
  const propertyType = lead.context?.property_type || 'property';
  const companyDetails = {
    name: "DrCode",
    contactPerson: "Property Specialist Team",
    phone: "+91 9876543210",
    email: "DrCode@gmail.com",
    website: "www.drcode.com"
  };

  switch (type) {
    case 'basic':
      return `
        <p>Hello ${name},</p>
        <p>I hope this email finds you well. I wanted to check in regarding your recent interest in our properties.</p>
        <p>If you have any questions or would like more information, please don't hesitate to reach out.</p>
        <p>Best regards,<br>${companyDetails.contactPerson}<br>${companyDetails.name}<br>
        ${companyDetails.phone}<br>${companyDetails.email}</p>
      `;
    
    case 'promotional':
      return `
        <p>Hello ${name},</p>
        <p>Thank you for your interest in our properties in ${location}.</p>
        <p>We currently have several exciting options that might match your preferences. Our team has helped hundreds of clients find their dream homes in this area.</p>
        <p>Would you be available for a quick call this week to discuss your requirements in more detail?</p>
        <p>Best regards,<br>${companyDetails.contactPerson}<br>${companyDetails.name}<br>
        ${companyDetails.phone}<br>${companyDetails.email}</p>
      `;
    
    case 'personalized':
      return `
        <p>Hello ${name},</p>
        <p>I hope this email finds you well. I wanted to personally reach out regarding your interest in ${propertyType} properties in ${location}.</p>
        <p>Based on your preferences, I believe we have several options that would be perfect for you. Many of our clients with similar requirements have found exceptional value in this area.</p>
        <p>I've taken the liberty to prepare some information about specific properties that match your criteria. Would you prefer to discuss these options over a call, or would you like me to send the details directly?</p>
        <p>Warm regards,<br>${companyDetails.contactPerson}<br>${companyDetails.name}<br>
        ${companyDetails.phone}<br>${companyDetails.email}</p>
      `;
    
    default:
      return `
        <p>Hello ${name},</p>
        <p>Thank you for your interest in our properties. We look forward to helping you find your perfect match.</p>
        <p>Best regards,<br>${companyDetails.contactPerson}<br>${companyDetails.name}<br>
        ${companyDetails.phone}<br>${companyDetails.email}</p>
      `;
  }
}

/**
 * Generate HTML email content with proper formatting
 * @param {String} content Email content (HTML or plain text)
 * @param {Object} lead Lead information
 * @param {String} type Email type
 * @returns {String} Formatted HTML email
 */
function formatEmailContent(content, lead, type) {
  const companyDetails = {
    name: "DrCode",
    contactPerson: "Property Specialist Team",
    phone: "+91 9876543210",
    email: "DrCode@gmail.com",
    website: "www.drcode.com"
  };

  // First, clean up the content by removing any residual prompt text
  const cleanupPatterns = [
    /Write a.*email to.*\n/im,
    /Focus on why.*\n/im,
    /End the email with.*\n/im,
    /Mention their urgency level.*\n/im,
    /Do not include any placeholders.*\n/im,
    /Use these details in the signature:.*\n/im
  ];
  
  for (const pattern of cleanupPatterns) {
    content = content.replace(pattern, '');
  }
  
  // Remove any residual instructions or explanations before the actual email content
  const emailStartIndicators = [
    "Subject:", 
    "Hello", 
    "Dear", 
    "Hi,", 
    "Hi ", 
    "Greetings"
  ];
  
  for (const indicator of emailStartIndicators) {
    const index = content.indexOf(indicator);
    if (index > 10) { // If indicator is not at the very beginning (allowing some whitespace)
      content = content.substring(index);
      break;
    }
  }

  // Process plain text content if it doesn't appear to be HTML
  if (!content.includes('<')) {
    content = content.replace(/\n/g, '<br>');
    
    // Replace common placeholder patterns
    const placeholderPatterns = [
      /\[Your Name\]/g,
      /\[Your Contact Information\]/g,
      /\[Company Name\]/g,
      /\[Phone Number\]/g,
      /\[Email Address\]/g,
      /\[Name\]/g,
      /\[Contact\]/g,
      /\[Email\]/g,
      /\[Phone\]/g,
      /\[Company\]/g
    ];
    
    const replacements = [
      companyDetails.contactPerson,
      `${companyDetails.phone}, ${companyDetails.email}`,
      companyDetails.name,
      companyDetails.phone,
      companyDetails.email,
      companyDetails.contactPerson,
      `${companyDetails.phone}, ${companyDetails.email}`,
      companyDetails.email,
      companyDetails.phone,
      companyDetails.name
    ];
    
    // Replace all placeholders with actual info
    for (let i = 0; i < placeholderPatterns.length; i++) {
      content = content.replace(placeholderPatterns[i], replacements[i]);
    }
    
    // Extract subject line if present
    let subject = '';
    const subjectMatch = content.match(/Subject:([^\n]+)/i);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      content = content.replace(/Subject:([^\n]+)/i, '');
    }
    
    // Check for any signature patterns and replace them with our standard signature
    const signaturePatterns = [
      /Best regards,?[\s\S]*$/i,
      /Warm regards,?[\s\S]*$/i,
      /Regards,?[\s\S]*$/i,
      /Sincerely,?[\s\S]*$/i,
      /Thank you,?[\s\S]*$/i,
      /Yours truly,?[\s\S]*$/i
    ];
    
    let hasSignature = false;
    for (const pattern of signaturePatterns) {
      if (content.match(pattern)) {
        content = content.replace(
          pattern, 
          `<br><br>Best regards,<br>${companyDetails.contactPerson}<br>${companyDetails.name}<br>${companyDetails.phone}<br>${companyDetails.email}`
        );
        hasSignature = true;
        break;
      }
    }
    
    // If no signature was found, add one
    if (!hasSignature) {
      content += `<br><br>Best regards,<br>${companyDetails.contactPerson}<br>${companyDetails.name}<br>${companyDetails.phone}<br>${companyDetails.email}`;
    }
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>DrCode</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>This is an automated email from our Lead Management System. Please do not reply directly.</p>
          <p> 2025 DrCode. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send email to a lead
 * @param {Object} lead Lead information
 * @param {String} emailType Email type: 'basic', 'promotional', 'personalized'
 * @returns {Promise<Object>} Email send result
 */
async function sendEmail(lead, emailType) {
  try {
    // Determine email type based on lead score if not specified
    if (!emailType) {
      const score = parseInt(lead.lead_score);
      if (score >= 4) emailType = 'personalized';
      else if (score === 3) emailType = 'promotional';
      else emailType = 'basic';
    }
    
    // Generate subject based on type
    let subject = 'Property Information';
    if (emailType === 'basic') subject = 'Following Up on Your Property Interest';
    if (emailType === 'promotional') subject = 'Exclusive Property Opportunities for You';
    if (emailType === 'personalized') subject = 'Your Perfect Property Match in ' + (lead.location || 'Your Desired Area');
    
    // Generate email content
    const content = await generateEmailContent(lead, emailType);
    
    // Prepare email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: lead.email,
      subject: subject,
      html: formatEmailContent(content, lead, emailType)
    };
    
    // For testing without actually sending emails
    const simulateOnly = !process.env.EMAIL_USER || process.env.NODE_ENV === 'test';
    
    if (simulateOnly) {
      console.log(`[SIMULATED EMAIL] Would send ${emailType} email to ${lead.name} <${lead.email}>`);
      return {
        success: true,
        simulated: true,
        to: lead.email,
        type: emailType,
        subject: subject
      };
    }
    
    // Send actual email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${lead.name} <${lead.email}>: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      to: lead.email,
      type: emailType
    };
  } catch (error) {
    console.error(`Error sending email to ${lead.email}:`, error);
    return {
      success: false,
      error: error.message,
      to: lead.email,
      type: emailType
    };
  }
}

/**
 * Send batch emails to multiple leads
 * @param {Array} leads Array of lead objects
 * @param {Object} options Configuration options
 * @returns {Promise<Object>} Results of email sending
 */
async function sendBatchEmails(leads, options = {}) {
  const results = {
    total: leads.length,
    successful: 0,
    failed: 0,
    details: []
  };
  
  const delay = options.delay || 1000; // Default 1 second delay between emails
  
  for (const lead of leads) {
    try {
      // Determine email type based on lead score
      const score = parseInt(lead.lead_score);
      let emailType = 'basic';
      
      if (score >= 4) emailType = 'personalized';
      else if (score === 3) emailType = 'promotional';
      
      // Send the email
      const result = await sendEmail(lead, emailType);
      
      // Track results
      results.details.push({
        lead_id: lead.user_id,
        name: lead.name,
        email: lead.email,
        score: lead.lead_score,
        type: emailType,
        success: result.success,
        messageId: result.messageId,
        simulated: result.simulated
      });
      
      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
      }
      
      // Add delay between emails to avoid rate limiting
      if (delay > 0 && leads.indexOf(lead) < leads.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(`Error processing lead ${lead.name}:`, error);
      results.failed++;
      results.details.push({
        lead_id: lead.user_id,
        name: lead.name,
        email: lead.email,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

module.exports = {
  sendEmail,
  sendBatchEmails,
  generateEmailContent
};
