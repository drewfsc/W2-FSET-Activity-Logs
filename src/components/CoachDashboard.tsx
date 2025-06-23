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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{t('coach.welcome')}</h1>
          <p className="text-gray-300 mt-2">{t('nav.corporation')} - {t('coach.subtitle')}</p>
        </div>

        {/* Client Detail View */}
        {showClientDetail && selectedClient && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-2xl p-6 border border-gray-600">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowClientDetail(false)}
                    className="flex items-center text-gray-300 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    {t('client.back')}
                  </button>
                  <h2 className="text-2xl font-bold text-white">{t('client.detail.title')}</h2>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Client Information */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <UserIcon className="h-12 w-12 text-gray-400 bg-gray-600 rounded-full p-2" />
                    <div>
                      <h3 className="text-xl font-semibold text-white">{selectedClient.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedClient.program === 'W-2' ? 'bg-blue-600 text-blue-100' :
                        selectedClient.program === 'FSET' ? 'bg-green-600 text-green-100' :
                        'bg-purple-600 text-purple-100'
                      }`}>
                        {selectedClient.program} {t('client.program')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-300">{selectedClient.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-300">{selectedClient.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-300">{selectedClient.address}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-600 pt-4">
                    <h4 className="font-medium text-white mb-2">{t('client.emergency.contact')}</h4>
                    <p className="text-gray-300">{selectedClient.emergencyContact}</p>
                    <p className="text-gray-300">{selectedClient.emergencyPhone}</p>
                  </div>

                  <div className="border-t border-gray-600 pt-4">
                    <h4 className="font-medium text-white mb-2">{t('client.notes')}</h4>
                    <p className="text-gray-300">{selectedClient.notes}</p>
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-4">{t('client.progress.summary')}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-400">{selectedClient.totalHours}</p>
                        <p className="text-sm text-gray-300">{t('common.total.hours')}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{selectedClient.upcomingActivities}</p>
                        <p className="text-sm text-gray-300">{t('client.upcoming')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-600 pt-4">
                    <h4 className="font-medium text-white mb-4">{t('client.activity.history')}</h4>
                    <div className="space-y-3">
                      {getClientActivities(selectedClient.id).map((activity) => (
                        <div key={activity.id} className="bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-500 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">{activity.description}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              activity.program === 'W-2' 
                                ? 'bg-blue-600 text-blue-100' 
                                : 'bg-green-600 text-green-100'
                            }`}>
                              {activity.program}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-300">
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
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-2xl mb-8 border border-gray-600">
            <div className="border-b border-gray-600">
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
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                      activeTab === id
                        ? 'border-green-400 text-green-400'
                        : 'border-transparent text-gray-300 hover:text-white hover:border-gray-400'
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
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 border border-gray-600 hover:border-blue-400 transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">{t('coach.total.clients')}</p>
                    <p className="text-2xl font-bold text-white">{stats.totalClients}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 border border-gray-600 hover:border-green-400 transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">{t('coach.active.clients')}</p>
                    <p className="text-2xl font-bold text-white">{stats.activeClients}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 border border-gray-600 hover:border-purple-400 transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">{t('coach.completed.month')}</p>
                    <p className="text-2xl font-bold text-white">{stats.completedThisMonth}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 border border-gray-600 hover:border-orange-400 transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">{t('coach.avg.hours')}</p>
                    <p className="text-2xl font-bold text-white">{stats.averageHours.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 border border-gray-600">
              <h2 className="text-xl font-bold text-white mb-4">{t('coach.recent.activity')}</h2>
              <div className="space-y-4">
                {clients.slice(0, 5).map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-500 rounded-lg hover:border-blue-400 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        client.status === 'active' ? 'bg-green-400' :
                        client.status === 'inactive' ? 'bg-yellow-400' : 'bg-blue-400'
                      }`}></div>
                      <div>
                        <p className="font-medium text-white">{client.name}</p>
                        <p className="text-sm text-gray-300">{client.program} {t('client.program')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{client.totalHours} {t('common.hours')}</p>
                      <p className="text-sm text-gray-300">{t('common.last.activity')}: {client.lastActivity ? new Date(client.lastActivity).toLocaleDateString() : 'N/A'}</p>
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
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 border border-gray-600">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('coach.search.clients')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 hover:border-gray-500 transition-all duration-200"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={programFilter}
                      onChange={(e) => setProgramFilter(e.target.value as any)}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-white hover:border-gray-500 transition-all duration-200"
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
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('coach.add.client')}</span>
                </button>
              </div>
            </div>

            {/* Clients List */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-lg overflow-hidden border border-gray-600">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600">
                  <thead className="bg-gradient-to-r from-gray-700 to-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {t('client.name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {t('client.program')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {t('client.status')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {t('common.total.hours')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {t('common.last.activity')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gradient-to-r from-gray-800 to-gray-700 divide-y divide-gray-600">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-600 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{client.name}</div>
                            <div className="text-sm text-gray-300">{client.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            client.program === 'W-2' ? 'bg-blue-600 text-blue-100' :
                            client.program === 'FSET' ? 'bg-green-600 text-green-100' :
                            'bg-purple-600 text-purple-100'
                          }`}>
                            {client.program}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            client.status === 'active' ? 'bg-green-600 text-green-100' :
                            client.status === 'inactive' ? 'bg-yellow-600 text-yellow-100' :
                            'bg-blue-600 text-blue-100'
                          }`}>
                            {t(`status.${client.status}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {client.totalHours} {t('common.hours')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {client.lastActivity ? new Date(client.lastActivity).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => viewClientDetail(client)}
                            className="text-green-400 hover:text-green-300 flex items-center space-x-1 transition-colors"
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
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 border border-gray-600">
              <h2 className="text-2xl font-bold text-white mb-4">{t('coach.client.activities')}</h2>
              <p className="text-gray-300 mb-6">
                {t('coach.activities.description')}
              </p>
              
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-500 rounded-lg p-6 hover:border-blue-400 transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.program === 'W-2' 
                              ? 'bg-blue-600 text-blue-100' 
                              : 'bg-green-600 text-green-100'
                          }`}>
                            {activity.program}
                          </span>
                          <span className="text-sm text-gray-400">{activity.type}</span>
                          <span className="text-sm font-medium text-gray-300">{activity.clientName}</span>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">
                          {activity.description}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-300 mb-2">
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
                          <p className="text-sm text-gray-300 mb-3">{activity.notes}</p>
                        )}
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.status === 'completed'
                            ? 'bg-green-600 text-green-100'
                            : activity.status === 'scheduled'
                            ? 'bg-yellow-600 text-yellow-100'
                            : 'bg-red-600 text-red-100'
                        }`}>
                          {activity.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {activity.status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
                          {activity.status === 'missed' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {t(`status.${activity.status}`)}
                        </span>
                        <button
                          onClick={() => openCommentModal(activity)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-1 text-sm shadow-lg transform hover:scale-105"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>{t('coach.comment')}</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Existing Comments */}
                    {activity.coachComments.length > 0 && (
                      <div className="mt-4 border-t border-gray-600 pt-4">
                        <h4 className="text-sm font-medium text-white mb-3">{t('coach.comments')}</h4>
                        <div className="space-y-3">
                          {activity.coachComments.map((comment) => (
                            <div key={comment.id} className="bg-gradient-to-r from-gray-600 to-gray-500 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">{comment.coachName}</span>
                                <span className="text-xs text-gray-300">
                                  {new Date(comment.timestamp).toLocaleDateString()} at {new Date(comment.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-200">{comment.text}</p>
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
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 border border-gray-600">
              <h2 className="text-2xl font-bold text-white mb-4">{t('dashboard.reports')}</h2>
              <p className="text-gray-300 mb-6">
                Generate reports and view analytics for your client caseload.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-700 to-gray-600 border border-gray-500 rounded-lg p-6 hover:border-blue-400 transition-all duration-200">
                  <h3 className="font-semibold text-white mb-4">Monthly Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">New Enrollments:</span>
                      <span className="font-medium text-white">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Completions:</span>
                      <span className="font-medium text-white">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Total Activities:</span>
                      <span className="font-medium text-white">127</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Average Hours:</span>
                      <span className="font-medium text-white">42.3</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg transform hover:scale-105">
                    Generate Full Report
                  </button>
                </div>
                
                <div className="bg-gradient-to-br from-gray-700 to-gray-600 border border-gray-500 rounded-lg p-6 hover:border-green-400 transition-all duration-200">
                  <h3 className="font-semibold text-white mb-4">Program Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">W-2 Participants:</span>
                      <span className="font-medium text-white">15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">FSET Participants:</span>
                      <span className="font-medium text-white">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Both Programs:</span>
                      <span className="font-medium text-white">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Success Rate:</span>
                      <span className="font-medium text-green-400">78%</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg transform hover:scale-105">
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
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">{t('client.add.title')}</h3>
              <button
                onClick={() => setShowAddClientModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('client.name')}
                </label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-white hover:border-gray-500 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('client.email')}
                </label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-white hover:border-gray-500 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('client.phone')}
                </label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-white hover:border-gray-500 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('client.program')}
                </label>
                <select
                  value={newClient.program}
                  onChange={(e) => setNewClient({...newClient, program: e.target.value as any})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-white hover:border-gray-500 transition-all duration-200"
                >
                  <option value="W-2">{t('program.w2')}</option>
                  <option value="FSET">{t('program.fset')}</option>
                  <option value="Both">{t('program.both')}</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('client.address')}
                </label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-white hover:border-gray-500 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('client.emergency.contact')}
                </label>
                <input
                  type="text"
                  value={newClient.emergencyContact}
                  onChange={(e) => setNewClient({...newClient, emergencyContact: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-white hover:border-gray-500 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('client.emergency.phone')}
                </label>
                <input
                  type="tel"
                  value={newClient.emergencyPhone}
                  onChange={(e) => setNewClient({...newClient, emergencyPhone: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-white hover:border-gray-500 transition-all duration-200"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('client.notes')}
                </label>
                <textarea
                  rows={3}
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-white hover:border-gray-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddClientModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddClient}
                disabled={!newClient.name || !newClient.email}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg transform hover:scale-105"
              >
                {t('client.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && selectedActivity && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg max-w-lg w-full p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">{t('coach.add.comment')}</h3>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-300 mb-2">
                <strong>{selectedActivity.clientName}</strong> - {selectedActivity.description}
              </p>
              <p className="text-sm text-gray-400">
                {new Date(selectedActivity.date).toLocaleDateString()} | {selectedActivity.duration} {t('common.minutes')}
              </p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
                {t('coach.your.comment')}
              </label>
              <textarea
                id="comment"
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 hover:border-gray-500 transition-all duration-200"
                placeholder={t('coach.comment.placeholder')}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
              >
                {t('coach.cancel')}
              </button>
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg transform hover:scale-105"
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