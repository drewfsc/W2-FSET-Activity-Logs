import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Activity from '@/models/Activity';

// GET /api/activities - Get all activities or filter by userId
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let query: any = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const activities = await Activity.find(query)
      .populate('userId', 'name email')
      .sort({ date: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      data: activities
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create a new activity
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
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
