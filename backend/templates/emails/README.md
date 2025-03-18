# Email Templates for Lead Management System

This directory contains templates for email marketing campaigns based on lead priorities.

## Template Types

### 1. Basic Check-in Emails (Score 1-2)
Simple emails for low-priority leads to maintain minimal engagement.

### 2. Promotional Emails (Score 3)
Marketing-focused emails for medium-priority leads highlighting general property offerings.

### 3. Personalized Marketing Emails (Score 4-5)
Highly tailored emails for high-priority leads with specific property recommendations.

## Integration with Hugging Face API

The system can use Hugging Face's text generation API to create personalized content for each lead.
To enable this feature, add your Hugging Face API key to the `.env` file:

```
HUGGINGFACE_API_KEY=your-api-key-here
```

If no API key is provided, the system will fall back to pre-written templates.

## Email Configuration

To send real emails rather than simulating them, add your SMTP credentials to the `.env` file:

```
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-password
```

For Gmail, you'll need to use an App Password rather than your account password.

## Email Campaign Management

The frontend provides an interface to:
1. Select how many leads of each priority level to email
2. Preview email content before sending
3. Run test campaigns without actually sending emails
4. View campaign results and statistics
