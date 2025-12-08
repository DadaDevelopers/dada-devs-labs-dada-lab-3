// Minimal API client stubs for frontend. Replace with real endpoints when backend is ready.
const API_BASE = "/api";

export async function signup(payload: any) {
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Network error");
    return await res.json();
  } catch (err) {
    // Fallback stub for demo
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      user: {
        id: "demo-user",
        email: payload.email,
        role: payload.role || "donor",
      },
    };
  }
}

export async function login(email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Network error");
    return await res.json();
  } catch (err) {
    await new Promise((r) => setTimeout(r, 400));
    // Return demo token
    return {
      token: "demo-token",
      user: { id: "demo-user", email, role: "donor" },
    };
  }
}

export async function me(token?: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error("Network error");
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function donateGuest(payload: {
  amount: number;
  email?: string;
  method?: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/donate/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Network error");
    return await res.json();
  } catch (err) {
    await new Promise((r) => setTimeout(r, 400));
    return { success: true, receiptId: "demo-receipt-1234" };
  }
}

export async function forgotPassword(email: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Network error");
    return await res.json();
  } catch (err) {
    // Fallback stub for demo
    await new Promise((r) => setTimeout(r, 600));
    return { success: true, message: "Password reset email sent" };
  }
}

export default {
  signup,
  login,
  me,
  donateGuest,
  forgotPassword,
};
