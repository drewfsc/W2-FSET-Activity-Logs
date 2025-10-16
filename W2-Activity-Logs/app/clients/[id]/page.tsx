'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, User as UserIcon, Mail, Phone, MapPin, Briefcase, MessageSquare, Send } from 'lucide-react';

interface ClientData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  level: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  homeCounty?: string;
  lastLogin?: Date;
  timestamp?: Date;
}

interface ActivityComment {
  userId: string;
  userName: string;
  userRole: string;
  comment: string;
  timestamp: Date;
}

interface Activity {
  _id: string;
  userId: any;
  activityType: string;
  description: string;
  date: string;
  duration?: number;
  status: string;
  notes?: string;
  comments?: ActivityComment[];
  createdAt: string;
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState<{[key: string]: string}>({});
  const [submittingComment, setSubmittingComment] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Only coaches can access this page
      if (session.user.role !== 'coach') {
        router.push('/dashboard');
      } else {
        fetchClientData();
        fetchClientActivities();
      }
    }
  }, [status, session, router, params.id]);

  const fetchClientData = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setClientData(data.data);
      } else {
        setError(data.error || 'Failed to load client data');
      }
    } catch (err) {
      console.error('Error fetching client:', err);
      setError('Failed to load client data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClientActivities = async () => {
    try {
      const response = await fetch(`/api/activities?userId=${params.id}`);
      const data = await response.json();

      if (data.success) {
        setActivities(data.data);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const handleAddComment = async (activityId: string) => {
    const comment = commentText[activityId]?.trim();
    if (!comment) return;

    setSubmittingComment(prev => ({ ...prev, [activityId]: true }));

    try {
      const response = await fetch(`/api/activities/${activityId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear comment input
        setCommentText(prev => ({ ...prev, [activityId]: '' }));
        // Refresh activities to show new comment
        fetchClientActivities();
      } else {
        alert(data.error || 'Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(prev => ({ ...prev, [activityId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      'Completed': 'badge-success',
      'Pending': 'badge-warning',
      'Cancelled': 'badge-error'
    };
    return classes[status as keyof typeof classes] || 'badge-ghost';
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Client Not Found</h2>
          <Link href="/dashboard" className="btn btn-primary">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Navbar */}
      <div className="navbar bg-primary text-primary-content">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">W-2 Activity Logs</a>
        </div>
        <div className="flex-none">
          <Link href="/dashboard" className="btn btn-ghost">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="container mx-auto p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Client Details</h1>
          <p className="text-base-content opacity-70">
            View client information and recent activity history
          </p>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {/* Client Info Card */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <UserIcon className="h-6 w-6" />
              {clientData.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 opacity-70" />
                <div>
                  <div className="text-sm opacity-70">Email</div>
                  <div className="font-semibold">{clientData.email}</div>
                </div>
              </div>

              {clientData.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 opacity-70" />
                  <div>
                    <div className="text-sm opacity-70">Phone</div>
                    <div className="font-semibold">{clientData.phone}</div>
                  </div>
                </div>
              )}

              {(clientData.street || clientData.city) && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="h-5 w-5 opacity-70" />
                  <div>
                    <div className="text-sm opacity-70">Address</div>
                    <div className="font-semibold">
                      {clientData.street && `${clientData.street}, `}
                      {clientData.city && clientData.city}
                      {clientData.state && `, ${clientData.state}`}
                      {clientData.zip && ` ${clientData.zip}`}
                    </div>
                  </div>
                </div>
              )}

              {clientData.lastLogin && (
                <div>
                  <div className="text-sm opacity-70">Last Login</div>
                  <div className="font-semibold">{formatDateTime(clientData.lastLogin)}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activities Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <Briefcase className="h-6 w-6" />
              Recent Activities
            </h2>

            {activities.length === 0 ? (
              <div className="text-center py-12 opacity-70">
                <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>No activities found for this client</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity._id} className="card bg-base-200">
                    <div className="card-body">
                      {/* Activity Header */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{activity.activityType}</h3>
                          <p className="text-sm opacity-70">{formatDate(activity.date)}</p>
                        </div>
                        <span className={`badge ${getStatusBadge(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>

                      {/* Activity Details */}
                      <p className="mb-2">{activity.description}</p>
                      {activity.duration && (
                        <p className="text-sm opacity-70">Duration: {activity.duration} minutes</p>
                      )}
                      {activity.notes && (
                        <div className="alert alert-info mt-2">
                          <span className="text-sm">{activity.notes}</span>
                        </div>
                      )}

                      {/* Comments Section */}
                      <div className="divider"></div>
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Comments
                        </h4>

                        {/* Existing Comments */}
                        {activity.comments && activity.comments.length > 0 && (
                          <div className="space-y-2">
                            {activity.comments.map((comment, idx) => (
                              <div key={idx} className="bg-base-100 p-3 rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-semibold text-sm">{comment.userName}</span>
                                  <span className="text-xs opacity-70">{formatDateTime(comment.timestamp)}</span>
                                </div>
                                <p className="text-sm">{comment.comment}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Comment Form */}
                        <div className="flex gap-2">
                          <textarea
                            className="textarea textarea-bordered flex-1"
                            placeholder="Add a comment..."
                            value={commentText[activity._id] || ''}
                            onChange={(e) => setCommentText(prev => ({
                              ...prev,
                              [activity._id]: e.target.value
                            }))}
                            rows={2}
                          />
                          <button
                            className="btn btn-primary"
                            onClick={() => handleAddComment(activity._id)}
                            disabled={!commentText[activity._id]?.trim() || submittingComment[activity._id]}
                          >
                            {submittingComment[activity._id] ? (
                              <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                              <Send className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
