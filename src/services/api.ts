// API service for backend communication

function resolveApiBaseUrl(): string {
  const raw = String(import.meta.env.VITE_API_URL || '').trim();
  if (!raw) return 'http://localhost:3001/api';
  const noTrailingSlash = raw.replace(/\/+$/, '');
  return /\/api$/i.test(noTrailingSlash) ? noTrailingSlash : `${noTrailingSlash}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();

export interface PlayerInsight {
  pid: number;
  team: string;
  dist_m: number;
  max_spd: number;
  hsr_m: number;
  spr: number;
  risk: number;
  g: number;
  a: number;
  /** CV defensive heuristics from integrated pipeline */
  tackles?: number;
  interceptions?: number;
  blocks?: number;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardRiskItem {
  id: string;
  name: string;
  position: string;
  team: string;
  riskProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  updatedAt: string;
}

export interface DashboardActivityItem {
  id: string;
  type: 'injury' | 'value' | 'video' | 'ai';
  title: string;
  description: string;
  timestamp: string;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        return {
          error: text || 'Server returned non-JSON response',
        };
      }

      if (!response.ok) {
        // Log detailed error for debugging
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          data,
          endpoint,
        });
        return {
          error: data.error || data.message || data.details || `Error: ${response.status} ${response.statusText}`,
        };
      }

      return { data: data as T };
    } catch (error) {
      console.error('API request error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          error: 'Cannot connect to server. Make sure the backend server is running on http://localhost:3000',
        };
      }
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(email: string, password: string, name: string, teamName: string) {
    return this.request<{ token: string; user: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, teamName }),
    });
  }

  async verifyToken() {
    return this.request<{ user: any }>('/auth/verify', {
      method: 'GET',
    });
  }

  // AI endpoints
  async predictMarketValue(player: any) {
    return this.request<{
      playerId: string;
      predictedValue: number;
      valueRange: { min: number; max: number };
      valueFactors: Array<{ factor: string; contribution: number; trend: 'up' | 'down' | 'stable' }>;
      comparablePlayers: Array<{ name: string; value: number; similarity: number }>;
      modelConfidence: number;
      inputStats?: Record<string, unknown>;
      timestamp: string;
    }>('/ai/predict/market-value', {
      method: 'POST',
      body: JSON.stringify({ player }),
    });
  }

  /** Injury prediction uses match workload attributes (+ BMI computed from height/weight backend-side). */
  async predictInjury(payload: {
    playerId?: string;
    physical: {
      age: number;
      height: number;
      weight: number;
      minutes_played: number;
      distance_covered_km: number;
      max_speed_kmh: number;
      sprint_count: number;
      hsr_m: number;
    };
  }) {
    return this.request<{
      playerId: string;
      riskProbability: number;
      riskLevel: 'low' | 'medium' | 'high';
      topRiskFactors: Array<{ factor: string; impact: number; description: string }>;
      recommendations: string[];
      modelConfidence: number;
      timestamp: string;
    }>('/ai/predict/injury', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /** Video analysis: upload match video, get player insights and match score. */
  async analyzeVideo(file: File) {
    const token = this.getAuthToken();
    const form = new FormData();
    form.append('video', file);
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/ai/analyze-video`, {
      method: 'POST',
      headers,
      body: form,
    });
    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json') ? await response.json() : {};
    if (!response.ok) {
      return { error: data.error || data.details || response.statusText };
    }
    return {
      data: data as {
        success: boolean;
        playerInsights: PlayerInsight[];
        matchScore?: Record<string, number>;
        outputVideoFilename?: string | null;
      },
    };
  }

  /** Create a finalized match from CV output and map temp PIDs to club global IDs. */
  async commitVideoAnalysis(payload: {
    title: string;
    matchDate: string;
    opponent?: string;
    rawInsights: PlayerInsight[];
    mappings: Array<{ tempTrackingId: number; globalId: number }>;
    analysisOutputFilename?: string | null;
  }) {
    return this.request<{
      message: string;
      match: unknown;
      upsertedStats: number;
    }>('/matches/commit-video-analysis', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Player endpoints
  async getMyPlayers() {
    return this.request<{ players: any[]; inactivityThreshold: number }>('/players', {
      method: 'GET',
    });
  }

  async resetPredictionData(playerId: string) {
    return this.request<{ message: string; player: any }>(`/players/${playerId}/reset-prediction-data`, {
      method: 'POST',
    });
  }

  async getResetLogs(playerId: string) {
    return this.request<{
      logs: Array<{
        id: string;
        resetAt: string;
        resetByName: string;
        consecutiveMissedMatchesAtReset: number;
        fieldsReset: string[];
      }>;
    }>(`/players/${playerId}/reset-logs`, {
      method: 'GET',
    });
  }

  async updateInactivityThreshold(threshold: number) {
    return this.request<{ inactivityThreshold: number }>('/players/inactivity-threshold', {
      method: 'PATCH',
      body: JSON.stringify({ threshold }),
    });
  }

  async createPlayer(player: any) {
    return this.request<{ player: any }>('/players', {
      method: 'POST',
      body: JSON.stringify(player),
    });
  }

  async updatePlayer(playerId: string, updates: any) {
    return this.request<{ player: any; message: string }>(`/players/${playerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePlayer(playerId: string) {
    return this.request<{ message: string }>(`/players/${playerId}`, {
      method: 'DELETE',
    });
  }

  async bulkSetupPlayers(players: any[]) {
    return this.request<{ players: any[]; count: number; message: string }>('/players/setup-bulk', {
      method: 'POST',
      body: JSON.stringify({ players }),
    });
  }

  // Admin endpoints
  async getAdminUsers() {
    return this.request<{ users: any[] }>('/admin/users', {
      method: 'GET',
    });
  }

  async createAdminUser(payload: {
    email: string;
    password: string;
    name: string;
    role: string;
    teamName: string;
  }) {
    return this.request<{ user: any; message: string }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateAdminUser(email: string, updates: any) {
    return this.request<{ user: any; message: string }>(
      `/admin/users/${encodeURIComponent(email)}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
  }

  async deleteAdminUser(email: string) {
    return this.request<{ message: string }>(
      `/admin/users/${encodeURIComponent(email)}`,
      {
        method: 'DELETE',
      }
    );
  }

  async getAdminStats() {
    return this.request<{ totalUsers: number; totalPlayers: number; totalClubs: number; totalMatches: number }>('/admin/stats', {
      method: 'GET',
    });
  }

  async getAnalystDashboard() {
    return this.request<{
      totalPlayers: number;
      totalMatches: number;
      videosAnalyzed: number;
      injuryAlerts: number;
      riskHigh: number;
      avgRisk: number;
      avgDistance: number;
      marketValue: string;
    }>('/dashboard/analyst', { method: 'GET' });
  }

  async getAdminDashboard() {
    return this.request<{
      totalUsers: number;
      totalPlayers: number;
      totalMatches: number;
      totalClubs: number;
      injuryAlerts: number;
      totalPortfolioValue: string;
    }>('/dashboard/admin', { method: 'GET' });
  }

  async getDashboardRiskOverview(limit = 5) {
    return this.request<{ players: DashboardRiskItem[] }>(`/dashboard/risk-overview?limit=${limit}`, {
      method: 'GET',
    });
  }

  async getDashboardPerformanceTrends(months = 6) {
    return this.request<{ points: Array<{ month: string; predictions: number; accuracy: number }> }>(
      `/dashboard/performance-trends?months=${months}`,
      { method: 'GET' }
    );
  }

  async getDashboardRecentActivity(limit = 8) {
    return this.request<{ activities: DashboardActivityItem[] }>(`/dashboard/recent-activity?limit=${limit}`, {
      method: 'GET',
    });
  }

  async getAdminAnalytics(months = 6) {
    return this.request<{
      totals: { totalUsers: number; totalPlayers: number; totalVideos: number; avgMarketValue: number };
      usageTrends: Array<{ month: string; users: number; videos: number; players: number }>;
      injuryDistribution: Array<{ name: string; value: number }>;
      teamPerformance: Array<{ name: string; players: number; injuries: number; videos: number; marketValue: number }>;
    }>(`/admin/analytics?months=${months}`, { method: 'GET' });
  }

  async getAdminActivityLogs(params?: {
    page?: number;
    limit?: number;
    status?: 'all' | 'success' | 'warning' | 'error';
    resource?: string;
    search?: string;
  }) {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    if (params?.resource) qs.set('resource', params.resource);
    if (params?.search) qs.set('search', params.search);
    return this.request<{
      logs: Array<{
        id: string;
        timestamp: string;
        user: string;
        userEmail: string;
        action: string;
        resource: string;
        status: 'success' | 'warning' | 'error';
        ipAddress: string;
        details?: string;
      }>;
      meta: { total: number; page: number; limit: number; totalPages: number };
      resources: string[];
    }>(`/admin/activity-logs${qs.toString() ? `?${qs.toString()}` : ''}`, { method: 'GET' });
  }

  async getPlayerReport(globalId: number) {
    return this.request<any>(`/reports/players/${globalId}`, { method: 'GET' });
  }

  async getPlayerTrends(globalId: number, lastN = 6) {
    return this.request<any>(`/reports/players/${globalId}/trends?lastN=${lastN}`, { method: 'GET' });
  }

  async getMatches() {
    return this.request<{ matches: any[] }>('/matches', { method: 'GET' });
  }

  async createMatch(payload: { title: string; opponent?: string; matchDate: string; videoPath?: string }) {
    return this.request<{ match: any }>('/matches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async saveMatchRawInsights(matchId: string, rawInsights: any[]) {
    return this.request<{ message: string; count: number }>(`/matches/${matchId}/raw-insights`, {
      method: 'POST',
      body: JSON.stringify({ rawInsights }),
    });
  }

  async mapMatchIds(matchId: string, mappings: Array<{ tempTrackingId: number; globalId: number }>) {
    return this.request<{ message: string; count: number }>(`/matches/${matchId}/map-ids`, {
      method: 'POST',
      body: JSON.stringify({ mappings }),
    });
  }

  async finalizeMatch(matchId: string) {
    return this.request<{ message: string; upsertedStats: number }>(`/matches/${matchId}/finalize`, {
      method: 'POST',
    });
  }

  // Account/Profile endpoints
  async getMyProfile() {
    return this.request<{
      user: unknown;
      preferences: {
        privacy: { profileVisibility: 'private' | 'team' | 'public'; activityTracking: boolean; dataSharing: boolean };
        notifications: { emailAlerts: boolean; injuryRiskAlerts: boolean; weeklySummary: boolean; matchInsightsReady: boolean };
      };
      teamSettings: { preferredFormation: string; playStyle: string; trainingFocus: string; notes: string };
    }>('/account/me', { method: 'GET' });
  }

  async updateMyProfile(name: string) {
    return this.request<{ message: string; user: unknown }>('/account/me', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async changeMyEmail(currentPassword: string, newEmail: string) {
    return this.request<{ message: string; user: unknown }>('/account/me/email', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newEmail }),
    });
  }

  async changeMyPassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/account/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async updateMyPreferences(payload: {
    privacy?: { profileVisibility: 'private' | 'team' | 'public'; activityTracking: boolean; dataSharing: boolean };
    notifications?: { emailAlerts: boolean; injuryRiskAlerts: boolean; weeklySummary: boolean; matchInsightsReady: boolean };
  }) {
    return this.request<{ message: string; preferences: unknown }>('/account/me/preferences', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async updateTeamSettings(payload: { preferredFormation: string; playStyle: string; trainingFocus: string; notes: string }) {
    return this.request<{ message: string; settings: unknown }>('/account/me/team-settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async queueReportEmail(payload: {
    templateId: string;
    format: 'pdf' | 'excel' | 'csv';
    dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
  }) {
    return this.request<{ message: string; requestId: string; status: string }>('/reports/email', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async createReportRequest(payload: {
    templateId: string;
    format: 'pdf' | 'excel' | 'csv';
    dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
    status?: 'queued' | 'sent' | 'failed';
  }) {
    return this.request<{
      message: string;
      request: {
        id: string;
        templateId: string;
        format: string;
        dateRange: string;
        startDate?: string;
        endDate?: string;
        status: string;
        createdAt: string;
      };
    }>('/reports/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getRecentReportRequests() {
    return this.request<{
      requests: Array<{
        id: string;
        templateId: string;
        format: string;
        dateRange: string;
        startDate?: string;
        endDate?: string;
        status: 'queued' | 'sent' | 'failed';
        createdAt: string;
        requestedBy?: { id: string; name: string; email: string } | null;
      }>;
    }>('/reports/requests', {
      method: 'GET',
    });
  }

  async getTeamPerformancePlayersReport() {
    return this.request<{
      players: Array<{
        id: string;
        globalId: number | null;
        name: string;
        age: number;
        position: string;
        teamName: string;
        shirtNumber: number | null;
        stats: {
          matches: number;
          goals: number;
          assists: number;
          tackles: number;
          interceptions: number;
          minutesPlayed: number;
        };
        physical: {
          height: number;
          weight: number;
          sprintSpeed: number;
          stamina: number;
          strength: number;
        };
        latestMetrics: {
          distanceM: number;
          hsrM: number;
          riskScore: number;
          injuryProbability: number;
          goals: number;
          assists: number;
          createdAt: string;
        } | null;
      }>;
    }>('/reports/team-performance/players', {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();
