import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import authDbConnect from '@/lib/authDb';
import { getAuthUserModel } from '@/models/AuthUser';

// GET /api/users - Get all users or filter by role (level) with pagination
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only coaches and admins can view user lists
    if (session.user.role === 'client') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Connect to AUTH database (FSC)
    const authConnection = await authDbConnect();
    const AuthUser = getAuthUserModel(authConnection);

    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    let query: any = {};

    // Coaches can only see clients assigned to them
    if (session.user.role === 'coach') {
      query.level = 'client';
      // Filter by coach email in the coach array
      query.coach = {
        $elemMatch: {
          $or: [
            { email: session.user.email },
            { $eq: session.user.email } // In case coach array contains just email strings
          ]
        }
      };
    } else if (level) {
      // Admins can filter by level
      query.level = level;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await AuthUser.countDocuments(query);

    // Fetch users with pagination
    const users = await AuthUser.find(query)
      .select('name email phone level lastLogin timestamp coach')
      .sort({ lastLogin: -1 }) // Sort by most recent login
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + users.length < total
      }
    });
  } catch (error: any) {
    console.error('[API] Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user (Admin only, or use registration endpoint)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admins can create users through this endpoint
    // Regular users should use the /api/auth/register endpoint
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
    const user = await AuthUser.create(body);

    return NextResponse.json(
      { success: true, data: user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API] Error creating user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
