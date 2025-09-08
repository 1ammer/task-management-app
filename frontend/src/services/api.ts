import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

// Type imports
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'WORK' | 'PERSONAL' | 'STUDY' | 'HEALTH' | 'OTHER';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completed: boolean;
  dueDate?: string;
  progress: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  status: string;
  results: number;
  data: {
    tasks: Task[];
  };
}

export interface CreateTaskData {
  title: string;
  description?: string;
  category: Task['category'];
  status?: Task['status'];
  priority?: Task['priority'];
  dueDate?: string;
  progress?: number;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  completed?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  name?: string;
}

export interface UpdateProfileData {
  name?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileResponse {
  status: string;
  data: { user: User };
  message?: string;
}


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);

              // Retry the original request
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
                     } catch {
             // Refresh failed, redirect to login
             localStorage.removeItem('accessToken');
             localStorage.removeItem('refreshToken');
             window.location.href = '/login';
           }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(data: LoginData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', data);
    return response.data;
  }

  async getCurrentUser(): Promise<{ status: string; data: { user: User } }> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Task endpoints
  async getTasks(queryParams?: string): Promise<TasksResponse> {
    const url = queryParams ? `/tasks${queryParams}` : '/tasks';
    const response: AxiosResponse<TasksResponse> = await this.api.get(url);
    return response.data;
  }

  async getTask(id: string): Promise<{ status: string; data: { task: Task } }> {
    const response = await this.api.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(data: CreateTaskData): Promise<{ status: string; data: { task: Task } }> {
    const response = await this.api.post('/tasks', data);
    return response.data;
  }

  async updateTask(id: string, data: UpdateTaskData): Promise<{ status: string; data: { task: Task } }> {
    const response = await this.api.patch(`/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: string): Promise<{ status: string; data: null }> {
    const response = await this.api.delete(`/tasks/${id}`);
    return response.data;
  }

  // Profile endpoints
  async getProfile(): Promise<ProfileResponse> {
    const response: AxiosResponse<ProfileResponse> = await this.api.get('/profile');
    return response.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<ProfileResponse> {
    const response: AxiosResponse<ProfileResponse> = await this.api.put('/profile', data);
    return response.data;
  }

  async changePassword(data: ChangePasswordData): Promise<{ status: string; message: string }> {
    const response = await this.api.post('/profile/change-password', data);
    return response.data;
  }

}

export default new ApiService();
