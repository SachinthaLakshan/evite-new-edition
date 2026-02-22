"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && !isPublicRoute(pathname)) {
        router.push("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  const isPublicRoute = (path: string) => {
    const publicRoutes = ["/auth", "/", "/response"];
    // Check if the path matches the s/:shortId pattern
    const isShortUrlRoute = path.match(/^\/s\/[\w-]+$/);
    // Check if the path matches the RSVP pattern
    const isRSVPRoute = path.match(/^\/event\/[\w-]+\/rsvp$/);
    return publicRoutes.includes(path) || !!isRSVPRoute || !!isShortUrlRoute;
  };

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
