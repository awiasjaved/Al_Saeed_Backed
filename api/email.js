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

  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const {
      formData,
      shipToDifferent,
      orderNotes,
      cartItems,
      subtotal,
      shipping,
      total,
      paymentMethod
    } = req.body;

    if (!formData || !formData.firstName || !formData.lastName || !formData.email ||!formData.phone || !formData.address || !formData.city || !formData.state) {
      return res.status(400).json({ success: false, message: 'Invalid or missing form data' });
    }

    const fixedEmail = 'littlemuminsreads@gmail.com';

    const text = `
NEW ORDER RECEIVED

Customer Information:
--------------------------------
Name:  ${formData.firstName} ${formData.lastName}
Company: ${formData.company || 'N/A'}
Address: ${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}, ${formData.city}, ${formData.state}, ${formData.zip}, ${formData.country}
Phone: ${formData.phone}
Email: ${formData.email}
Ship to Different Address: ${shipToDifferent ? 'Yes' : 'No'}
Payment Method: ${paymentMethod}
Order Notes:
--------------------------------
${orderNotes || 'None'}

Cart Details:
--------------------------------
${cartItems.map(item => (
  `• ${item.title} (x${item.quantity}) - Rs ${item.price * item.quantity}`
)).join('\n')}

Price Summary:
--------------------------------
Subtotal: Rs ${subtotal}
Shipping: Rs ${shipping}
TOTAL: Rs ${total}

`;

    const subject = `New Order Received - Little Mumins`;

    const result = await sendEmail(fixedEmail, subject, text);

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(500).json({ message: result.message, error: result.error });
    }
  } catch (error) {
    console.error('Error in email API:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
}
