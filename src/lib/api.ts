export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const fetchApi = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { requireAuth = true, headers: customHeaders, ...restOptions } = options;
  
  const headers = new Headers(customHeaders);
  headers.set("Content-Type", "application/json");

  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      // In a real app, you might want to redirect to login or throw a specific error
      console.warn("No auth token found for an authenticated request.");
    }
  }

  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    headers,
    ...restOptions,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "An error occurred");
  }

  return data as T;
};

// --- API Service Functions ---

// Auth
export const login = (data: any) => fetchApi("/auth/login", { method: "POST", body: JSON.stringify(data), requireAuth: false });
export const register = (data: any) => fetchApi("/auth/register", { method: "POST", body: JSON.stringify(data), requireAuth: false });
export const getProfile = () => fetchApi("/auth/me");

// Transactions
export const getTransactions = (params?: Record<string, string>) => {
  const query = params ? new URLSearchParams(params).toString() : "";
  return fetchApi(`/transactions${query ? `?${query}` : ""}`);
};
export const getAnalytics = () => fetchApi("/transactions/analytics/summary");

// Insights
export const getInsights = () => fetchApi("/insights");

// Subscriptions
export const getSubscriptions = () => fetchApi("/subscriptions");

// Budgets
export const getBudgets = () => fetchApi("/budgets");
