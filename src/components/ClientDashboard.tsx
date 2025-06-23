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
  BookOpen,
  X,
  Trash2
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

interface ActivityAction {
  id: string;
  date: string;
  time: string;
  duration: string;
  description: string;
  supervisorSignature: string;
  supervisorPhone: string;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'job-search'>('overview');
  const [selectedProgram, setSelectedProgram] = useState<'all' | 'W-2' | 'FSET'>('all');
  const [showNewRecordModal, setShowNewRecordModal] = useState(false);
  const [showW2ActivityModal, setShowW2ActivityModal] = useState(false);

  // W-2 Activity Form State
  const [w2ActivityForm, setW2ActivityForm] = useState({
    name: '',
    goal: '',
    actions: [
      {
        id: '1',
        date: '',
        time: '',
        duration: '',
        description: '',
        supervisorSignature: '',
        supervisorPhone: ''
      }
    ] as ActivityAction[]
  });

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

  const handleAddAction = () => {
    const newAction: ActivityAction = {
      id: Math.random().toString(36).substr(2, 9),
      date: '',
      time: '',
      duration: '',
      description: '',
      supervisorSignature: '',
      supervisorPhone: ''
    };
    setW2ActivityForm({
      ...w2ActivityForm,
      actions: [...w2ActivityForm.actions, newAction]
    });
  };

  const handleRemoveAction = (actionId: string) => {
    if (w2ActivityForm.actions.length > 1) {
      setW2ActivityForm({
        ...w2ActivityForm,
        actions: w2ActivityForm.actions.filter(action => action.id !== actionId)
      });
    }
  };

  const handleActionChange = (actionId: string, field: keyof ActivityAction, value: string) => {
    setW2ActivityForm({
      ...w2ActivityForm,
      actions: w2ActivityForm.actions.map(action =>
        action.id === actionId ? { ...action, [field]: value } : action
      )
    });
  };

  const handleSubmitW2Activity = () => {
    // Here you would typically submit the form data to your backend
    console.log('Submitting W-2 Activity:', w2ActivityForm);
    
    // Reset form and close modal
    setW2ActivityForm({
      name: '',
      goal: '',
      actions: [
        {
          id: '1',
          date: '',
          time: '',
          duration: '',
          description: '',
          supervisorSignature: '',
          supervisorPhone: ''
        }
      ]
    });
    setShowW2ActivityModal(false);
  };

  const openW2ActivityModal = () => {
    setShowW2ActivityModal(true);
  };

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
                <button 
                  onClick={openW2ActivityModal}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
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

      {/* W-2 Activity Modal */}
      {showW2ActivityModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">New Action Form</h2>
                <button
                  onClick={() => setShowW2ActivityModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={w2ActivityForm.name}
                    onChange={(e) => setW2ActivityForm({...w2ActivityForm, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Goal Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal
                  </label>
                  <input
                    type="text"
                    value={w2ActivityForm.goal}
                    onChange={(e) => setW2ActivityForm({...w2ActivityForm, goal: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Actions Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Actions</h3>
                    <button
                      onClick={handleAddAction}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Action</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {w2ActivityForm.actions.map((action, index) => (
                      <div key={action.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {/* Date Field */}
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Date</label>
                            <input
                              type="date"
                              value={action.date}
                              onChange={(e) => handleActionChange(action.id, 'date', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Time Field */}
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Time</label>
                            <input
                              type="time"
                              value={action.time}
                              onChange={(e) => handleActionChange(action.id, 'time', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Duration Field */}
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Duration</label>
                            <input
                              type="text"
                              value={action.duration}
                              onChange={(e) => handleActionChange(action.id, 'duration', e.target.value)}
                              placeholder="--:--"
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Activity Description */}
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Activity Description</label>
                            <textarea
                              rows={3}
                              value={action.description}
                              onChange={(e) => handleActionChange(action.id, 'description', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Supervisor Signature */}
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Supervisor Signature</label>
                            <textarea
                              rows={3}
                              value={action.supervisorSignature}
                              onChange={(e) => handleActionChange(action.id, 'supervisorSignature', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Supervisor Home Phone */}
                        <div className="mb-4">
                          <label className="block text-xs text-gray-500 mb-1">Supervisor Home Phone</label>
                          <input
                            type="tel"
                            value={action.supervisorPhone}
                            onChange={(e) => handleActionChange(action.id, 'supervisorPhone', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Remove Button */}
                        {w2ActivityForm.actions.length > 1 && (
                          <div className="flex justify-start">
                            <button
                              onClick={() => handleRemoveAction(action.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center space-x-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Remove</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowW2ActivityModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSubmitW2Activity}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;