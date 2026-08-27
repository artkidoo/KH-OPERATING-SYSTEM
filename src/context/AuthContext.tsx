import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Workspace, IdentityType } from "../types";
import { api, getStoredToken } from "../services/api";

interface AuthContextType {
  user: User | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    fullName: string;
    identityType?: IdentityType;
    workspaceName?: string;
    bio?: string;
    genreOrNiche?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
  refreshUserData: () => Promise<void>;
  updateActiveWorkspace: (updated: Workspace) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    setIsLoading(true);
    const token = getStoredToken();

    // If no token exists, provide initial seamless demo login or guest state
    if (!token) {
      try {
        // Log in to default demo creator account for instant access
        const res = await api.auth.login({ email: "creator@keedohub.com", password: "keedohub2026" });
        setUser(res.user);
        setWorkspaces(res.workspaces);
        setActiveWorkspace(res.activeWorkspace);
      } catch (err) {
        console.warn("[Auth] Demo login fallback:", err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const res = await api.auth.me();
      setUser(res.user);
      setWorkspaces(res.workspaces);
      setActiveWorkspace(res.activeWorkspace);
    } catch (err) {
      console.error("[Auth] Failed to restore session:", err);
      // Fallback to demo
      try {
        const res = await api.auth.login({ email: "creator@keedohub.com", password: "keedohub2026" });
        setUser(res.user);
        setWorkspaces(res.workspaces);
        setActiveWorkspace(res.activeWorkspace);
      } catch {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(credentials);
      setUser(res.user);
      setWorkspaces(res.workspaces);
      setActiveWorkspace(res.activeWorkspace);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: {
    email: string;
    password: string;
    fullName: string;
    identityType?: IdentityType;
    workspaceName?: string;
    bio?: string;
    genreOrNiche?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.signup(data);
      setUser(res.user);
      setWorkspaces(res.workspaces);
      setActiveWorkspace(res.activeWorkspace);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
      setUser(null);
      setWorkspaces([]);
      setActiveWorkspace(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchWorkspace = (workspaceId: string) => {
    const found = workspaces.find((w) => w.id === workspaceId);
    if (found) {
      setActiveWorkspace(found);
    }
  };

  const refreshUserData = async () => {
    try {
      const res = await api.auth.me();
      setUser(res.user);
      setWorkspaces(res.workspaces);
      if (res.activeWorkspace) {
        setActiveWorkspace(res.activeWorkspace);
      }
    } catch (err) {
      console.error("[Auth] Failed to refresh user:", err);
    }
  };

  const updateActiveWorkspace = (updated: Workspace) => {
    setActiveWorkspace(updated);
    setWorkspaces((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        activeWorkspace,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
        switchWorkspace,
        refreshUserData,
        updateActiveWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
