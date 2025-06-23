// Job Service for backend integration with MongoDB
// This would handle API calls to your backend endpoints

export interface JobSearchActivity {
  userId: string;
  type: 'search' | 'save' | 'apply' | 'favorite';
  jobId?: string;
  searchParams?: {
    keyword?: string;
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    experienceLevel?: string;
  };
  timestamp: string;
}

export interface UserJobPreferences {
  userId: string;
  preferredLocations: string[];
  desiredSalaryRange: {
    min: number;
    max: number;
  };
  skillsOfInterest: string[];
  preferredJobTypes: string[];
  experienceLevel: string;
  updatedAt: string;
}

class JobService {
  private baseUrl = '/api/jobs'; // Your backend API base URL

  // Save job search activity to MongoDB
  async saveJobActivity(activity: JobSearchActivity): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers if needed
        },
        body: JSON.stringify(activity)
      });

      if (!response.ok) {
        throw new Error('Failed to save job activity');
      }
    } catch (error) {
      console.error('Error saving job activity:', error);
    }
  }

  // Get user's job search history
  async getJobSearchHistory(userId: string): Promise<JobSearchActivity[]> {
    try {
      const response = await fetch(`${this.baseUrl}/activity/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job search history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching job search history:', error);
      return [];
    }
  }

  // Save user job preferences
  async saveJobPreferences(preferences: UserJobPreferences): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error('Failed to save job preferences');
      }
    } catch (error) {
      console.error('Error saving job preferences:', error);
    }
  }

  // Get user job preferences
  async getJobPreferences(userId: string): Promise<UserJobPreferences | null> {
    try {
      const response = await fetch(`${this.baseUrl}/preferences/${userId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No preferences saved yet
        }
        throw new Error('Failed to fetch job preferences');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching job preferences:', error);
      return null;
    }
  }

  // Get job recommendations based on user profile and activity
  async getJobRecommendations(userId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/recommendations/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job recommendations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching job recommendations:', error);
      return [];
    }
  }
}

export const jobService = new JobService();