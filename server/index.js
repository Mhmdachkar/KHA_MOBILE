import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Router } from 'express';
import { Resend } from 'resend';
import { adminAuthRouter } from './routes/adminAuth.js';
import { adminProductsRouter } from './routes/adminProducts.js';
import { adminSettingsRouter } from './routes/adminSettings.js';
import { adminCouponsRouter } from './routes/adminCoupons.js';
import { adminAuditRouter } from './routes/adminAudit.js';
import { adminMediaRouter } from './routes/adminMedia.js';
import { adminOrdersRouter } from './routes/adminOrders.js';
import { publicCatalogRouter } from './routes/publicCatalog.js';
import { publicSettingsRouter } from './routes/publicSettings.js';
import { publicCouponsRouter } from './routes/publicCoupons.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
/** Required so `req.protocol` / host match the browser URL behind Render, nginx, etc. */
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/** Browser origins from FRONTEND_ORIGIN (comma-separated). */
const fromEnv = (process.env.FRONTEND_ORIGIN || 'http://localhost:8080')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Common local Vite / dev server origins. Merged so a deployed API (e.g. Render)
 * still answers browser requests when the storefront runs on localhost with
 * VITE_API_URL pointing at production — without a separate CORS deploy step.
 */
const LOCAL_DEV_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

const origins = [...new Set([...fromEnv, ...LOCAL_DEV_ORIGINS])];

app.use(
  cors({
    origin: origins,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend server is running',
    database: Boolean(process.env.DATABASE_URL),
  });
});

const adminRouter = Router();
adminRouter.use(adminAuthRouter);
adminRouter.use(adminProductsRouter);
adminRouter.use('/settings', adminSettingsRouter);
adminRouter.use(adminCouponsRouter);
adminRouter.use(adminAuditRouter);
adminRouter.use(adminMediaRouter);
adminRouter.use(adminOrdersRouter);
app.use('/api/admin', adminRouter);

app.use('/api/public', publicCatalogRouter);
app.use('/api/public/settings', publicSettingsRouter);
app.use('/api/public', publicCouponsRouter);

app.post('/api/send-order-email', async (req, res) => {
  try {
    if (!resend || !process.env.ADMIN_EMAIL) {
      return res.status(503).json({
        success: false,
        error: 'Email service not configured (RESEND_API_KEY / ADMIN_EMAIL)',
      });
    }

    const {
      paymentMethod,
      customerName,
      email,
      phoneNumber,
      deliveryLocation,
      orderItems,
      subtotal,
      deliveryFee,
      total,
    } = req.body;

    if (!customerName || !email || !phoneNumber || !deliveryLocation) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    let orderItemsHtml = '';
    if (orderItems && orderItems.length > 0) {
      orderItemsHtml = orderItems
        .map((item) => {
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
        })
        .join('');
    }

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
              <tr><td style="padding: 8px 0; font-weight: bold; width: 150px;">Name:</td><td style="padding: 8px 0;">${customerName}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td style="padding: 8px 0;">${email}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td style="padding: 8px 0;">${phoneNumber}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Delivery Location:</td><td style="padding: 8px 0;">${deliveryLocation}</td></tr>
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
              <tbody>${orderItemsHtml}</tbody>
            </table>
          </div>
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #667eea; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Order Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-size: 16px;">Subtotal:</td><td style="padding: 8px 0; text-align: right; font-size: 16px;">$${Number(subtotal).toFixed(2)}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 16px;">Delivery Fee:</td><td style="padding: 8px 0; text-align: right; font-size: 16px;">$${Number(deliveryFee).toFixed(2)}</td></tr>
              <tr style="border-top: 2px solid #667eea;">
                <td style="padding: 15px 0 0 0; font-size: 20px; font-weight: bold; color: #667eea;">Total:</td>
                <td style="padding: 15px 0 0 0; text-align: right; font-size: 20px; font-weight: bold; color: #667eea;">$${Number(total).toFixed(2)}</td>
              </tr>
            </table>
          </div>` : `
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #667eea; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Total Amount</h2>
            <p style="font-size: 24px; font-weight: bold; color: #667eea; margin: 15px 0;">$${Number(total).toFixed(2)}</p>
          </div>`}
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;"><strong>Payment Method:</strong> ${paymentMethod || 'COD'}</p>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>Automated notification from KHA Mobile storefront.</p>
          <p>Order received at: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM || 'onboarding@resend.dev',
      to: [process.env.ADMIN_EMAIL],
      subject: `New order from ${customerName}`,
      html: emailHtml,
    });

    res.json({
      success: true,
      message: 'Order email sent successfully',
      emailId: data.id,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send order email',
      details: error.message,
    });
  }
});

// Multer / upload errors
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err?.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message || 'Bad request' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend http://localhost:${PORT}`);
  console.log(`CORS origins: ${origins.join(', ')}`);
  if (process.env.SITE_URL) console.log(`SITE_URL (storefront): ${process.env.SITE_URL}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'configured' : 'not set (admin/catalog API disabled)'}`);
  console.log(`Resend: ${process.env.RESEND_API_KEY ? 'on' : 'off'}`);
});
