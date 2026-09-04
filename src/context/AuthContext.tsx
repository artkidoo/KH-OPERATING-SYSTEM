import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Workspace, IdentityType, OnboardingPayload } from "../types";
import { api, getStoredToken, setStoredToken } from "../services/api";

interface OnboardingModalOptions {
  isNewAccount?: boolean;
  defaultIdentity?: IdentityType;
  existingWorkspaceId?: string;
}

interface AuthContextType {
  user: User | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingOpen: boolean;
  onboardingOptions: OnboardingModalOptions;
  openOnboarding: (options?: OnboardingModalOptions) => void;
  closeOnboarding: () => void;
  completeOnboarding: (payload: OnboardingPayload) => Promise<Workspace>;
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
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [onboardingOptions, setOnboardingOptions] = useState<OnboardingModalOptions>({});

  const initAuth = async () => {
    setIsLoading(true);
    const storedToken = getStoredToken();
    setToken(storedToken);

    // If no token exists, do not auto-login or fabricate a session
    if (!storedToken) {
      setUser(null);
      setWorkspaces([]);
      setActiveWorkspace(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.auth.me();
      setUser(res.user);
      setWorkspaces(res.workspaces);
      setActiveWorkspace(res.activeWorkspace);
      setToken(getStoredToken());
    } catch (err) {
      // Invalid or expired token: clear token and reset session
      setStoredToken(null);
      setUser(null);
      setWorkspaces([]);
      setActiveWorkspace(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const openOnboarding = (options: OnboardingModalOptions = {}) => {
    setOnboardingOptions(options);
    setIsOnboardingOpen(true);
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
    setOnboardingOptions({});
  };

  const completeOnboarding = async (payload: OnboardingPayload): Promise<Workspace> => {
    const res = await api.workspaces.initializeOnboarding(payload);
    const initializedWs = res.workspace;

    // Refresh workspaces list and set newly configured workspace as active
    setWorkspaces((prev) => {
      const exists = prev.some((w) => w.id === initializedWs.id);
      if (exists) {
        return prev.map((w) => (w.id === initializedWs.id ? initializedWs : w));
      }
      return [...prev, initializedWs];
    });

    setActiveWorkspace(initializedWs);
    setIsOnboardingOpen(false);
    setOnboardingOptions({});
    return initializedWs;
  };

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(credentials);
      setUser(res.user);
      setWorkspaces(res.workspaces);
      setActiveWorkspace(res.activeWorkspace);
      setToken(getStoredToken());
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
      setToken(getStoredToken());
      
      // Trigger progressive setup wizard for newly registered user
      setOnboardingOptions({
        isNewAccount: true,
        defaultIdentity: data.identityType || "artist",
        existingWorkspaceId: res.activeWorkspace?.id,
      });
      setIsOnboardingOpen(true);
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
      setToken(null);
      setIsOnboardingOpen(false);
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
      setToken(getStoredToken());
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
        token,
        isLoading,
        isAuthenticated: Boolean(user),
        isOnboardingOpen,
        onboardingOptions,
        openOnboarding,
        closeOnboarding,
        completeOnboarding,
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
