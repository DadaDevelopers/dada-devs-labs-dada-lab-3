// API client with axios-like interface for frontend
const API_BASE = "/api";

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

    if (data && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(data);
    }

    const res = await fetch(fullUrl, options);

    if (!res.ok) {
      // Simulate axios error structure
      const error: any = new Error("Network error");
      error.response = {
        data: { message: `Request failed with status ${res.status}` },
        status: res.status,
      };
      throw error;
    }

    const responseData = await res.json();
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

  // Login endpoint
  if (url.includes("/auth/login")) {
    return {
      data: {
        token: "demo-token-" + Date.now(),
        user: {
          id: "demo-user-" + Date.now(),
          email: data?.email || "demo@example.com",
          name: "Demo User",
          role: "donor",
        },
      },
    };
  }

  // Signup endpoint
  if (url.includes("/auth/signup")) {
    return {
      data: {
        token: "demo-token-" + Date.now(),
        user: {
          id: "demo-user-" + Date.now(),
          email: data?.email || "demo@example.com",
          name: data?.name || "Demo User",
          role: data?.role || "donor",
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

  // User profile endpoint
  if (url.includes("/user/me")) {
    if (method === "PUT") {
      return {
        data: {
          id: "demo-user",
          email: "demo@example.com",
          name: data?.name || "Demo User",
          role: "donor",
          ...data,
        },
      };
    }
    return {
      data: {
        id: "demo-user",
        email: "demo@example.com",
        name: "Demo User",
        role: "donor",
      },
    };
  }

  // Donate guest endpoint
  if (url.includes("/donate/guest")) {
    return {
      data: { success: true, receiptId: "demo-receipt-1234" },
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
  delete: (url: string, config?: any) =>
    fetchWrapper(url, "DELETE", undefined, config?.headers),
};

export default api;
