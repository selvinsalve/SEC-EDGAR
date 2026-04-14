const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface LoginResponse {
  token: string;
  user_id: string;
  company: string;
}

interface DashboardResponse {
  user_id: string;
  company: string;
  filings: Record<string, {
    document_count: number;
    status: string;
    risk_level: string | null;
    last_updated: string | null;
    consistency_score: number | null;
  }>;
}

interface FilingStatusResponse {
  filing_type: string;
  session_id?: string;
  status: string;
  risk_level?: string;
  redlines?: any[];
  consistency_score?: number;
  consistency_issues?: any[];
  needs_review?: boolean;
  iteration?: number;
  timestamp?: string;
  message?: string;
}

interface UploadResponse {
  session_id: string;
  filing_type: string;
  status: string;
  risk_level: string;
  redlines: any[];
  consistency_score: number;
  consistency_issues: any[];
  needs_review: boolean;
  message: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || `HTTP ${res.status}`);
    }

    return res.json();
  }

  async login(userId: string, password: string): Promise<LoginResponse> {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, password }),
    });
  }

  async getDashboard(): Promise<DashboardResponse> {
    return this.request("/api/dashboard");
  }

  async getFilingStatus(filingType: string): Promise<FilingStatusResponse> {
    return this.request(`/api/status/${filingType}`);
  }

  async uploadFiling(filingType: string, file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/upload/${filingType}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(error.detail || `HTTP ${res.status}`);
    }

    return res.json();
  }

  async editRedline(filingType: string, redlineIndex: number, editedText: string) {
    return this.request(`/api/edit-redline/${filingType}`, {
      method: "POST",
      body: JSON.stringify({ redline_index: redlineIndex, edited_text: editedText, filing_type: filingType }),
    });
  }

  async approveFiling(filingType: string, approve: boolean) {
    return this.request(`/api/approve/${filingType}`, {
      method: "POST",
      body: JSON.stringify({ filing_type: filingType, approve }),
    });
  }

  async continueWorkflow(filingType: string) {
    return this.request(`/api/continue-workflow/${filingType}`, {
      method: "POST",
    });
  }

  async getConsistencyReport() {
    return this.request("/api/consistency-report");
  }

  async register(data: any) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async clearSession(filingType: string) {
    return this.request(`/api/session/${filingType}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
export type { LoginResponse, DashboardResponse, FilingStatusResponse, UploadResponse };
