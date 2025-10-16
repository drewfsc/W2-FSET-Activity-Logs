import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import authDbConnect from '@/lib/authDb';
import { getAuthUserModel } from '@/models/AuthUser';

export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, street, city, state, zip, homeCounty, referralSource } = body;

    // Validate required fields
    if (!name || !street || !city || !state || !zip) {
      return NextResponse.json(
        { error: 'Missing required fields: name, street, city, state, zip' },
        { status: 400 }
      );
    }

    // Connect to FSC database
    const authConnection = await authDbConnect();
    const AuthUser = getAuthUserModel(authConnection);

    // Find the user by ID (from session)
    const user = await AuthUser.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user with registration data
    user.name = name;
    user.street = street;
    user.city = city;
    user.state = state;
    user.zip = zip;
    user.homeCounty = homeCounty || '';
    user.referralSource = referralSource || 'W2 Activity Logs';
    user.timestamp = user.timestamp || new Date(); // Set creation time if not already set

    await user.save();

    console.log(`[REGISTRATION] ✅ Completed registration for user ${user.email || user.phone}`);

    return NextResponse.json({
      success: true,
      message: 'Registration completed successfully',
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        referralSource: user.referralSource
      }
    });

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Failed to complete registration' },
      { status: 500 }
    );
  }
}
