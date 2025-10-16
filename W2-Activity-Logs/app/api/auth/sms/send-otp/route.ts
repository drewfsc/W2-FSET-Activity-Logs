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

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use E.164 format (e.g., +12345678900)' },
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
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: phoneNumber,
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
