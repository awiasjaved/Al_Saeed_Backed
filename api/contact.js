import { sendEmail } from '../middleware/nodemailer.js';

const allowedOrigins = ['https://al-saeed-foundation.vercel.app', 'http://localhost:3000'];

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
    const { firstname, lastname, email, contact, address } = req.body;

    if (!firstname || !email || !lastname || !contact) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const fixedEmail = 'muhammadawaisjaved388@gmail.com';

    const text = `
NEW CONTACT FORM SUBMISSION

First Name: ${firstname}
Last Name: ${lastname}
Email: ${email}
Contact: ${contact}
Address: ${address}

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
