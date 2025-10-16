import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import authDbConnect from '@/lib/authDb';
import { getAuthUserModel } from '@/models/AuthUser';

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to FSC database
    const authConnection = await authDbConnect();
    const AuthUser = getAuthUserModel(authConnection);

    // Fetch user from FSC users collection
    const user = await AuthUser.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return all user data (excluding sensitive fields if any)
    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        level: user.level,
        programs: user.programs,
        city: user.city,
        state: user.state,
        street: user.street,
        zip: user.zip,
        county: user.county,
        homeCounty: user.homeCounty,
        image: user.image,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        timestamp: user.timestamp,
        isYouth: user.isYouth,
        appearance: user.appearance,
        coach: user.coach,
        coachUpdate: user.coachUpdate,
      }
    });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
