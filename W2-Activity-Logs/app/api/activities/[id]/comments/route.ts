import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Activity from '@/models/Activity';
import mongoose from 'mongoose';

// POST /api/activities/[id]/comments - Add a comment to an activity
export async function POST(
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

    await dbConnect();

    // Get the activity
    const activity = await Activity.findById(id);

    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { comment } = body;

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment is required' },
        { status: 400 }
      );
    }

    // Create comment object
    const newComment = {
      userId: new mongoose.Types.ObjectId(session.user.id),
      userName: session.user.name || session.user.email || 'Unknown User',
      userRole: session.user.role || 'client',
      comment: comment.trim(),
      timestamp: new Date(),
    };

    // Add comment to activity
    if (!activity.comments) {
      activity.comments = [];
    }
    activity.comments.push(newComment as any);

    await activity.save();

    return NextResponse.json({
      success: true,
      data: newComment
    });
  } catch (error: any) {
    console.error('[API] Error adding comment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
