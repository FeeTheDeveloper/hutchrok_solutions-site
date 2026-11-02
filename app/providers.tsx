"use client";

import { createContext, useContext } from "react";
import { ClerkProvider, useAuth, useUser } from "@clerk/nextjs";
import { getRoleFromMetadata, type AppRole } from "@/lib/auth/roles";

/* ── App-wide auth context ─────────────────────────────────
   Populated by ClerkBridge when Clerk is active, otherwise
   falls back to unauthenticated defaults so every downstream
   component can call useAppAuth() safely.
   ───────────────────────────────────────────────────────── */

interface AppAuthState {
  /** True once the auth provider has resolved the session (always true without Clerk). */
  isLoaded: boolean;
  isSignedIn: boolean;
  role: AppRole | null;
}

const AppAuthContext = createContext<AppAuthState>({
  isLoaded: true,
  isSignedIn: false,
  role: null,
});

export function useAppAuth(): AppAuthState {
  return useContext(AppAuthContext);
}

/** Build-time flag – true only when the Clerk publishable key is present. */
export const CLERK_ENABLED =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/* ── Provider tree ─────────────────────────────────────── */

function ClerkBridge({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const role = getRoleFromMetadata(user?.publicMetadata);

  return (
    <AppAuthContext.Provider value={{ isLoaded: !!isLoaded, isSignedIn: !!isSignedIn, role }}>
      {children}
    </AppAuthContext.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  if (!CLERK_ENABLED) {
    return (
      <AppAuthContext.Provider value={{ isLoaded: true, isSignedIn: false, role: null }}>
        {children}
      </AppAuthContext.Provider>
    );
  }

  return (
    <ClerkProvider>
      <ClerkBridge>{children}</ClerkBridge>
    </ClerkProvider>
  );
}
