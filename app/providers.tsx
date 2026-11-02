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
  /** True when Clerk is configured for this deployment (key resolved on the server). */
  clerkEnabled: boolean;
  /** True once the auth provider has resolved the session (always true without Clerk). */
  isLoaded: boolean;
  isSignedIn: boolean;
  role: AppRole | null;
}

const AppAuthContext = createContext<AppAuthState>({
  clerkEnabled: false,
  isLoaded: true,
  isSignedIn: false,
  role: null,
});

export function useAppAuth(): AppAuthState {
  return useContext(AppAuthContext);
}

/* ── Provider tree ─────────────────────────────────────── */

function ClerkBridge({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const role = getRoleFromMetadata(user?.publicMetadata);

  return (
    <AppAuthContext.Provider value={{ clerkEnabled: true, isLoaded: !!isLoaded, isSignedIn: !!isSignedIn, role }}>
      {children}
    </AppAuthContext.Provider>
  );
}

/**
 * `publishableKey` is resolved by the server layout at request time and passed
 * down, so the browser never depends on NEXT_PUBLIC_* having been inlined at
 * build time. A build that lacked the key used to leave the server rendering
 * <SignIn>/<SignUp> while the client skipped <ClerkProvider>, which renders an
 * empty auth panel.
 */
export function Providers({
  children,
  publishableKey,
}: {
  children: React.ReactNode;
  publishableKey?: string;
}) {
  if (!publishableKey) {
    return (
      <AppAuthContext.Provider value={{ clerkEnabled: false, isLoaded: true, isSignedIn: false, role: null }}>
        {children}
      </AppAuthContext.Provider>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkBridge>{children}</ClerkBridge>
    </ClerkProvider>
  );
}
