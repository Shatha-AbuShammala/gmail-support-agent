const { google } = require('googleapis');
const { oauth2Client } = require('./auth');

function getGmailClient() {
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

async function listRecentMessages(maxResults = 5) {
  const gmail = getGmailClient();
  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    q: 'is:unread',
  });
  return res.data.messages || [];
}

async function getMessageDetails(messageId) {
  const gmail = getGmailClient();
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const headers = res.data.payload.headers;
  const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
  const from = headers.find(h => h.name === 'From')?.value || '(unknown sender)';

  // Gmail stores the body as base64 — needs decoding
  let body = '';
  const parts = res.data.payload.parts;
  if (parts) {
    const textPart = parts.find(p => p.mimeType === 'text/plain');
    if (textPart?.body?.data) {
      body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
    }
  } else if (res.data.payload.body?.data) {
    body = Buffer.from(res.data.payload.body.data, 'base64').toString('utf-8');
  }

  return {
    gmailId: messageId,
    threadId: res.data.threadId,
    subject,
    from,
    body: body.slice(0, 2000),
    receivedAt: new Date(parseInt(res.data.internalDate)).toISOString(),
  };
}

async function createDraftReply(threadId, to, subject, replyText) {
  const gmail = getGmailClient();

  const messageParts = [
    `To: ${to}`,
    `Subject: Re: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    replyText,
  ];
  const message = messageParts.join('\n');

  // Gmail requires base64url encoding, not regular base64
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: { raw: encodedMessage, threadId },
    },
  });

  return res.data;
}

module.exports = { listRecentMessages, getMessageDetails, createDraftReply };