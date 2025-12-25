import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors({
  origin: 'http://localhost:8080', // Frontend URL
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// Send order email endpoint
app.post('/api/send-order-email', async (req, res) => {
  try {
    const {
      paymentMethod,
      customerName,
      email,
      phoneNumber,
      deliveryLocation,
      orderItems,
      subtotal,
      deliveryFee,
      total
    } = req.body;

    // Validate required fields
    if (!customerName || !email || !phoneNumber || !deliveryLocation) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Build order items HTML
    let orderItemsHtml = '';
    if (orderItems && orderItems.length > 0) {
      orderItemsHtml = orderItems.map(item => {
        let itemLabel = item.name;
        if (item.variantLabel) {
          itemLabel += ` - ${item.variantLabel}`;
        }
        if (item.color) {
          itemLabel += ` (Color: ${item.color})`;
        }
        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${itemLabel}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `;
      }).join('');
    }

    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Cash on Delivery Order</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Cash on Delivery Order</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #667eea; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Customer Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 150px;">Name:</td>
                <td style="padding: 8px 0;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                <td style="padding: 8px 0;">${phoneNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Delivery Location:</td>
                <td style="padding: 8px 0;">${deliveryLocation}</td>
              </tr>
            </table>
          </div>

          ${orderItems && orderItems.length > 0 ? `
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #667eea; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Order Items</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 12px 10px; text-align: left; border-bottom: 2px solid #667eea;">Product</th>
                  <th style="padding: 12px 10px; text-align: center; border-bottom: 2px solid #667eea;">Quantity</th>
                  <th style="padding: 12px 10px; text-align: right; border-bottom: 2px solid #667eea;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
              </tbody>
            </table>
          </div>

          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #667eea; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Order Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-size: 16px;">Subtotal:</td>
                <td style="padding: 8px 0; text-align: right; font-size: 16px;">$${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 16px;">Delivery Fee:</td>
                <td style="padding: 8px 0; text-align: right; font-size: 16px;">$${deliveryFee.toFixed(2)}</td>
              </tr>
              <tr style="border-top: 2px solid #667eea;">
                <td style="padding: 15px 0 0 0; font-size: 20px; font-weight: bold; color: #667eea;">Total:</td>
                <td style="padding: 15px 0 0 0; text-align: right; font-size: 20px; font-weight: bold; color: #667eea;">$${total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          ` : `
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #667eea; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Total Amount</h2>
            <p style="font-size: 24px; font-weight: bold; color: #667eea; margin: 15px 0;">$${total.toFixed(2)}</p>
          </div>
          `}

          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Payment Method:</strong> Cash on Delivery (COD)
            </p>
            <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px;">
              Customer will pay in cash upon delivery of the order.
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>This is an automated email notification from your e-commerce system.</p>
          <p>Order received at: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Resend's test domain (works without verification)
      to: [process.env.ADMIN_EMAIL],
      subject: `New Cash on Delivery Order from ${customerName}`,
      html: emailHtml,
    });

    console.log('Email sent successfully:', data);

    res.json({
      success: true,
      message: 'Order email sent successfully',
      emailId: data.id
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send order email',
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📧 Admin email configured: ${process.env.ADMIN_EMAIL || 'Not configured'}`);
  console.log(`🔑 Resend API key: ${process.env.RESEND_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
});
