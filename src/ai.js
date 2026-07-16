const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
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