import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import authDbConnect from '@/lib/authDb';
import { getAuthUserModel } from '@/models/AuthUser';

// GET /api/users/[id] - Get a single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Clients cannot access this endpoint
    if (session.user.role === 'client') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Connect to AUTH database (FSC)
    const authConnection = await authDbConnect();
    const AuthUser = getAuthUserModel(authConnection);

    const user = await AuthUser.findById(id)
      .select('name email phone level street city state zip homeCounty county programs lastLogin timestamp coach')
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Coaches can only view clients assigned to them
    if (session.user.role === 'coach') {
      // Check if this coach is assigned to this client
      const isAssignedCoach = user.coach?.some((c: any) => {
        const hasEmail = c.email === session.user.email;
        const isActive = !c.removalDate || new Date(c.removalDate) > new Date();
        return hasEmail && isActive;
      });

      if (!isAssignedCoach) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You are not assigned to this client' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error('[API] Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update a user by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can update user details
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Connect to AUTH database (FSC)
    const authConnection = await authDbConnect();
    const AuthUser = getAuthUserModel(authConnection);

    const body = await request.json();

    // Fields that can be updated
    const allowedFields = [
      'name',
      'email',
      'phone',
      'level',
      'street',
      'city',
      'state',
      'zip',
      'homeCounty',
      'county',
      'programs'
    ];

    // Filter body to only include allowed fields
    const updateData: any = {};
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Update user
    const updatedUser = await AuthUser.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('name email phone level street city state zip homeCounty county programs lastLogin timestamp');

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser
    });
  } catch (error: any) {
    console.error('[API] Error updating user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user by ID (optional - for future use)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can delete users
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Connect to AUTH database (FSC)
    const authConnection = await authDbConnect();
    const AuthUser = getAuthUserModel(authConnection);

    const deletedUser = await AuthUser.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    console.error('[API] Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
