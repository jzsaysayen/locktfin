import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import QRCode from 'qrcode';

// Import OrderStatus type
type OrderStatus = 'RECEIVED' | 'IN_PROGRESS' | 'PICKUP' | 'COMPLETE';

// Types
type OrderWithDetails = {
  id: string;
  trackId: string;
  customerName: string;
  customerEmail: string;
  price: number;
  status: OrderStatus;
};

type UserSettings = {
  resendApiKey: string | null;
  emailFromAddress: string | null;
  pickupEmailSubject: string;
  pickupEmailMessage: string;
};

// Helper function to generate tracking ID
function generateTrackId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `LL-${timestamp}-${random}`.toUpperCase();
}

// Helper function to send email with QR code
async function sendOrderEmail(
  order: OrderWithDetails,
  settings: UserSettings,
  type: 'confirmation' | 'pickup'
) {
  if (!settings.resendApiKey || !settings.emailFromAddress) {
    console.log('Email settings not configured, skipping email');
    return { success: false, message: 'Email settings not configured' };
  }

  try {
    const resend = new Resend(settings.resendApiKey);
    
    // Generate tracking URL
    const trackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/${order.trackId}`;

    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(trackUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    let subject = '';
    let htmlContent = '';

    if (type === 'confirmation') {
      // Order placement confirmation with QR code
      subject = `Order Placed - ${order.trackId}`;
      
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
              <h1 style="color: #2563eb; margin-top: 0;">Order Confirmation</h1>
              <p style="font-size: 16px; margin-bottom: 10px;">Hi <strong>${order.customerName}</strong>,</p>
              <p style="font-size: 16px;">Thank you for choosing LaundryLink!</p>
              <p style="font-size: 16px;">Your order has been placed successfully. We will notify you when it's ready for pickup and send you the final price.</p>
            </div>
            
            <div style="background-color: #fff; border: 2px solid #e5e7eb; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Order Details</h2>
              <p style="margin: 8px 0;"><strong>Tracking ID:</strong> <span style="color: #2563eb; font-size: 18px;">${order.trackId}</span></p>
              <p style="margin: 8px 0;"><strong>Status:</strong> Order Received</p>
            </div>
            
            <div style="text-align: center; background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Track Your Order</h2>
              <p style="margin-bottom: 20px;">Scan this QR code to track your order anytime:</p>
              <img src="cid:qrcode" alt="QR Code" style="max-width: 250px; width: 100%; height: auto; margin: 20px 0;" />
              <p style="margin-top: 20px;">Or visit: <a href="${trackUrl}" style="color: #2563eb; text-decoration: none; word-break: break-all;">${trackUrl}</a></p>
            </div>
            
            <div style="background-color: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 14px;"><strong>💡 Tip:</strong> Save this email or take a screenshot of the QR code for easy access to your order tracking page.</p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
              <p>Thank you for choosing LaundryLink!</p>
              <p style="margin-top: 10px;">Questions? Reply to this email and we'll be happy to help.</p>
            </div>
          </body>
        </html>
      `;
    } else {
      // Pickup notification
      subject = settings.pickupEmailSubject
        .replace('{trackId}', order.trackId)
        .replace('{customerName}', order.customerName)
        .replace('{price}', order.price.toString());

      const message = settings.pickupEmailMessage
        .replace(/{customerName}/g, order.customerName)
        .replace(/{trackId}/g, order.trackId)
        .replace(/{price}/g, order.price.toString())
        .replace(/{trackUrl}/g, trackUrl);

      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ready for Pickup</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f0fdf4; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
              <h1 style="color: #16a34a; margin-top: 0;">🎉 Ready for Pickup!</h1>
              ${message.split('\n').map(line => `<p style="font-size: 16px; margin: 8px 0;">${line}</p>`).join('')}
            </div>
            
            <div style="text-align: center; background-color: #f8f9fa; border-radius: 10px; padding: 30px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Quick Access QR Code</h2>
              <p style="margin-bottom: 20px;">Show this QR code when picking up:</p>
              <img src="cid:qrcode" alt="QR Code" style="max-width: 250px; width: 100%; height: auto; margin: 20px 0;" />
              <p style="margin-top: 20px;"><a href="${trackUrl}" style="color: #2563eb; text-decoration: none;">View Order Details</a></p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
              <p>Thank you for choosing LaundryLink!</p>
            </div>
          </body>
        </html>
      `;
    }

    const result = await resend.emails.send({
      from: settings.emailFromAddress,
      to: order.customerEmail,
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrCodeBuffer,
          contentId: 'qrcode', // Changed from content_id to contentId
        },
      ],
    });

    console.log('Email sent successfully:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { customerName, customerNumber, customerEmail, price, notes, status, sendEmail } = body;

    // Validate required fields
    if (!customerName || !customerNumber || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate tracking ID
    const trackId = generateTrackId();

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        trackId,
        customerName,
        customerNumber,
        customerEmail,
        price: price || 0,
        status: status || 'RECEIVED',
        notes: notes || null,
      },
    });

    // Create initial status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: order.status,
      },
    });

    // Send email if requested
    let emailResult = null;
    if (sendEmail) {
      const settings = await prisma.userSettings.findUnique({
        where: { userId: user.id },
      });

      if (settings) {
        const emailType = status === 'PICKUP' ? 'pickup' : 'confirmation';
        emailResult = await sendOrderEmail(order, settings, emailType);
      }
    }

    return NextResponse.json({ 
      success: true, 
      order,
      emailSent: emailResult?.success || false,
      emailMessage: emailResult?.message
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}