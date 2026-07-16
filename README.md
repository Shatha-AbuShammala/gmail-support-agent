# Gmail Support Agent

An AI-powered backend system that automates customer email follow-up workflows.

The system connects to Gmail using OAuth2, monitors incoming unread emails, classifies them using Google Gemini AI, creates suggested replies as Gmail drafts, and tracks follow-ups — while keeping a human in the loop before any message is sent.

## Why This Project

This project simulates a real-world support automation workflow used by customer support and claims teams.

The goal is to reduce response time and repetitive manual work while maintaining accuracy and human approval.

Important design decision:

* AI never sends emails automatically.
* AI only creates drafts.
* A human reviews and sends the final response.

This approach is safer for sensitive workflows such as insurance claims and customer support.

---

# Features

## Gmail OAuth2 Authentication

* Secure Google login flow.
* No Gmail password stored.
* Access handled through OAuth2 tokens.

## Automatic Email Monitoring

* The backend checks Gmail periodically for new unread emails.
* Previously processed emails are ignored.

## AI Email Classification

Incoming emails are categorized into:

* Support
* Sales
* Spam

Classification is done using Google Gemini API.

## AI Reply Generation

For Support emails:

* Gemini generates a professional response.
* The response is based only on the email content.
* The result is saved as a Gmail draft.

## Follow-up Tracking

The system checks unanswered drafts.

Example:

* Draft created today.
* No action after 24 hours.
* Status changes to `followup_needed`.

## Dashboard

A simple web dashboard displays:

* Sender
* Subject
* Category
* Status

## MySQL Database

Stores processed emails in a relational database.

Benefits:

* Better querying
* Data persistence
* Easier reporting
* Production-like architecture

## Error Handling

The system includes:

* AI retry handling for temporary failures.
* Individual email error isolation.
* One failed email does not stop the whole processing cycle.

---

# Tech Stack

| Layer             | Technology        |
| ----------------- | ----------------- |
| Runtime           | Node.js           |
| Backend Framework | Express.js        |
| Authentication    | Google OAuth2     |
| Email Integration | Gmail API         |
| AI Model          | Google Gemini API |
| Database          | MySQL             |
| Scheduling        | node-cron         |

---

# Project Structure

```
src/
│
├── auth.js
│   └── Google OAuth2 authentication and token management
│
├── server.js
│   └── Express server, routes, dashboard, scheduler
│
├── gmailService.js
│   └── Gmail API integration
│       - Read emails
│       - Create drafts
│
├── ai.js
│   └── Gemini AI integration
│       - Email classification
│       - Reply generation
│       - Retry handling
│
├── db.js
│   └── MySQL database operations
│
├── poll.js
│   └── Main email processing workflow
│
└── followup.js
    └── Follow-up detection logic
```

---

# How It Works

1. User authenticates with Gmail.

2. The server receives an OAuth2 token.

3. The application checks Gmail periodically.

4. New unread emails are fetched.

5. Each email is sent to Gemini AI.

6. Gemini classifies the email:

```
Support
Sales
Spam
```

7. If the email is Support:

* Generate a reply.
* Create Gmail draft.
* Save information in MySQL.

8. Follow-up service checks old drafts.

9. Dashboard displays processing history.

---

# Example Flow

Incoming email:

```
Subject:
Question about my insurance claim

Body:
I submitted my documents yesterday and need an update.
```

AI result:

```
Category:
Support
```

Generated draft:

```
Dear Customer,

Thank you for contacting us.
We have received your request and our team will review your claim.

Best regards
```

The employee reviews the draft and sends it manually.

---

# Database Schema

```sql
CREATE DATABASE gmail_support_agent;

USE gmail_support_agent;

CREATE TABLE emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gmail_id VARCHAR(255) UNIQUE NOT NULL,
  thread_id VARCHAR(255),
  sender VARCHAR(255),
  subject VARCHAR(500),
  body TEXT,
  category VARCHAR(50),
  status VARCHAR(50),
  received_at DATETIME,
  processed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# Environment Variables

Create a `.env` file:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback

GEMINI_API_KEY=your_gemini_api_key

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gmail_support_agent

PORT=3000

FOLLOWUP_HOURS=24
```

---

# Installation

Install dependencies:

```bash
npm install
```

Create the MySQL database.

Configure Google Cloud:

* Enable Gmail API.
* Create OAuth2 credentials.
* Add redirect URI:

```
http://localhost:3000/oauth2callback
```

Run the application:

```bash
npm start
```

Open:

```
http://localhost:3000
```

Login with Gmail.

Dashboard:

```
http://localhost:3000/dashboard
```

---

# Future Improvements

Possible production improvements:

* Replace polling with Gmail Push Notifications.
* Add user roles and permissions.
* Add React dashboard.
* Add email templates.
* Add logging system.
* Deploy using Docker.
* Add automated tests.
* Add Outlook integration.

---

# Project Goal

This project demonstrates backend engineering skills including:

* API integrations
* OAuth authentication
* AI workflow automation
* Database design
* Background jobs
* Error handling
* Real-world support automation architecture
