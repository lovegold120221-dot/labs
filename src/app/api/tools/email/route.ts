import sgMail from '@sendgrid/mail';
import { NextResponse } from 'next/server';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'csr@eburon.ai';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Eburon AI Assistant';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export const dynamic = 'force-dynamic';

interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  from?: string;
  replyTo?: string;
}

export async function POST(req: Request) {
  try {
    const body: SendEmailRequest = await req.json();
    const { to, subject, body: emailBody, from, replyTo } = body;

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    if (!SENDGRID_API_KEY) {
      console.error('[send-email] SendGrid API key not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const msg = {
      to,
      from: {
        email: from || FROM_EMAIL,
        name: FROM_NAME
      },
      replyTo: replyTo || FROM_EMAIL,
      subject,
      text: emailBody,
      html: emailBody.replace(/\n/g, '<br>'),
    };

    await sgMail.send(msg);
    console.log('[send-email] Email sent to:', to);
    
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('[send-email] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'SendGrid Email',
    configured: !!SENDGRID_API_KEY,
    from: FROM_EMAIL,
    capabilities: [
      'send_email',
      'html_format',
      'reply_to'
    ]
  });
}