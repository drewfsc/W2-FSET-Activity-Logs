import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Target,
  BookOpen
} from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import type { User } from '../App';

interface ClientDashboardProps {
  user: User;
}

interface ActivityRecord {
  id: string;
  program: 'W-2' | 'FSET';
  type: string;
  description: string;
  date: string;
  duration: number;
  status: 'completed' | 'scheduled' | 'missed';
  notes?: string;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'job-search'>('overview');
  const [selectedProgram, setSelectedProgram] = useState<'all' | 'W-2' | 'FSET'>('all');
  const [showNewRecordModal, setShowNewRecordModal] = useState(false);

  // Mock data
  const activities: ActivityRecord[] = [
    {
      id: '1',
      program: 'W-2',
      type: 'Job Search',
      description: 'Online job application submissions',
      date: '2024-01-15',
      duration: 120,
      status: 'completed',
      notes: 'Applied to 5 positions in retail and customer service'
    },
    {
      id: '2',
      program: 'FSET',
      type: 'Training',
      description: 'Computer skills workshop',
      date: '2024-01-12',
      duration: 180,
      status: 'completed',
      notes: 'Learned Microsoft Office basics'
    },
    {
      id: '3',
      program: 'W-2',
      type: 'Interview',
      description: 'Job interview at ABC Company',
      date: '2024-01-18',
      duration: 60,
      status: 'scheduled'
    }
  ];

  const stats = {
    totalHours: 28.5,
    activitiesThisWeek: 4,
    completedActivities: 12,
    upcomingActivities: 3
  };

  const filteredActivities = selectedProgram === 'all' 
    ? activities 
    : activities.filter(activity => activity.program === selectedProgram);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('client.welcome')}, {user.name}!</h1>
          <p className="text-gray-600 mt-2">{t('client.subtitle')}</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: t('client.overview'), icon: TrendingUp },
                { id: 'activities', label: t('client.activities'), icon: FileText },
                { id: 'job-search', label: t('client.job.search'), icon: Search }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('client.stats.total.hours')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalHours}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('client.stats.this.week')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activitiesThisWeek}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('client.stats.completed')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedActivities}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('client.stats.upcoming')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.upcomingActivities}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Program Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <BookOpen className="h-8 w-8 mr-3" />
                  <h3 className="text-xl font-bold">{t('client.w2.title')}</h3>
                </div>
                <p className="mb-4 opacity-90">
                  {t('client.w2.description')}
                </p>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  {t('client.w2.add.activity')}
                </button>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 mr-3" />
                  <h3 className="text-xl font-bold">{t('client.fset.title')}</h3>
                </div>
                <p className="mb-4 opacity-90">
                  {t('client.fset.description')}
                </p>
                <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  {t('client.fset.add.activity')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">{t('client.activities.all.programs')}</option>
                    <option value="W-2">{t('client.activities.w2.only')}</option>
                    <option value="FSET">{t('client.activities.fset.only')}</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowNewRecordModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('client.activities.new')}</span>
                </button>
              </div>
            </div>

            {/* Activities List */}
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between">
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
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {activity.description}
                      </h3>
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
                      {activity.notes && (
                        <p className="mt-2 text-sm text-gray-600">{activity.notes}</p>
                      )}
                    </div>
                    <div className="ml-4">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Search Tab */}
        {activeTab === 'job-search' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('client.jobsearch.title')}</h2>
              <p className="text-gray-600 mb-6">
                {t('client.jobsearch.description')}
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('client.jobsearch.activities.title')}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('client.jobsearch.activities.description')}
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    {t('client.jobsearch.activities.button')}
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('client.jobsearch.tracker.title')}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('client.jobsearch.tracker.description')}
                  </p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    {t('client.jobsearch.tracker.button')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;