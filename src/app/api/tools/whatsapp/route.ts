import { NextResponse } from 'next/server';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '';

export const dynamic = 'force-dynamic';

interface SendWhatsAppRequest {
  to: string;
  body: string;
  mediaUrl?: string;
}

function formatWhatsAppNumber(number: string): string {
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    return `+${cleaned.substring(1)}`;
  }
  if (!cleaned.startsWith('+') && !cleaned.startsWith('00')) {
    return `+${cleaned}`;
  }
  return cleaned.startsWith('00') ? `+${cleaned.substring(2)}` : cleaned;
}

export async function POST(req: Request) {
  try {
    const body: SendWhatsAppRequest = await req.json();
    const { to, body: message, mediaUrl } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, body' },
        { status: 400 }
      );
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.error('[send-whatsapp] Twilio credentials not configured');
      return NextResponse.json(
        { error: 'WhatsApp service not configured' },
        { status: 500 }
      );
    }

    const toNumber = formatWhatsAppNumber(to);
    const fromNumber = TWILIO_WHATSAPP_NUMBER.replace('whatsapp:', '');

    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const formData = new URLSearchParams();
    formData.append('To', toNumber);
    formData.append('From', fromNumber);
    formData.append('Body', message);
    if (mediaUrl) {
      formData.append('MediaUrl', mediaUrl);
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('[send-whatsapp] Twilio error:', result);
      return NextResponse.json(
        { error: result.message || 'Failed to send WhatsApp message' },
        { status: response.status }
      );
    }

    console.log('[send-whatsapp] Message sent:', result.sid);
    
    return NextResponse.json({
      success: true,
      messageId: result.sid,
      status: result.status,
    });
  } catch (error) {
    console.error('[send-whatsapp] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send WhatsApp message' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Twilio WhatsApp',
    configured: !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN),
    from: TWILIO_WHATSAPP_NUMBER,
    capabilities: [
      'send_whatsapp',
      'send_media',
      'template_messages'
    ]
  });
}