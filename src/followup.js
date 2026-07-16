const { getAllEmails, updateEmailStatus } = require('./db');

const FOLLOWUP_HOURS = parseInt(process.env.FOLLOWUP_HOURS || '24');

async function checkFollowups() {
  const emails = await getAllEmails();
  const now = Date.now();

  for (const email of emails) {
    if (email.status !== 'draft_created') continue;

    const hoursPassed = (now - new Date(email.processedAt).getTime()) / (1000 * 60 * 60);

    if (hoursPassed >= FOLLOWUP_HOURS) {
      console.log(`FOLLOW-UP NEEDED: ${email.subject} (from ${email.from})`);
      await updateEmailStatus(email.gmailId, 'followup_needed');
    }
  }
}

module.exports = { checkFollowups };