const mysql = require('mysql2/promise');

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

// Test connection on startup
async function initDB() {
  const conn = await getPool().getConnection();
  console.log('Connected to MySQL database');
  conn.release();
}

async function saveEmail(emailRecord) {
  const pool = getPool();
  try {
    const [result] = await pool.execute(
      `INSERT INTO emails (gmail_id, thread_id, sender, subject, body, category, status, received_at, processed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        emailRecord.gmailId,
        emailRecord.threadId,
        emailRecord.from,
        emailRecord.subject,
        emailRecord.body,
        emailRecord.category,
        emailRecord.status,
        new Date(emailRecord.receivedAt),
        new Date(emailRecord.processedAt),
      ]
    );
    return { id: result.insertId, ...emailRecord };
  } catch (err) {
    // gmail_id is UNIQUE — duplicate insert means we already processed this email
    if (err.code === 'ER_DUP_ENTRY') {
      return null;
    }
    throw err;
  }
}

async function getAllEmails() {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT * FROM emails ORDER BY processed_at DESC');
  // map DB column names back to the shape the rest of the app expects
  return rows.map(row => ({
    gmailId: row.gmail_id,
    threadId: row.thread_id,
    from: row.sender,
    subject: row.subject,
    body: row.body,
    category: row.category,
    status: row.status,
    receivedAt: row.received_at,
    processedAt: row.processed_at,
  }));
}

async function updateEmailStatus(gmailId, status) {
  const pool = getPool();
  await pool.execute('UPDATE emails SET status = ? WHERE gmail_id = ?', [status, gmailId]);
}

module.exports = { initDB, saveEmail, getAllEmails, updateEmailStatus };