/**
 * ไฟล์: api.ts
 *
 * คำอธิบาย:
 * API Client สำหรับเรียก Backend API
 * - Base URL configuration
 * - Request/Response handling
 * - Error handling
 * - Token management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Debug: แสดง API URL ที่ใช้งาน
if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

/**
 * Interface สำหรับ API Response
 */
interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
}

/**
 * Interface สำหรับ Register Request
 */
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  username?: string;
}

/**
 * Interface สำหรับ Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Interface สำหรับ Auth Response
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string | null;
    role: {
      name: string;
    };
    createdAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Interface สำหรับ Project
 */
export interface Project {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    audioFiles: number;
  };
  audioFiles?: AudioFile[];
}

/**
 * Interface สำหรับ AudioFile
 */
export interface AudioFile {
  id: string;
  projectId: string;
  originalFilename: string;
  storedFilename: string;
  filePath: string;
  fileSizeBytes: number;
  durationSeconds: number | null;
  mimeType: string;
  status: string;
  uploadedAt: string;
  processedAt: string | null;
  expiresAt: string | null;
  transcripts?: Transcript[];
}

/**
 * Interface สำหรับ Transcript
 */
export interface Transcript {
  id: string;
  audioFileId: string;
  language: string;
  wordCount: number;
  confidenceScore: number | null;
  createdAt: string;
  updatedAt: string;
  segments: TranscriptSegment[];
  speakers: Speaker[];
  audioFile?: {
    id: string;
    originalFilename: string;
    projectId: string;
  };
}

/**
 * Interface สำหรับ TranscriptSegment
 */
export interface TranscriptSegment {
  id: string;
  transcriptId: string;
  segmentIndex: number;
  startTime: number;
  endTime: number | null;
  text: string;
  speakerId: string | null;
  confidenceScore: number | null;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  speaker?: Speaker | null;
}

/**
 * Interface สำหรับ Speaker
 */
export interface Speaker {
  id: string;
  transcriptId: string;
  name: string;
  displayOrder: number;
  segmentCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * API Client Class
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || {
            code: 'UNKNOWN_ERROR',
            message: 'An error occurred',
          },
        };
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        },
      };
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ tokens: AuthResponse['tokens'] }>> {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  /**
   * Get current user
   */
  async getCurrentUser(token: string): Promise<ApiResponse<{ user: AuthResponse['user'] & { role: { id: string; name: string; description: string | null } } }>> {
    return this.request('/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Create project
   */
  async createProject(token: string, data: { name: string; description?: string }): Promise<ApiResponse<{ project: Project }>> {
    return this.request('/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Get projects
   */
  async getProjects(token: string, params?: { search?: string; isArchived?: boolean; limit?: number }): Promise<ApiResponse<{ projects: Project[]; count: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isArchived !== undefined) queryParams.append('isArchived', String(params.isArchived));
    if (params?.limit) queryParams.append('limit', String(params.limit));

    const url = `/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.request(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Get project by ID
   */
  async getProjectById(token: string, projectId: string): Promise<ApiResponse<{ project: Project }>> {
    return this.request(`/projects/${projectId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Update project
   */
  async updateProject(token: string, projectId: string, data: { name?: string; description?: string }): Promise<ApiResponse<{ project: Project }>> {
    return this.request(`/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete project
   */
  async deleteProject(token: string, projectId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Upload audio file
   */
  async uploadAudio(token: string, projectId: string, file: File): Promise<ApiResponse<{ audioFile: AudioFile }>> {
    const formData = new FormData();
    formData.append('audio', file);

    const url = `${this.baseUrl}/projects/${projectId}/audio/upload`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || {
            code: 'UNKNOWN_ERROR',
            message: 'An error occurred',
          },
        };
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        },
      };
    }
  }

  /**
   * Upload audio file and start transcription immediately
   */
  async uploadAndTranscribe(
    token: string,
    projectId: string,
    file: File,
    options: {
      task?: "transcribe" | "translate";
      language?: string;
      numSpeakers?: number;
      minSpeakers?: number;
      maxSpeakers?: number;
    }
  ): Promise<ApiResponse<{ audioFile: AudioFile; transcription: { audioId: string; status: string } }>> {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('task', options.task || 'transcribe');
    formData.append('language', options.language || 'None');
    
    if (options.numSpeakers) {
      formData.append('numSpeakers', options.numSpeakers.toString());
    }
    if (options.minSpeakers) {
      formData.append('minSpeakers', options.minSpeakers.toString());
    }
    if (options.maxSpeakers) {
      formData.append('maxSpeakers', options.maxSpeakers.toString());
    }

    const url = `${this.baseUrl}/projects/${projectId}/audio/upload-and-transcribe`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || {
            code: 'UNKNOWN_ERROR',
            message: 'An error occurred',
          },
        };
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
        },
      };
    }
  }

  /**
   * Get audio files by project
   */
  async getAudioFiles(token: string, projectId: string): Promise<ApiResponse<{ audioFiles: AudioFile[]; count: number }>> {
    return this.request(`/projects/${projectId}/audio`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Delete audio file
   */
  async deleteAudio(token: string, audioId: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/audio/${audioId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Transcribe audio
   */
  async transcribeAudio(token: string, audioId: string, language?: string): Promise<ApiResponse<{ audioId: string; status: string }>> {
    return this.request(`/audio/${audioId}/transcribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ language }),
    });
  }

  /**
   * Get transcript
   */
  async getTranscript(token: string, transcriptId: string): Promise<ApiResponse<{ transcript: Transcript }>> {
    return this.request(`/transcripts/${transcriptId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Update segment text
   */
  async updateSegment(token: string, segmentId: string, text: string): Promise<ApiResponse<{ segment: TranscriptSegment }>> {
    return this.request(`/transcript-segments/${segmentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });
  }

  /**
   * Update speaker name
   */
  async updateSpeaker(token: string, speakerId: string, name: string): Promise<ApiResponse<{ speaker: Speaker }>> {
    return this.request(`/speakers/${speakerId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
  }
}

/**
 * Export API client instance
 */
export const api = new ApiClient(API_BASE_URL);

/**
 * Token management utilities
 */
export const tokenManager = {
  /**
   * Save tokens to localStorage AND cookie
   */
  saveTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      // Save to localStorage (for client-side access)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Save to cookie (for middleware access)
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${24 * 60 * 60}`; // 24 hours
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
    }
  },

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },

  /**
   * Clear tokens
   */
  clearTokens() {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Clear cookies
      document.cookie = 'accessToken=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
    }
  },

  /**
   * Save user data to localStorage
   */
  saveUser(user: AuthResponse['user']) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  /**
   * Get user data from localStorage
   */
  getUser(): AuthResponse['user'] | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (error) {
          console.error('Error parsing user data:', error);
          return null;
        }
      }
    }
    return null;
  },
};

/**
 * Transcribe audio file
 */
export async function transcribeAudio(
  token: string,
  audioId: string,
  options?: {
    task?: 'transcribe' | 'translate';
    language?: string;
    targetLanguage?: string;
    numSpeakers?: number;
    minSpeakers?: number;
    maxSpeakers?: number;
  }
): Promise<ApiResponse<{ audioFile: AudioFile }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/audio/${audioId}/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(options || {}),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: {
          code: data.error?.code || 'TRANSCRIBE_FAILED',
          message: data.error?.message || 'Failed to start transcription',
        },
      };
    }

    return { data: data.data };
  } catch (error) {
    console.error('Transcribe audio error:', error);
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network error occurred',
      },
    };
  }
}

/**
 * Get audio stream URL (public - no token needed)
 */
export function getAudioStreamUrl(token: string, audioId: string): string {
  return `${API_BASE_URL}/audio/${audioId}/stream`;
}
