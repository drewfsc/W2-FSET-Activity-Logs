import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import authDbConnect from '@/lib/authDb';
import Activity from '@/models/Activity';
import { getAuthUserModel } from '@/models/AuthUser';

// GET /api/activities - Get all activities or filter by userId
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

    // Connect to both databases
    await dbConnect(); // W2 activities database
    const authConnection = await authDbConnect(); // FSC auth database
    const AuthUser = getAuthUserModel(authConnection);

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let query: any = {};

    // Clients can only see their own activities
    // Coaches and admins can see all activities
    if (session.user.role === 'client') {
      query.userId = session.user.id;
    } else if (userId) {
      query.userId = userId;
    }

    if (status) query.status = status;

    // Fetch activities without populate (since it's cross-database)
    const activities = await Activity.find(query)
      .sort({ date: -1 })
      .limit(100)
      .lean();

    // Manually populate user data from AUTH database
    const enrichedActivities = await Promise.all(
      activities.map(async (activity) => {
        const user = await AuthUser.findById(activity.userId).select('name email').lean();
        return {
          ...activity,
          userId: user ? { _id: activity.userId, name: user.name, email: user.email } : activity.userId
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedActivities
    });
  } catch (error: any) {
    console.error('[API] Error fetching activities:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create a new activity
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

    await dbConnect();

    const body = await request.json();

    // Validate required fields for new log-based system
    if (!body.logType) {
      return NextResponse.json(
        { success: false, error: 'logType is required' },
        { status: 400 }
      );
    }

    if (!body.weekStart) {
      return NextResponse.json(
        { success: false, error: 'weekStart is required' },
        { status: 400 }
      );
    }

    // Ensure the activity is created for the authenticated user
    // (unless they're a coach/admin creating on behalf of someone)
    if (session.user.role === 'client') {
      body.userId = session.user.id;
    }

    const activity = await Activity.create(body);

    return NextResponse.json(
      { success: true, data: activity },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
