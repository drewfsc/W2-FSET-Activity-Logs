import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Format phone number to E.164 format
    let formattedPhone = phoneNumber.replace(/\D/g, ''); // Remove all non-digits

    // If it doesn't start with country code, assume US (+1)
    if (formattedPhone.length === 10) {
      formattedPhone = `+1${formattedPhone}`;
    } else if (formattedPhone.length === 11 && formattedPhone.startsWith('1')) {
      formattedPhone = `+${formattedPhone}`;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    } else {
      formattedPhone = `+${formattedPhone}`;
    }

    // Validate the formatted phone number
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formattedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Send OTP using Twilio Verify
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const verification = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({
        to: formattedPhone,
        channel: 'sms', // or 'whatsapp' or 'call'
      });

    console.log('SMS OTP sent:', verification.sid);

    return NextResponse.json(
      {
        success: true,
        message: 'Verification code sent successfully',
        sid: verification.sid,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('SMS OTP send error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send verification code',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
