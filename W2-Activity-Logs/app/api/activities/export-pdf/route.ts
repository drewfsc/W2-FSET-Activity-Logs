import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectActivityDb from '@/lib/mongodb';
import connectAuthDb from '@/lib/authDb';
import Activity from '@/models/Activity';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getWeekStart, getWeekEnd, formatWeekRange } from '@/utils/weekUtils';
import { groupActivitiesIntoWeeklyLogs, formatDuration, LOG_SHORT_NAMES } from '@/utils/logUtils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Only coaches can export PDFs
    if (session.user.role !== 'coach') {
      return NextResponse.json({ success: false, error: 'Forbidden - Coach access required' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const weekStartParam = searchParams.get('weekStart');

    if (!userId || !weekStartParam) {
      return NextResponse.json({ success: false, error: 'Missing userId or weekStart parameter' }, { status: 400 });
    }

    // Connect to databases
    await connectActivityDb();
    const authConn = await connectAuthDb();

    // Get user info from auth database
    const AuthUserModel = authConn.model('AuthUser');
    const user = await AuthUserModel.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Verify coach has access to this user
    if (!user.assignedCoaches ||  !user.assignedCoaches.includes(session.user.id)) {
      return NextResponse.json({ success: false, error: 'Forbidden - Not assigned to this user' }, { status: 403 });
    }

    // Parse week start and get week range
    const weekStart = new Date(weekStartParam);
    const weekEnd = getWeekEnd(weekStart);

    // Fetch activities for the specified week
    const activities = await Activity.find({
      userId,
      weekStart: {
        $gte: weekStart,
        $lte: weekEnd,
      },
    }).sort({ date: 1, logType: 1 });

    // Group activities into weekly logs
    const logs = groupActivitiesIntoWeeklyLogs(
      activities.map((a: any) => ({
        _id: a._id.toString(),
        userId: a.userId.toString(),
        logType: a.logType,
        weekStart: a.weekStart.toISOString(),
        activityType: a.activityType,
        description: a.description,
        date: a.date.toISOString(),
        startTime: a.startTime,
        endTime: a.endTime,
        duration: a.duration,
        status: a.status,
        notes: a.notes,
      }))
    );

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(18);
    doc.text('W-2 FSET Activity Logs', pageWidth / 2, 20, { align: 'center' });

    // User info
    doc.setFontSize(12);
    doc.text(`Participant: ${user.name}`, 20, 35);
    doc.text(`Week: ${formatWeekRange(weekStart)}`, 20, 42);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 49);

    let yPosition = 60;

    // Generate a section for each log type
    logs.forEach((log) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Log type header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(log.logType, 20, yPosition);
      yPosition += 7;

      // Total duration
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Time: ${formatDuration(log.totalDuration)}`, 20, yPosition);
      yPosition += 10;

      // Activities table
      const tableData = log.activities.map((activity) => [
        new Date(activity.date).toLocaleDateString(),
        activity.activityType,
        activity.description,
        activity.startTime && activity.endTime
          ? `${activity.startTime} - ${activity.endTime}`
          : '-',
        activity.duration ? formatDuration(activity.duration) : '-',
        activity.status,
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Activity Type', 'Description', 'Time', 'Duration', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202], fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 50 },
          3: { cellWidth: 30 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    });

    // If no logs found
    if (logs.length === 0) {
      doc.setFontSize(12);
      doc.text('No activities found for this week.', 20, yPosition);
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Return PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="activity-log-${user.name.replace(/\s+/g, '-')}-${formatWeekRange(weekStart).replace(/\s+/g, '-')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
