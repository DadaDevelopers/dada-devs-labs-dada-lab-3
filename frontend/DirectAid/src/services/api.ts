const API_BASE = import.meta.env.VITE_BASE_URL;

interface ApiInstance {
  defaults: {
    headers: {
      common: Record<string, string>;
    };
  };
  // Helper to set the token globally
  setAuthToken: (token: string | null) => void; 
  get: (url: string, config?: any) => Promise<any>;
  post: (url: string, data?: any, config?: any) => Promise<any>;
  put: (url: string, data?: any, config?: any) => Promise<any>;
  delete: (url: string, config?: any) => Promise<any>;
}

async function fetchWrapper(url: string, method: string, data?: any, headers?: Record<string, string>) {
  try {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...api.defaults.headers.common, // This now includes the token if set
        ...headers,
      },
    };

    if (data && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(data);
    }

    const res = await fetch(fullUrl, options);

    if (!res.ok) {
      const error: any = new Error("Network error");
      const errorData = await res.json().catch(() => ({}));
      error.response = {
        data: errorData,
        status: res.status,
      };
      throw error;
    }

    return { data: await res.json() };
  } catch (err: any) {
    if (err.response) throw err;
    return handleDemoFallback(url, method, data);
  }
}

async function handleDemoFallback(url: string, method: string, data?: any) {
  await new Promise((r) => setTimeout(r, 400));
  console.log(`Fallback active for: ${method} ${url}`);

  if (url.includes("/auth/login") || url.includes("/auth/signup")) {
    return {
      data: {
        token: "demo-token-" + Date.now(),
        user: { id: "u1", email: data?.email, name: data?.name || "Demo User", role: data?.role || "donor" },
      },
    };
  }

  // NEW: Provider Profile Fallback
  if (url.includes("/providers")) {
    return {
      data: {
        id: "p1",
        organizationName: data?.organizationName || "Mock Hospital",
        organizationType: data?.organizationType || "hospital",
        kycStatus: "pending",
        walletBalance: { locked: 0, available: 0, total: 0 },
        totalCampaigns: 0,
        ...data
      }
    };
  }

  return { data: { success: true } };
}

const api: ApiInstance = {
  defaults: {
    headers: {
      common: {},
    },
  },
  // NEW: Logic to add/remove the Authorization header
  setAuthToken: (token: string | null) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  },
  get: (url: string, config?: any) => fetchWrapper(url, "GET", undefined, config?.headers),
  post: (url: string, data?: any, config?: any) => fetchWrapper(url, "POST", data, config?.headers),
  put: (url: string, data?: any, config?: any) => fetchWrapper(url, "PUT", data, config?.headers),
  delete: (url: string, config?: any) => fetchWrapper(url, "DELETE", undefined, config?.headers),
};

export default api;