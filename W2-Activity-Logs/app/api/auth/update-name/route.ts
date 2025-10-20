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
    const { name } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Connect to AUTH database
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

    // Update user with name
    user.name = name.trim();
    await user.save();

    console.log(`[UPDATE-NAME] ✅ Updated name for user ${user.email || user.phone} to ${name}`);

    return NextResponse.json({
      success: true,
      message: 'Name updated successfully',
      data: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      }
    });

  } catch (error) {
    console.error('Update name API error:', error);
    return NextResponse.json(
      { error: 'Failed to update name' },
      { status: 500 }
    );
  }
}
