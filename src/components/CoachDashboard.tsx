import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Search,
  Plus,
  Eye,
  MessageSquare,
  X,
  Filter,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  User as UserIcon
} from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import type { User } from '../App';

interface CoachDashboardProps {
  user: User;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  program: 'W-2' | 'FSET' | 'Both';
  enrollmentDate: string;
  lastActivity: string;
  totalHours: number;
  status: 'active' | 'inactive' | 'completed';
  upcomingActivities: number;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
}

interface ActivityRecord {
  id: string;
  clientId: string;
  clientName: string;
  program: 'W-2' | 'FSET';
  type: string;
  description: string;
  date: string;
  duration: number;
  status: 'completed' | 'scheduled' | 'missed';
  notes?: string;
  coachComments: Comment[];
}

interface Comment {
  id: string;
  coachId: string;
  coachName: string;
  text: string;
  timestamp: string;
}

const CoachDashboard: React.FC<CoachDashboardProps> = ({ user }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'activities' | 'reports'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showClientDetail, setShowClientDetail] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [programFilter, setProgramFilter] = useState<'all' | 'W-2' | 'FSET' | 'Both'>('all');
  
  // Add Client Form State
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    program: 'W-2' as 'W-2' | 'FSET' | 'Both',
    emergencyContact: '',
    emergencyPhone: '',
    notes: ''
  });

  // Mock data
  const clients: Client[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      address: '123 Main St, Milwaukee, WI 53202',
      program: 'W-2',
      enrollmentDate: '2024-01-01',
      lastActivity: '2024-01-15',
      totalHours: 28.5,
      status: 'active',
      upcomingActivities: 2,
      emergencyContact: 'Jane Doe',
      emergencyPhone: '(555) 987-6543',
      notes: 'Motivated participant, good attendance record'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '(555) 234-5678',
      address: '456 Oak Ave, Madison, WI 53703',
      program: 'FSET',
      enrollmentDate: '2023-12-15',
      lastActivity: '2024-01-14',
      totalHours: 45.0,
      status: 'active',
      upcomingActivities: 1,
      emergencyContact: 'Bob Smith',
      emergencyPhone: '(555) 876-5432',
      notes: 'Excellent progress in computer skills training'
    },
    {
      id: '3',
      name: 'Michael Johnson',
      email: 'michael.johnson@email.com',
      phone: '(555) 345-6789',
      address: '789 Pine Rd, Green Bay, WI 54301',
      program: 'Both',
      enrollmentDate: '2023-11-20',
      lastActivity: '2023-12-28',
      totalHours: 62.5,
      status: 'inactive',
      upcomingActivities: 0,
      emergencyContact: 'Sarah Johnson',
      emergencyPhone: '(555) 765-4321',
      notes: 'Needs follow-up, missed last two appointments'
    },
    {
      id: '4',
      name: 'Sarah Williams',
      email: 'sarah.williams@email.com',
      phone: '(555) 456-7890',
      address: '321 Elm St, Appleton, WI 54911',
      program: 'W-2',
      enrollmentDate: '2023-10-10',
      lastActivity: '2024-01-10',
      totalHours: 85.0,
      status: 'completed',
      upcomingActivities: 0,
      emergencyContact: 'Tom Williams',
      emergencyPhone: '(555) 654-3210',
      notes: 'Successfully completed program, found full-time employment'
    }
  ];

  const activities: ActivityRecord[] = [
    {
      id: '1',
      clientId: '1',
      clientName: 'John Doe',
      program: 'W-2',
      type: 'Job Search',
      description: 'Online job application submissions',
      date: '2024-01-15',
      duration: 120,
      status: 'completed',
      notes: 'Applied to 5 positions in retail and customer service',
      coachComments: [
        {
          id: '1',
          coachId: user.id,
          coachName: user.name,
          text: 'Great progress on job applications! Consider focusing on customer service roles based on your experience.',
          timestamp: '2024-01-16T10:30:00Z'
        }
      ]
    },
    {
      id: '2',
      clientId: '2',
      clientName: 'Jane Smith',
      program: 'FSET',
      type: 'Training',
      description: 'Computer skills workshop',
      date: '2024-01-12',
      duration: 180,
      status: 'completed',
      notes: 'Learned Microsoft Office basics',
      coachComments: []
    },
    {
      id: '3',
      clientId: '1',
      clientName: 'John Doe',
      program: 'W-2',
      type: 'Interview',
      description: 'Job interview at ABC Company',
      date: '2024-01-18',
      duration: 60,
      status: 'scheduled',
      coachComments: []
    }
  ];

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    completedThisMonth: 3,
    averageHours: clients.reduce((sum, c) => sum + c.totalHours, 0) / clients.length
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = programFilter === 'all' || client.program === programFilter;
    return matchesSearch && matchesFilter;
  });

  const handleAddComment = () => {
    if (!selectedActivity || !commentText.trim()) return;

    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      coachId: user.id,
      coachName: user.name,
      text: commentText.trim(),
      timestamp: new Date().toISOString()
    };

    selectedActivity.coachComments.push(newComment);
    setCommentText('');
    setShowCommentModal(false);
    setSelectedActivity(null);
  };

  const openCommentModal = (activity: ActivityRecord) => {
    setSelectedActivity(activity);
    setShowCommentModal(true);
  };

  const handleAddClient = () => {
    const client: Client = {
      id: Math.random().toString(36).substr(2, 9),
      ...newClient,
      enrollmentDate: new Date().toISOString().split('T')[0],
      lastActivity: '',
      totalHours: 0,
      status: 'active',
      upcomingActivities: 0
    };
    
    // In a real app, this would be an API call
    clients.push(client);
    setNewClient({
      name: '',
      email: '',
      phone: '',
      address: '',
      program: 'W-2',
      emergencyContact: '',
      emergencyPhone: '',
      notes: ''
    });
    setShowAddClientModal(false);
  };

  const viewClientDetail = (client: Client) => {
    setSelectedClient(client);
    setShowClientDetail(true);
  };

  const getClientActivities = (clientId: string) => {
    return activities.filter(activity => activity.clientId === clientId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('coach.welcome')}</h1>
          <p className="text-gray-600 mt-2">{t('nav.corporation')} - {t('coach.subtitle')}</p>
        </div>

        {/* Client Detail View */}
        {showClientDetail && selectedClient && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowClientDetail(false)}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    {t('client.back')}
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">{t('client.detail.title')}</h2>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Client Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <UserIcon className="h-12 w-12 text-gray-400 bg-gray-100 rounded-full p-2" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedClient.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedClient.program === 'W-2' ? 'bg-blue-100 text-blue-800' :
                        selectedClient.program === 'FSET' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {selectedClient.program} {t('client.program')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{selectedClient.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{selectedClient.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{selectedClient.address}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">{t('client.emergency.contact')}</h4>
                    <p className="text-gray-700">{selectedClient.emergencyContact}</p>
                    <p className="text-gray-700">{selectedClient.emergencyPhone}</p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">{t('client.notes')}</h4>
                    <p className="text-gray-700">{selectedClient.notes}</p>
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">{t('client.progress.summary')}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{selectedClient.totalHours}</p>
                        <p className="text-sm text-gray-600">{t('common.total.hours')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{selectedClient.upcomingActivities}</p>
                        <p className="text-sm text-gray-600">{t('client.upcoming')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-4">{t('client.activity.history')}</h4>
                    <div className="space-y-3">
                      {getClientActivities(selectedClient.id).map((activity) => (
                        <div key={activity.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{activity.description}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              activity.program === 'W-2' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {activity.program}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(activity.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {activity.duration} {t('common.minutes')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        {!showClientDetail && (
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'overview', label: t('dashboard.overview'), icon: TrendingUp },
                  { id: 'clients', label: t('dashboard.clients'), icon: Users },
                  { id: 'activities', label: t('dashboard.activities'), icon: FileText },
                  { id: 'reports', label: t('dashboard.reports'), icon: Calendar }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {!showClientDetail && activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('coach.total.clients')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('coach.active.clients')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeClients}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('coach.completed.month')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedThisMonth}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('coach.avg.hours')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageHours.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('coach.recent.activity')}</h2>
              <div className="space-y-4">
                {clients.slice(0, 5).map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        client.status === 'active' ? 'bg-green-500' :
                        client.status === 'inactive' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-600">{client.program} {t('client.program')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{client.totalHours} {t('common.hours')}</p>
                      <p className="text-sm text-gray-600">{t('common.last.activity')}: {client.lastActivity ? new Date(client.lastActivity).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {!showClientDetail && activeTab === 'clients' && (
          <div className="space-y-6">
            {/* Search and Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('coach.search.clients')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={programFilter}
                      onChange={(e) => setProgramFilter(e.target.value as any)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">{t('program.all')}</option>
                      <option value="W-2">{t('program.w2')}</option>
                      <option value="FSET">{t('program.fset')}</option>
                      <option value="Both">{t('program.both')}</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddClientModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('coach.add.client')}</span>
                </button>
              </div>
            </div>

            {/* Clients List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('client.name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('client.program')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('client.status')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.total.hours')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.last.activity')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{client.name}</div>
                            <div className="text-sm text-gray-500">{client.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            client.program === 'W-2' ? 'bg-blue-100 text-blue-800' :
                            client.program === 'FSET' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {client.program}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            client.status === 'active' ? 'bg-green-100 text-green-800' :
                            client.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {t(`status.${client.status}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {client.totalHours} {t('common.hours')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {client.lastActivity ? new Date(client.lastActivity).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => viewClientDetail(client)}
                            className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>{t('client.view')}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {!showClientDetail && activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('coach.client.activities')}</h2>
              <p className="text-gray-600 mb-6">
                {t('coach.activities.description')}
              </p>
              
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.program === 'W-2' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {activity.program}
                          </span>
                          <span className="text-sm text-gray-500">{activity.type}</span>
                          <span className="text-sm font-medium text-gray-700">{activity.clientName}</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {activity.description}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(activity.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {activity.duration} {t('common.minutes')}
                          </div>
                        </div>
                        {activity.notes && (
                          <p className="text-sm text-gray-600 mb-3">{activity.notes}</p>
                        )}
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : activity.status === 'scheduled'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {activity.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {activity.status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
                          {activity.status === 'missed' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {t(`status.${activity.status}`)}
                        </span>
                        <button
                          onClick={() => openCommentModal(activity)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>{t('coach.comment')}</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Existing Comments */}
                    {activity.coachComments.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">{t('coach.comments')}</h4>
                        <div className="space-y-3">
                          {activity.coachComments.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">{comment.coachName}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.timestamp).toLocaleDateString()} at {new Date(comment.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {!showClientDetail && activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dashboard.reports')}</h2>
              <p className="text-gray-600 mb-6">
                Generate reports and view analytics for your client caseload.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Monthly Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">New Enrollments:</span>
                      <span className="font-medium">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completions:</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Activities:</span>
                      <span className="font-medium">127</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Hours:</span>
                      <span className="font-medium">42.3</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Generate Full Report
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Program Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">W-2 Participants:</span>
                      <span className="font-medium">15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">FSET Participants:</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Both Programs:</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="font-medium text-green-600">78%</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{t('client.add.title')}</h3>
              <button
                onClick={() => setShowAddClientModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('client.name')}
                </label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('client.email')}
                </label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('client.phone')}
                </label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('client.program')}
                </label>
                <select
                  value={newClient.program}
                  onChange={(e) => setNewClient({...newClient, program: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="W-2">{t('program.w2')}</option>
                  <option value="FSET">{t('program.fset')}</option>
                  <option value="Both">{t('program.both')}</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('client.address')}
                </label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('client.emergency.contact')}
                </label>
                <input
                  type="text"
                  value={newClient.emergencyContact}
                  onChange={(e) => setNewClient({...newClient, emergencyContact: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('client.emergency.phone')}
                </label>
                <input
                  type="tel"
                  value={newClient.emergencyPhone}
                  onChange={(e) => setNewClient({...newClient, emergencyPhone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('client.notes')}
                </label>
                <textarea
                  rows={3}
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddClientModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddClient}
                disabled={!newClient.name || !newClient.email}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('client.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && selectedActivity && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{t('coach.add.comment')}</h3>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>{selectedActivity.clientName}</strong> - {selectedActivity.description}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(selectedActivity.date).toLocaleDateString()} | {selectedActivity.duration} {t('common.minutes')}
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                {t('coach.your.comment')}
              </label>
              <textarea
                id="comment"
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('coach.comment.placeholder')}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {t('coach.cancel')}
              </button>
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('coach.add.comment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachDashboard;