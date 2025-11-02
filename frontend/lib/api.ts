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
   * Save tokens to localStorage
   */
  saveTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
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
