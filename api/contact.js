import { sendEmail } from '../middleware/nodemailer.js';

const allowedOrigins = ['https://little-mumins-idfr.vercel.app', 'http://localhost:3000'];

export default async function handler(req, res) {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const fixedEmail = 'littlemuminsreads@gmail.com';

    const text = `
NEW CONTACT FORM SUBMISSION

Name: ${name}
Email: ${email}

Message:
--------------------------------
${message}
`;

    const subject = `New Contact Message - Little Mumins`;

    const result = await sendEmail(fixedEmail, subject, text);

    if (result.success) {
      res.status(200).json({ success: true, message: 'Message sent successfully' });
    } else {
      res.status(500).json({ success: false, message: result.message, error: result.error });
    }
  } catch (error) {
    console.error('Error in contact API:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
