const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'db.json');
const adapter = new JSONFile(file);
const defaultData = { emails: [] };

const db = new Low(adapter, defaultData);

async function initDB() {
  await db.read();
  db.data ||= defaultData;
  await db.write();
}

async function saveEmail(emailRecord) {
  await db.read();
  const exists = db.data.emails.find(e => e.gmailId === emailRecord.gmailId);
  if (exists) return exists;
  db.data.emails.push(emailRecord);
  await db.write();
  return emailRecord;
}

async function getAllEmails() {
  await db.read();
  return db.data.emails;
}

async function updateEmailStatus(gmailId, status) {
  await db.read();
  const email = db.data.emails.find(e => e.gmailId === gmailId);
  if (email) {
    email.status = status;
    await db.write();
  }
  return email;
}

module.exports = { initDB, saveEmail, getAllEmails, updateEmailStatus };