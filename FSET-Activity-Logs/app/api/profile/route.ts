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

export async function PATCH(request: NextRequest) {
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

    // Only allow updating specific fields
    const allowedFields = ['phone', 'street', 'city', 'state', 'zip', 'homeCounty'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Connect to FSC database
    const authConnection = await authDbConnect();
    const AuthUser = getAuthUserModel(authConnection);

    // Update user
    const updatedUser = await AuthUser.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return updated user data
    return NextResponse.json({
      success: true,
      data: {
        _id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        level: updatedUser.level,
        programs: updatedUser.programs,
        city: updatedUser.city,
        state: updatedUser.state,
        street: updatedUser.street,
        zip: updatedUser.zip,
        county: updatedUser.county,
        homeCounty: updatedUser.homeCounty,
        image: updatedUser.image,
        emailVerified: updatedUser.emailVerified,
        lastLogin: updatedUser.lastLogin,
        timestamp: updatedUser.timestamp,
        isYouth: updatedUser.isYouth,
        appearance: updatedUser.appearance,
        coach: updatedUser.coach,
        coachUpdate: updatedUser.coachUpdate,
      }
    });

  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
