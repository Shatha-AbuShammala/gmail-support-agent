const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview' });
// Retry helper: retries a function up to `maxRetries` times if it fails with 503
async function withRetry(fn, maxRetries = 3, delayMs = 5000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isOverloaded = err.status === 503;
      if (isOverloaded && attempt < maxRetries) {
        console.log(`Model overloaded, retrying in ${delayMs / 1000}s... (attempt ${attempt})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw err; // give up after max retries, or if it's a different error
      }
    }
  }
}

async function classifyEmail(subject, body) {
const prompt = `Classify this email into exactly one category: Support, Sales, or Spam.
Reply with ONLY the category word, nothing else.

Subject: ${subject}
Body: ${body}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  if (['Support', 'Sales', 'Spam'].includes(text)) return text;
  return 'Support'; 
}

async function generateReply(subject, body, senderName) {
  const prompt = `You are a customer support assistant. Write a short, polite, professional reply to this customer email.
Do not invent facts you don't know. Keep it under 100 words.

From: ${senderName}
Subject: ${subject}
Body: ${body}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

module.exports = { classifyEmail, generateReply };