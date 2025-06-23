import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Star, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  ExternalLink,
  Filter,
  X,
  Heart,
  Briefcase,
  TrendingUp,
  Users,
  Save,
  Eye,
  Calendar
} from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  experience_level?: string;
  job_type?: string;
  description: string;
  posted_date: string;
  url?: string;
  skills?: string[];
  source?: string;
}

interface SavedJob extends Job {
  savedDate: string;
  notes?: string;
  applicationStatus?: 'not_applied' | 'applied' | 'interview' | 'rejected' | 'offer';
}

interface JobSearchProps {
  onJobSave?: (job: Job) => void;
}

const JobSearch: React.FC<JobSearchProps> = ({ onJobSave }) => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [showSavedJobs, setShowSavedJobs] = useState(false);
  
  // Search and filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [minWage, setMinWage] = useState('');
  const [maxWage, setMaxWage] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [location, setLocation] = useState('Wisconsin');
  const [showFilters, setShowFilters] = useState(false);

  // Get API key from environment
  const apiKey = import.meta.env.VITE_THEIRSTACK_API_KEY;

  // Fetch jobs from TheirStack API
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const requestBody: any = {
        limit: 50
      };
      
      if (searchKeyword) requestBody.q = searchKeyword;
      if (location) requestBody.location = location;
      if (experienceLevel) requestBody.experience_level = experienceLevel;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add API key if available
      if (apiKey && apiKey !== 'THEIRSTACK_API_KEY') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      const response = await fetch('https://api.theirstack.com/v1/jobs/search', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      const jobsData = data.data || data.jobs || data || [];
      
      // Transform API data to our format
      const transformedJobs: Job[] = jobsData.map((job: any, index: number) => ({
        id: job.id || `job-${index}-${Date.now()}`,
        title: job.title || job.position || 'Position Available',
        company: job.company || job.company_name || 'Company Name',
        location: job.location || job.city || location,
        salary_min: job.salary_min || job.min_salary,
        salary_max: job.salary_max || job.max_salary,
        experience_level: job.experience_level || job.seniority_level,
        job_type: job.job_type || job.employment_type || 'Full-time',
        description: job.description || job.summary || 'Job description not available',
        posted_date: job.posted_date || job.date_posted || new Date().toISOString(),
        url: job.url || job.apply_url,
        skills: job.skills || job.technologies || [],
        source: 'theirstack'
      }));
      
      setJobs(transformedJobs);
      setFilteredJobs(transformedJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Unable to connect to job search API. Showing sample jobs for demonstration.');
      // Fallback to mock data for demonstration
      const mockJobs = generateMockJobs();
      setJobs(mockJobs);
      setFilteredJobs(mockJobs);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data with Wisconsin focus
  const generateMockJobs = (): Job[] => [
    {
      id: '1',
      title: 'Customer Service Representative',
      company: 'Wisconsin Retail Solutions',
      location: 'Milwaukee, WI',
      salary_min: 32000,
      salary_max: 42000,
      experience_level: 'Entry Level',
      job_type: 'Full-time',
      description: 'Join our team providing excellent customer service through phone, email, and chat support. We offer comprehensive training, career advancement opportunities, and competitive benefits. Perfect for W-2 participants looking to build customer service skills.',
      posted_date: '2024-01-15T00:00:00Z',
      skills: ['Customer Service', 'Communication', 'Problem Solving', 'Phone Support'],
      source: 'demo'
    },
    {
      id: '2',
      title: 'Administrative Assistant',
      company: 'Madison Healthcare Partners',
      location: 'Madison, WI',
      salary_min: 35000,
      salary_max: 45000,
      experience_level: 'Entry Level',
      job_type: 'Full-time',
      description: 'Support office operations in a fast-paced healthcare environment. Responsibilities include data entry, appointment scheduling, and patient communication. Excellent opportunity for FSET participants to gain administrative experience.',
      posted_date: '2024-01-14T00:00:00Z',
      skills: ['Microsoft Office', 'Data Entry', 'Scheduling', 'Healthcare Knowledge'],
      source: 'demo'
    },
    {
      id: '3',
      title: 'Warehouse Team Member',
      company: 'Green Bay Distribution Center',
      location: 'Green Bay, WI',
      salary_min: 30000,
      salary_max: 38000,
      experience_level: 'Entry Level',
      job_type: 'Full-time',
      description: 'Join our warehouse team in a clean, organized environment. Duties include order picking, packing, inventory management, and quality control. Great starting position with opportunities for advancement to supervisory roles.',
      posted_date: '2024-01-13T00:00:00Z',
      skills: ['Physical Fitness', 'Attention to Detail', 'Teamwork', 'Inventory Management'],
      source: 'demo'
    },
    {
      id: '4',
      title: 'Retail Sales Associate',
      company: 'Appleton Fashion Center',
      location: 'Appleton, WI',
      salary_min: 28000,
      salary_max: 35000,
      experience_level: 'Entry Level',
      job_type: 'Part-time',
      description: 'Help customers find the perfect items while building valuable retail experience. Flexible scheduling available to work around training programs. Commission opportunities and employee discounts included.',
      posted_date: '2024-01-12T00:00:00Z',
      skills: ['Sales', 'Customer Service', 'Visual Merchandising', 'Cash Handling'],
      source: 'demo'
    },
    {
      id: '5',
      title: 'Food Service Worker',
      company: 'University of Wisconsin Dining',
      location: 'Madison, WI',
      salary_min: 26000,
      salary_max: 32000,
      experience_level: 'Entry Level',
      job_type: 'Part-time',
      description: 'Work in our campus dining facilities serving students and staff. Training provided in food safety, preparation, and customer service. Flexible hours to accommodate other commitments.',
      posted_date: '2024-01-11T00:00:00Z',
      skills: ['Food Safety', 'Customer Service', 'Teamwork', 'Time Management'],
      source: 'demo'
    },
    {
      id: '6',
      title: 'Office Support Specialist',
      company: 'Milwaukee Business Services',
      location: 'Milwaukee, WI',
      salary_min: 33000,
      salary_max: 40000,
      experience_level: 'Entry Level',
      job_type: 'Full-time',
      description: 'Provide general office support including filing, copying, phone answering, and basic computer work. Excellent environment for developing professional skills and office experience.',
      posted_date: '2024-01-10T00:00:00Z',
      skills: ['Office Skills', 'Phone Etiquette', 'Filing', 'Basic Computer Skills'],
      source: 'demo'
    }
  ];

  // Filter jobs based on criteria
  useEffect(() => {
    let filtered = jobs;

    // Filter by wage range
    if (minWage || maxWage) {
      filtered = filtered.filter(job => {
        const jobMin = job.salary_min || 0;
        const jobMax = job.salary_max || 999999;
        const filterMin = minWage ? parseInt(minWage) : 0;
        const filterMax = maxWage ? parseInt(maxWage) : 999999;
        
        return jobMax >= filterMin && jobMin <= filterMax;
      });
    }

    // Filter by experience level
    if (experienceLevel) {
      filtered = filtered.filter(job => 
        job.experience_level?.toLowerCase().includes(experienceLevel.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, minWage, maxWage, experienceLevel]);

  // Load jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  // Load saved data from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('job-favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }

    const savedJobsData = localStorage.getItem('saved-jobs');
    if (savedJobsData) {
      setSavedJobs(JSON.parse(savedJobsData));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('job-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('saved-jobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  const toggleFavorite = (jobId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(jobId)) {
      newFavorites.delete(jobId);
    } else {
      newFavorites.add(jobId);
    }
    setFavorites(newFavorites);
  };

  const saveJob = (job: Job) => {
    const savedJob: SavedJob = {
      ...job,
      savedDate: new Date().toISOString(),
      applicationStatus: 'not_applied'
    };

    setSavedJobs(prev => {
      const exists = prev.find(saved => saved.id === job.id);
      if (!exists) {
        return [...prev, savedJob];
      }
      return prev;
    });

    // Also call the parent callback if provided
    if (onJobSave) {
      onJobSave(job);
    }
  };

  const updateApplicationStatus = (jobId: string, status: SavedJob['applicationStatus']) => {
    setSavedJobs(prev => 
      prev.map(job => 
        job.id === jobId ? { ...job, applicationStatus: status } : job
      )
    );
  };

  const handleSearch = () => {
    fetchJobs();
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Salary negotiable';
  };

  const favoriteJobs = filteredJobs.filter(job => favorites.has(job.id));

  // Save job search activity to potentially sync with backend later
  const saveJobSearchActivity = async (searchData: any) => {
    // This could be connected to MongoDB in the future
    const activity = {
      userId: 'current-user-id', // Would come from auth context
      type: 'job_search',
      data: searchData,
      timestamp: new Date().toISOString()
    };
    
    // For now, just log it - could be sent to backend API
    console.log('Job search activity:', activity);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('client.jobsearch.title')}</h1>
              <p className="text-gray-300">{t('client.jobsearch.description')}</p>
            </div>
            <button
              onClick={() => setShowSavedJobs(!showSavedJobs)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg ${
                showSavedJobs 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600 hover:border-gray-500'
              }`}
            >
              <Save className="h-5 w-5" />
              <span>Saved Jobs ({savedJobs.length})</span>
            </button>
          </div>
        </div>

        {/* API Key Status */}
        {!apiKey || apiKey === 'THEIRSTACK_API_KEY' ? (
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg p-4 mb-6 border border-yellow-500">
            <p className="text-white text-sm">
              <strong>Demo Mode:</strong> API key not configured. Showing sample Wisconsin jobs for demonstration.
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 mb-6 border border-green-500">
            <p className="text-white text-sm">
              <strong>Live Mode:</strong> Connected to TheirStack job search API.
            </p>
          </div>
        )}

        {/* Saved Jobs View */}
        {showSavedJobs ? (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl shadow-2xl p-6 border border-gray-600">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Save className="h-6 w-6 text-green-400 mr-3" />
                  Saved Jobs ({savedJobs.length})
                </h2>
                <button
                  onClick={() => setShowSavedJobs(false)}
                  className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 hover:text-white transition-all duration-200"
                >
                  Back to Search
                </button>
              </div>

              {savedJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Save className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Saved Jobs</h3>
                  <p className="text-gray-300">Start searching and save jobs you're interested in!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedJobs.map((job) => (
                    <div key={job.id} className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg p-6 border border-gray-500">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-300">{job.company}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-300">{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-300">Saved: {new Date(job.savedDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 mb-4">
                            <span className="text-sm text-gray-300">Application Status:</span>
                            <select
                              value={job.applicationStatus}
                              onChange={(e) => updateApplicationStatus(job.id, e.target.value as SavedJob['applicationStatus'])}
                              className="bg-gray-600 border border-gray-500 rounded px-3 py-1 text-white text-sm focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="not_applied">Not Applied</option>
                              <option value="applied">Applied</option>
                              <option value="interview">Interview Scheduled</option>
                              <option value="rejected">Rejected</option>
                              <option value="offer">Job Offer</option>
                            </select>
                          </div>
                        </div>
                        
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Apply</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl shadow-2xl p-6 border border-gray-600 mb-8">
              <div className="space-y-6">
                {/* Search Bar */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for jobs (e.g., customer service, retail, administrative)"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-12 w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg ${
                        showFilters 
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white border border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <Filter className="h-5 w-5" />
                      <span>Filters</span>
                    </button>
                    <button
                      onClick={handleSearch}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105 disabled:opacity-50"
                    >
                      <Search className="h-5 w-5" />
                      <span>{loading ? 'Searching...' : 'Search Jobs'}</span>
                    </button>
                  </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <div className="bg-gradient-to-r from-gray-750 to-gray-700 rounded-lg p-6 border border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Location</label>
                        <input
                          type="text"
                          placeholder="Wisconsin"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Min Salary</label>
                        <input
                          type="number"
                          placeholder="30000"
                          value={minWage}
                          onChange={(e) => setMinWage(e.target.value)}
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Max Salary</label>
                        <input
                          type="number"
                          placeholder="50000"
                          value={maxWage}
                          onChange={(e) => setMaxWage(e.target.value)}
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Experience Level</label>
                        <select
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        >
                          <option value="">All Levels</option>
                          <option value="Entry Level">Entry Level</option>
                          <option value="Mid Level">Mid Level</option>
                          <option value="Senior Level">Senior Level</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow-lg p-4 border border-gray-600 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-medium">{filteredJobs.length} Jobs Found</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-400" />
                    <span className="text-white font-medium">{favorites.size} Favorites</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Save className="h-5 w-5 text-green-400" />
                    <span className="text-white font-medium">{savedJobs.length} Saved</span>
                  </div>
                </div>
                <div className="text-sm text-gray-300">
                  {apiKey && apiKey !== 'THEIRSTACK_API_KEY' ? 'Live Data from TheirStack API' : 'Demo Data - Wisconsin Focus'}
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg p-4 mb-8 border border-yellow-500">
                <p className="text-white">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                <span className="ml-4 text-white font-medium">Searching for jobs...</span>
              </div>
            )}

            {/* Job Results */}
            {!loading && filteredJobs.length > 0 && (
              <div className="space-y-6">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl shadow-2xl p-6 border border-gray-600 hover:border-blue-400 transition-all duration-200 transform hover:scale-105">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{job.title}</h3>
                          <button
                            onClick={() => toggleFavorite(job.id)}
                            className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                              favorites.has(job.id)
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-red-400'
                            }`}
                          >
                            <Heart className={`h-5 w-5 ${favorites.has(job.id) ? 'fill-current' : ''}`} />
                          </button>
                          {job.source === 'demo' && (
                            <span className="px-2 py-1 bg-blue-600 text-blue-100 rounded-full text-xs font-medium">
                              DEMO
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300 font-medium">{job.company}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">{formatSalary(job.salary_min, job.salary_max)}</span>
                          </div>
                          {job.experience_level && (
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-300">{job.experience_level}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-300 mb-4 line-clamp-3">{job.description}</p>

                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.slice(0, 5).map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-blue-100 rounded-full text-sm font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-400">
                              Posted: {new Date(job.posted_date).toLocaleDateString()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              job.job_type === 'Full-time' 
                                ? 'bg-green-600 text-green-100'
                                : 'bg-yellow-600 text-yellow-100'
                            }`}>
                              {job.job_type}
                            </span>
                          </div>
                          
                          <div className="flex space-x-3">
                            <button
                              onClick={() => saveJob(job)}
                              disabled={savedJobs.some(saved => saved.id === job.id)}
                              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105 ${
                                savedJobs.some(saved => saved.id === job.id)
                                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                              }`}
                            >
                              <Save className="h-4 w-4" />
                              <span>{savedJobs.some(saved => saved.id === job.id) ? 'Saved' : 'Save Job'}</span>
                            </button>
                            {job.url && (
                              <a
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => saveJobSearchActivity({ jobId: job.id, action: 'apply_clicked' })}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>Apply</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && filteredJobs.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl shadow-2xl p-8 border border-gray-600">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Jobs Found</h3>
                  <p className="text-gray-300 mb-6">
                    Try adjusting your search criteria or keywords to find more opportunities.
                  </p>
                  <button
                    onClick={() => {
                      setSearchKeyword('');
                      setMinWage('');
                      setMaxWage('');
                      setExperienceLevel('');
                      fetchJobs();
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg transform hover:scale-105"
                  >
                    Clear Filters & Search Again
                  </button>
                </div>
              </div>
            )}

            {/* Favorites Section */}
            {favoriteJobs.length > 0 && (
              <div className="mt-12">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl shadow-2xl p-6 border border-gray-600">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Heart className="h-6 w-6 text-red-400 mr-3" />
                    Your Favorite Jobs ({favoriteJobs.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoriteJobs.slice(0, 4).map((job) => (
                      <div key={job.id} className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg p-4 border border-gray-500 hover:border-red-400 transition-all duration-200">
                        <h4 className="font-bold text-white mb-1">{job.title}</h4>
                        <p className="text-gray-300 text-sm mb-2">{job.company} - {job.location}</p>
                        <p className="text-blue-400 text-sm font-medium">{formatSalary(job.salary_min, job.salary_max)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobSearch;