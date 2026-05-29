// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi, ApiError } from '../api/api';

const AuthContext = createContext(null);

// ── JWT decode (no library needed — just base64) ──────────────────────────────
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function tokenIsExpired(token) {
  const claims = decodeToken(token);
  if (!claims?.exp) return true;
  return Date.now() / 1000 >= claims.exp;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { email, username, firstName, lastName, role, sub }
  const [loading, setLoading] = useState(true); // true until initial token check done
  const [mustChangePassword, setMustChangePassword] = useState(false);

  // ── Hydrate from stored token on mount ───────────────────────────────────────
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token && !tokenIsExpired(token)) {
      const claims = decodeToken(token);
      const email = claims.email;
      authApi.getUser(email)
        .then(profile => {
          setUser({
            id:          claims.sub,
            email:       profile.email       ?? email,
            username:    profile.userName    ?? claims.username,
            firstName:   profile.firstName   ?? '',
            lastName:    profile.lastName    ?? '',
            phoneNumber: profile.phoneNumber ?? '',
            role:        profile.role        ?? claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? claims.role,
          });
        })
        .catch(() => {
          // fallback to JWT claims only
          setUser({
            id:       claims.sub,
            email:    claims.email,
            username: claims.username,
            role:     claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? claims.role,
          });
        })
        .finally(() => setLoading(false));
    } else {
      sessionStorage.removeItem('accessToken');
      setLoading(false);
    }
  }, []);

  // ── Listen for forced logout (401 from apiFetch) ─────────────────────────────
  useEffect(() => {
    const handle = () => {
      setUser(null);
      sessionStorage.removeItem('accessToken');
    };
    window.addEventListener('auth:logout', handle);
    return () => window.removeEventListener('auth:logout', handle);
  }, []);

  // ── Register ─────────────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    await authApi.register(formData);
    // No token on registration — user must log in
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────────
  const login = useCallback(async (formData) => {
    const data = await authApi.login(formData);
    sessionStorage.setItem('accessToken', data.accessToken);
    const claims = decodeToken(data.accessToken);
    const profile = await authApi.getUser(claims.email).catch(() => null);
    setUser({
      id:          claims.sub,
      email:       profile?.email       ?? claims.email,
      username:    profile?.userName    ?? claims.username,
      firstName:   profile?.firstName   ?? '',
      lastName:    profile?.lastName    ?? '',
      phoneNumber: profile?.phoneNumber ?? '',
      role:        profile?.role        ?? claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? claims.role,
    });
    if (data.mustChangePassword) setMustChangePassword(true);
    return data;
  }, []);

  // ── Google Login ──────────────────────────────────────────────────────────────
  const googleLogin = useCallback(async (idToken) => {
    const data = await authApi.googleLogin(idToken);
    sessionStorage.setItem('accessToken', data.accessToken);
    const claims = decodeToken(data.accessToken);
    const profile = await authApi.getUser(claims.email).catch(() => null);
    setUser({
      id:          claims.sub,
      email:       profile?.email       ?? claims.email,
      username:    profile?.userName    ?? claims.username,
      firstName:   profile?.firstName   ?? '',
      lastName:    profile?.lastName    ?? '',
      phoneNumber: profile?.phoneNumber ?? '',
      role:        profile?.role        ?? claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? claims.role,
    });
    return data;
  }, []);

  // ── Refresh token after role upgrade (e.g. buyer → vendor) ──────────────────
  const refreshAfterUpgrade = useCallback(async () => {
    const data = await authApi.refresh();
    sessionStorage.setItem('accessToken', data.accessToken);
    const claims = decodeToken(data.accessToken);
    const profile = await authApi.getUser(claims.email).catch(() => null);
    setUser({
      id:          claims.sub,
      email:       profile?.email       ?? claims.email,
      username:    profile?.userName    ?? claims.username,
      firstName:   profile?.firstName   ?? '',
      lastName:    profile?.lastName    ?? '',
      phoneNumber: profile?.phoneNumber ?? '',
      role:        profile?.role        ?? claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? claims.role,
    });
  }, []);

  const clearMustChangePassword = useCallback(() => setMustChangePassword(false), []);

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    sessionStorage.removeItem('accessToken');
    setUser(null);
    setMustChangePassword(false);
  }, []);

  const isAuthenticated = !!user;
  const isVendor  = user?.role === 'Vendor';
  const isAdmin   = user?.role === 'Admin';
  const isBuyer   = user?.role === 'Buyer';

  return (
    <AuthContext.Provider value={{
      user, loading,
      isAuthenticated, isVendor, isAdmin, isBuyer,
      login, googleLogin, logout, register, refreshAfterUpgrade,
      mustChangePassword, clearMustChangePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
