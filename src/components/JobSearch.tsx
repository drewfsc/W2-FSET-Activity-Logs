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
  Users
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
  
  // Search and filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [minWage, setMinWage] = useState('');
  const [maxWage, setMaxWage] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [location, setLocation] = useState('Wisconsin');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch jobs from TheirStack API
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (searchKeyword) params.append('q', searchKeyword);
      if (location) params.append('location', location);
      if (experienceLevel) params.append('experience_level', experienceLevel);
      params.append('limit', '50');
      
      const response = await fetch(`https://api.theirstack.com/v1/jobs/search?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      const jobsData = data.data || data.jobs || data || [];
      
      // Transform API data to our format
      const transformedJobs: Job[] = jobsData.map((job: any, index: number) => ({
        id: job.id || `job-${index}`,
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
        skills: job.skills || job.technologies || []
      }));
      
      setJobs(transformedJobs);
      setFilteredJobs(transformedJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch jobs. Please try again.');
      // Fallback to mock data for demonstration
      setJobs(mockJobs);
      setFilteredJobs(mockJobs);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Customer Service Representative',
      company: 'Wisconsin Retail Corp',
      location: 'Milwaukee, WI',
      salary_min: 32000,
      salary_max: 42000,
      experience_level: 'Entry Level',
      job_type: 'Full-time',
      description: 'Provide excellent customer service, handle inquiries, and process transactions. Great opportunity for career growth.',
      posted_date: '2024-01-15T00:00:00Z',
      skills: ['Communication', 'Customer Service', 'Problem Solving']
    },
    {
      id: '2',
      title: 'Administrative Assistant',
      company: 'Madison Medical Center',
      location: 'Madison, WI',
      salary_min: 35000,
      salary_max: 45000,
      experience_level: 'Entry Level',
      job_type: 'Full-time',
      description: 'Support office operations, manage schedules, and assist with administrative tasks. Medical office experience preferred.',
      posted_date: '2024-01-14T00:00:00Z',
      skills: ['Microsoft Office', 'Organization', 'Data Entry']
    },
    {
      id: '3',
      title: 'Warehouse Associate',
      company: 'Green Bay Logistics',
      location: 'Green Bay, WI',
      salary_min: 30000,
      salary_max: 38000,
      experience_level: 'Entry Level',
      job_type: 'Full-time',
      description: 'Handle inventory, pick and pack orders, and maintain warehouse cleanliness. Physical work in a team environment.',
      posted_date: '2024-01-13T00:00:00Z',
      skills: ['Physical Stamina', 'Attention to Detail', 'Teamwork']
    },
    {
      id: '4',
      title: 'Retail Sales Associate',
      company: 'Fashion Forward',
      location: 'Appleton, WI',
      salary_min: 28000,
      salary_max: 35000,
      experience_level: 'Entry Level',
      job_type: 'Part-time',
      description: 'Assist customers, manage inventory, and maintain store presentation. Flexible scheduling available.',
      posted_date: '2024-01-12T00:00:00Z',
      skills: ['Sales', 'Customer Service', 'Visual Merchandising']
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

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('job-favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('job-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  const toggleFavorite = (jobId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(jobId)) {
      newFavorites.delete(jobId);
    } else {
      newFavorites.add(jobId);
    }
    setFavorites(newFavorites);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('client.jobsearch.title')}</h1>
          <p className="text-gray-300">{t('client.jobsearch.description')}</p>
        </div>

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
            </div>
            <div className="text-sm text-gray-300">
              Powered by TheirStack API
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4 mb-8 border border-red-500">
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
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Apply</span>
                          </a>
                        )}
                        {onJobSave && (
                          <button
                            onClick={() => onJobSave(job)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105"
                          >
                            <Star className="h-4 w-4" />
                            <span>Save</span>
                          </button>
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
      </div>
    </div>
  );
};

export default JobSearch;