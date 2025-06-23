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
import JobSearch from './JobSearch';

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
  supervisorName: string;
  supervisorPhone: string;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'job-search'>('overview');
  const [selectedProgram, setSelectedProgram] = useState<'all' | 'W-2' | 'FSET'>('all');
  const [showNewRecordModal, setShowNewRecordModal] = useState(false);
  const [showW2ActivityModal, setShowW2ActivityModal] = useState(false);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);

  // W-2 Activity Form State
  const [w2ActivityForm, setW2ActivityForm] = useState({
    activityTitle: '',
    goal: '',
    actions: [
      {
        id: '1',
        date: '',
        time: '',
        duration: '',
        description: '',
        supervisorName: '',
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
      supervisorName: '',
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
      activityTitle: '',
      goal: '',
      actions: [
        {
          id: '1',
          date: '',
          time: '',
          duration: '',
          description: '',
          supervisorName: '',
          supervisorPhone: ''
        }
      ]
    });
    setShowW2ActivityModal(false);
  };

  const openW2ActivityModal = () => {
    setShowW2ActivityModal(true);
  };

  const handleJobSave = (job: any) => {
    const jobWithSaveDate = {
      ...job,
      savedDate: new Date().toISOString()
    };
    setSavedJobs(prev => {
      const isAlreadySaved = prev.some(savedJob => savedJob.id === job.id);
      if (!isAlreadySaved) {
        return [...prev, jobWithSaveDate];
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{t('client.welcome')}, {user.name}!</h1>
          <p className="text-gray-300 mt-2">{t('client.subtitle')}</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-2xl mb-8 border border-gray-600">
          <div className="border-b border-gray-600">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: t('client.overview'), icon: TrendingUp },
                { id: 'activities', label: t('client.activities'), icon: FileText },
                { id: 'job-search', label: t('client.job.search'), icon: Search }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === id
                      ? 'border-blue-400 text-blue-400'
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 border border-gray-600 hover:border-blue-400 transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">{t('client.stats.total.hours')}</p>
                    <p className="text-2xl font-bold text-white">{stats.totalHours}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 border border-gray-600 hover:border-green-400 transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">{t('client.stats.this.week')}</p>
                    <p className="text-2xl font-bold text-white">{stats.activitiesThisWeek}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 border border-gray-600 hover:border-purple-400 transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-purple-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">{t('client.stats.completed')}</p>
                    <p className="text-2xl font-bold text-white">{stats.completedActivities}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 border border-gray-600 hover:border-orange-400 transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-orange-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">{t('client.stats.upcoming')}</p>
                    <p className="text-2xl font-bold text-white">{stats.upcomingActivities}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Program Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-2xl border border-blue-500 hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <BookOpen className="h-8 w-8 mr-3" />
                  <h3 className="text-xl font-bold">{t('client.w2.title')}</h3>
                </div>
                <p className="mb-4 opacity-90">
                  {t('client.w2.description')}
                </p>
                <button 
                  onClick={openW2ActivityModal}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {t('client.w2.add.activity')}
                </button>
              </div>

              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white shadow-2xl border border-green-500 hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <Target className="h-8 w-8 mr-3" />
                  <h3 className="text-xl font-bold">{t('client.fset.title')}</h3>
                </div>
                <p className="mb-4 opacity-90">
                  {t('client.fset.description')}
                </p>
                <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  {t('client.fset.add.activity')}
                </button>
              </div>
            </div>

            {/* Saved Jobs Preview */}
            {savedJobs.length > 0 && (
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl shadow-2xl p-6 border border-gray-600">
                <h3 className="text-xl font-bold text-white mb-4">Recently Saved Jobs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedJobs.slice(0, 4).map((job) => (
                    <div key={job.id} className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg p-4 border border-gray-500 hover:border-blue-400 transition-all duration-200">
                      <h4 className="font-bold text-white mb-1">{job.title}</h4>
                      <p className="text-gray-300 text-sm mb-2">{job.company} - {job.location}</p>
                      <p className="text-blue-400 text-sm font-medium">
                        Saved: {new Date(job.savedDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('job-search')}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                  View All Saved Jobs
                </button>
              </div>
            )}
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 border border-gray-600">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value as any)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white hover:border-gray-500 transition-all duration-200"
                  >
                    <option value="all">{t('client.activities.all.programs')}</option>
                    <option value="W-2">{t('client.activities.w2.only')}</option>
                    <option value="FSET">{t('client.activities.fset.only')}</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowNewRecordModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('client.activities.new')}</span>
                </button>
              </div>
            </div>

            {/* Activities List */}
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-lg p-6 border border-gray-600 hover:border-blue-400 transition-all duration-200 transform hover:scale-105">
                  <div className="flex items-start justify-between">
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
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">
                        {activity.description}
                      </h3>
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
                      {activity.notes && (
                        <p className="mt-2 text-sm text-gray-300">{activity.notes}</p>
                      )}
                    </div>
                    <div className="ml-4">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Search Tab */}
        {activeTab === 'job-search' && (
          <JobSearch onJobSave={handleJobSave} />
        )}
      </div>

      {/* W-2 Activity Modal */}
      {showW2ActivityModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Add New Activity</h2>
                  <p className="text-gray-300">Complete your W-2 activity form</p>
                </div>
                <button
                  onClick={() => setShowW2ActivityModal(false)}
                  className="text-gray-400 hover:text-white transition-colors hover:bg-gray-700 rounded-lg p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Activity Title Field */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-750 rounded-xl p-6 border border-gray-600">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Activity Title
                  </label>
                  <input
                    type="text"
                    value={w2ActivityForm.activityTitle}
                    onChange={(e) => setW2ActivityForm({...w2ActivityForm, activityTitle: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-500"
                    placeholder="Enter activity title..."
                  />
                </div>

                {/* Goal Field */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-750 rounded-xl p-6 border border-gray-600">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Goal
                  </label>
                  <input
                    type="text"
                    value={w2ActivityForm.goal}
                    onChange={(e) => setW2ActivityForm({...w2ActivityForm, goal: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-500"
                    placeholder="What do you hope to achieve?"
                  />
                </div>

                {/* Actions Section */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-750 rounded-xl p-6 border border-gray-600">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Actions</h3>
                      <p className="text-gray-400 text-sm">Add detailed activity entries</p>
                    </div>
                    <button
                      onClick={handleAddAction}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Action</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {w2ActivityForm.actions.map((action, index) => (
                      <div key={action.id} className="bg-gradient-to-r from-gray-750 to-gray-700 rounded-xl p-6 border border-gray-600 hover:border-gray-500 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          {/* Date Field */}
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Date</label>
                            <input
                              type="date"
                              value={action.date}
                              onChange={(e) => handleActionChange(action.id, 'date', e.target.value)}
                              className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                            />
                          </div>

                          {/* Time Field */}
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Time</label>
                            <input
                              type="time"
                              value={action.time}
                              onChange={(e) => handleActionChange(action.id, 'time', e.target.value)}
                              className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                            />
                          </div>

                          {/* Duration Field */}
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Duration</label>
                            <input
                              type="text"
                              value={action.duration}
                              onChange={(e) => handleActionChange(action.id, 'duration', e.target.value)}
                              placeholder="2h 30m"
                              className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          {/* Activity Description */}
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Activity Description</label>
                            <textarea
                              rows={4}
                              value={action.description}
                              onChange={(e) => handleActionChange(action.id, 'description', e.target.value)}
                              placeholder="Describe what you did during this activity..."
                              className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                            />
                          </div>

                          {/* Supervisor Info */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Supervisor Name</label>
                              <input
                                type="text"
                                value={action.supervisorName}
                                onChange={(e) => handleActionChange(action.id, 'supervisorName', e.target.value)}
                                placeholder="Supervisor's full name"
                                className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Supervisor Phone</label>
                              <input
                                type="tel"
                                value={action.supervisorPhone}
                                onChange={(e) => handleActionChange(action.id, 'supervisorPhone', e.target.value)}
                                placeholder="(555) 123-4567"
                                className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        {w2ActivityForm.actions.length > 1 && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleRemoveAction(action.id)}
                              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg text-sm hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
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
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                  <button
                    onClick={() => setShowW2ActivityModal(false)}
                    className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSubmitW2Activity}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                  >
                    {t('common.save')} Activity
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