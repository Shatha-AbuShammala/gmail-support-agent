require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { getAuthUrl, saveTokenFromCode, loadSavedToken } = require('./auth');
const { initDB, getAllEmails } = require('./db');
const { processNewEmails } = require('./poll');
const { checkFollowups } = require('./followup');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<a href="/auth">Sign in with Gmail</a> | <a href="/dashboard">Dashboard</a>');
});

app.get('/auth', (req, res) => {
  res.redirect(getAuthUrl());
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code received from Google');
  try {
    await saveTokenFromCode(code);
    res.send('Authentication successful! You can close this tab.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Authentication error');
  }
});

app.get('/api/emails', async (req, res) => {
  res.json(await getAllEmails());
});

app.get('/dashboard', async (req, res) => {
  const emails = await getAllEmails();
  const rows = emails.map(e => `
    <tr><td>${e.from}</td><td>${e.subject}</td><td>${e.category}</td><td>${e.status}</td></tr>
  `).join('');

  res.send(`
    <html><head><title>Dashboard</title></head>
    <body>
      <h1>Email Dashboard</h1>
      <table border="1" cellpadding="8">
        <tr><th>From</th><th>Subject</th><th>Category</th><th>Status</th></tr>
        ${rows}
      </table>
    </body></html>
  `);
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  const hasToken = loadSavedToken();
  console.log(hasToken ? 'Existing token found' : 'No token yet, sign in at /auth');

  await initDB();

  if (hasToken) {
    // check every 2 minutes, plus once immediately on startup
    setInterval(() => processNewEmails().catch(console.error), 2 * 60 * 1000);
    processNewEmails().catch(console.error);
  }

  cron.schedule('0 9 * * *', () => {
    checkFollowups().catch(console.error);
  });
});