// API client with axios-like interface for frontend
// Point to deployed backend by default; adjust path if needed.
export const API_BASE = "https://directaid-backend.onrender.com/api";
// export const API_BASE = "http://localhost:5000/api";

// Create an axios-like API instance
interface ApiInstance {
  defaults: {
    headers: {
      common: Record<string, string>;
    };
  };
  get: (url: string, config?: any) => Promise<any>;
  post: (url: string, data?: any, config?: any) => Promise<any>;
  put: (url: string, data?: any, config?: any) => Promise<any>;
  patch: (url: string, data?: any, config?: any) => Promise<any>;
  delete: (url: string, config?: any) => Promise<any>;
}

// Helper to make fetch requests with axios-like interface
async function fetchWrapper(
  url: string,
  method: string,
  data?: any,
  headers?: Record<string, string>
) {
  try {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...api.defaults.headers.common,
        ...headers,
      },
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(data);
    }

    const res = await fetch(fullUrl, options);
    const responseData = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error: any = new Error(
        (responseData as { message?: string })?.message || `Request failed with status ${res.status}`
      );
      error.response = { data: responseData, status: res.status };
      throw error;
    }

    return { data: responseData };
  } catch (err: any) {
    // If it's already our custom error, rethrow it
    if (err.response) throw err;

    // Otherwise, handle demo fallback
    return handleDemoFallback(url, method, data);
  }
}

// Demo fallback for when backend is not available
async function handleDemoFallback(url: string, method: string, data?: any) {
  await new Promise((r) => setTimeout(r, 400));

  // Login endpoint — when backend is unreachable, return UNASSIGNED so user is sent to onboarding, not donor dashboard
  if (url.includes("/auth/login")) {
    return {
      data: {
        accessToken: "demo-token-" + Date.now(),
        user: {
          id: "demo-user-" + Date.now(),
          email: data?.email || "demo@example.com",
          firstName: "Demo",
          role: "UNASSIGNED",
        },
      },
    };
  }

  // Register endpoint
  if (url.includes("/auth/register")) {
    return {
      data: {
        accessToken: "demo-access-token-" + Date.now(),
        user: {
          id: "demo-user-" + Date.now(),
          email: data?.email || "demo@example.com",
          firstName: data?.firstName || "Demo",
          role: data?.role || "UNASSIGNED",
        },
      },
    };
  }

  // Forgot password endpoint
  if (url.includes("/auth/forgot-password")) {
    return {
      data: { success: true, message: "Password reset email sent" },
    };
  }

  // User profile endpoint (both /user/me and /users/me for compatibility)
  if (url.includes("/user/me") || url.includes("/users/me")) {
    if (method === "PUT") {
      return {
        data: {
          user: {
            id: "demo-user",
            _id: "demo-user",
            email: "demo@example.com",
            firstName: data?.firstName ?? "Demo",
            lastName: data?.lastName ?? "User",
            role: "BENEFICIARY",
            beneficiaryProfile: data?.beneficiaryProfile ?? {},
          },
        },
      };
    }
    return {
      data: {
        user: {
          id: "demo-user",
          _id: "demo-user",
          email: "demo@example.com",
          firstName: "Demo",
          lastName: "User",
          role: "BENEFICIARY",
          beneficiaryProfile: {},
        },
      },
    };
  }

  // Donate guest endpoint
  if (url.includes("/donate/guest")) {
    return {
      data: { success: true, receiptId: "demo-receipt-1234" },
    };
  }

  // Public providers list endpoint
  if (url.includes("/providers/public")) {
    return {
      data: {
        providers: [
          {
            id: "provider_001",
            organizationName: "Global Relief Foundation",
            organizationType: "other",
            city: "Lagos",
            country: "Nigeria",
          },
          {
            id: "provider_002",
            organizationName: "City General Hospital",
            organizationType: "hospital",
            city: "Nairobi",
            country: "Kenya",
          },
          {
            id: "provider_003",
            organizationName: "Hope Education Center",
            organizationType: "school",
            city: "Accra",
            country: "Ghana",
          },
        ],
      },
    };
  }

  // Default response
  return { data: { success: true } };
}

// Create the axios-like API instance
const api: ApiInstance = {
  defaults: {
    headers: {
      common: {},
    },
  },
  get: (url: string, config?: any) =>
    fetchWrapper(url, "GET", undefined, config?.headers),
  post: (url: string, data?: any, config?: any) =>
    fetchWrapper(url, "POST", data, config?.headers),
  put: (url: string, data?: any, config?: any) =>
    fetchWrapper(url, "PUT", data, config?.headers),
  patch: (url: string, data?: any, config?: any) =>
    fetchWrapper(url, "PATCH", data, config?.headers),
  delete: (url: string, config?: any) =>
    fetchWrapper(url, "DELETE", undefined, config?.headers),
};

export default api;
