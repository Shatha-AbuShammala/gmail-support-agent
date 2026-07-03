require('dotenv').config();
const express = require('express');
const { getAuthUrl, saveTokenFromCode, loadSavedToken } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<a href="/auth">Sign in with Gmail</a>');
});

app.get('/auth', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('No code received from Google');
  }
  try {
    await saveTokenFromCode(code);
    res.send('Authentication successful! You can close this tab.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Authentication error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  const hasToken = loadSavedToken();
  console.log(hasToken ? 'Existing token found' : 'No token yet, sign in at /auth');
});