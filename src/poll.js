const { listRecentMessages, getMessageDetails, createDraftReply } = require('./gmailService');
const { classifyEmail, generateReply } = require('./ai');
const { saveEmail, getAllEmails } = require('./db');

async function processNewEmails() {
  console.log('Checking for new emails...');
  const messages = await listRecentMessages(5);

  if (messages.length === 0) {
    console.log('No new emails found.');
    return;
  }

  const existing = await getAllEmails();
  const existingIds = new Set(existing.map(e => e.gmailId));

  for (const msg of messages) {
    if (existingIds.has(msg.id)) continue; 

    const details = await getMessageDetails(msg.id);
    const category = await classifyEmail(details.subject, details.body);

    let draftCreated = false;
    if (category === 'Support') {
      const replyText = await generateReply(details.subject, details.body, details.from);
      await createDraftReply(details.threadId, details.from, details.subject, replyText);
      draftCreated = true;
    }

    await saveEmail({
      ...details,
      category,
      status: draftCreated ? 'draft_created' : 'no_action',
      processedAt: new Date().toISOString(),
    });

    console.log(`Processed: "${details.subject}" → ${category}`);
  }
}

module.exports = { processNewEmails };