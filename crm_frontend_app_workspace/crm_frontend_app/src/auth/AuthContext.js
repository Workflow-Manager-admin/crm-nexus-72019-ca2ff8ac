import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// Storage keys for localStorage
const TOKEN_KEY = "crm_nexus_jwt";
const USER_KEY = "crm_nexus_userinfo";

// Auth API backend base URL (ENV or fallback)
const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:3001";

const AuthContext = createContext();

// PUBLIC_INTERFACE
/**
 * AuthProvider makes authentication state, user info, and auth actions available across the app.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // PUBLIC_INTERFACE
  /**
   * Logs in with email and password. Sets auth state on success, raises error msg otherwise.
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem(TOKEN_KEY, data.token);
        // Decode JWT payload for lightweight user info
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        setUser(payload);
        localStorage.setItem(USER_KEY, JSON.stringify(payload));
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (err) {
      setAuthError(err.message || "Login failed");
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Signs up a new user. Arguments: username, email, password.
   */
  const signup = useCallback(async (username, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem(TOKEN_KEY, data.token);
        // Decode JWT payload for lightweight user info
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        setUser(payload);
        localStorage.setItem(USER_KEY, JSON.stringify(payload));
      } else {
        throw new Error(data.message || "Signup failed");
      }
    } catch (err) {
      setAuthError(err.message || "Signup failed");
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Logs out the user and resets authentication state. Removes JWT from localStorage.
   */
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setLoading(false);
    setAuthError(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Adds JWT to fetch options for protected API calls.
   * Usage: authFetch('/url', {method: ...})
   */
  const authFetch = useCallback(
    (url, options = {}) => {
      const finalOptions = {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: token ? `Bearer ${token}` : "",
        },
      };
      return fetch(url, finalOptions);
    },
    [token]
  );

  // Optionally: check validity of JWT and auto-logout on expiry (minimal here).

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        user,
        loading,
        authError,
        login,
        signup,
        logout,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// PUBLIC_INTERFACE
/**
 * Convenience hook to access auth context.
 */
export function useAuth() {
  return useContext(AuthContext);
}

