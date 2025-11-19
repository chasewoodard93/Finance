api/client.ts  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Budget {
  id: number;
  practice_id: string;
  year: number;
  month: number;
  category: string;
  budgeted_amount: number;
  actual_amount: number;
  variance: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return { data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { data: {} as T, error: message };
    }
  }

  async getBudgets(params?: {
    practice_id?: string;
    year?: number;
    month?: number;
  }): Promise<ApiResponse<Budget[]>> {
    const queryParams = new URLSearchParams(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    );
    return this.request<Budget[]>(`/api/budgets?${queryParams}`);
  }

  async getBudget(id: number): Promise<ApiResponse<Budget>> {
    return this.request<Budget>(`/api/budgets/${id}`);
  }

  async createBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Budget>> {
    return this.request<Budget>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    });
  }

  async updateBudget(id: number, budget: Partial<Budget>): Promise<ApiResponse<Budget>> {
    return this.request<Budget>(`/api/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budget),
    });
  }

  async deleteBudget(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/budgets/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
