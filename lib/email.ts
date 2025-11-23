// lib/email.ts
import { Resend } from 'resend';

interface EmailData {
  customerName: string;
  customerEmail: string;
  trackId: string;
  price: number;
  trackUrl: string;
}

export async function sendPickupNotification(
  emailData: EmailData,
  settings: {
    resendApiKey: string;
    emailFromAddress: string;
    pickupEmailSubject: string;
    pickupEmailMessage: string;
  }
) {
  try {
    const resend = new Resend(settings.resendApiKey);

    // Replace placeholders in subject
    const subject = settings.pickupEmailSubject
      .replace('{trackId}', emailData.trackId)
      .replace('{customerName}', emailData.customerName)
      .replace('{price}', `₱${emailData.price.toFixed(2)}`);

    // Replace placeholders in message
    const message = settings.pickupEmailMessage
      .replace('{customerName}', emailData.customerName)
      .replace('{trackId}', emailData.trackId)
      .replace('{price}', `₱${emailData.price.toFixed(2)}`)
      .replace('{trackUrl}', emailData.trackUrl);

    // Send email
    const { data, error } = await resend.emails.send({
      from: settings.emailFromAddress,
      to: emailData.customerEmail,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🧺 LaundryLink</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            ${message.split('\n').map(line => {
              if (line.startsWith('•')) {
                return `<p style="margin: 5px 0; padding-left: 20px;">${line}</p>`;
              }
              return `<p style="margin: 10px 0; color: #374151;">${line}</p>`;
            }).join('')}
            
            <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0; font-weight: bold; color: #667eea;">Track Your Order</p>
              <a href="${emailData.trackUrl}" style="color: #667eea; text-decoration: none; word-break: break-all;">${emailData.trackUrl}</a>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
              <p>Thank you for choosing LaundryLink!</p>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error in sendPickupNotification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}