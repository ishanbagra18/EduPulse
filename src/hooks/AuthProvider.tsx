import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "../services/supabase";
import type { User as AppUser } from "../types";

type AuthContextValue = {
  user: AppUser | null;
  setUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error?: any }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid?: string) {
    try {
      if (!uid) return setUser(null);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", uid)
        .single();
      if (error) {
        console.warn("Failed to fetch profile", error);
        setUser(null);
        return;
      }

      const isBlocked = !!data?.is_blocked;
      const isPendingStudentOrTeacher =
        (data?.role === "student" || data?.role === "teacher") &&
        data?.is_active === false;

      if (isBlocked || isPendingStudentOrTeacher) {
        setUser(null);
        return;
      }

      setUser(data as AppUser);
    } catch (err) {
      console.warn("loadProfile", err);
      setUser(null);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id ?? undefined;
      if (uid) await loadProfile(uid);
      setLoading(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const uid = session?.user?.id;
        if (uid) {
          await loadProfile(uid);
        } else {
          setUser(null);
        }
        if (mounted) setLoading(false);
      },
    );

    return () => {
      mounted = false;
      // unsubscribe listener if possible
      try {
        // @ts-ignore
        listener?.subscription?.unsubscribe?.();
      } catch {}
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (res.error) return { error: res.error };

    const uid = res.data?.user?.id;
    if (!uid) {
      return { error: { message: "Unable to load user profile." } };
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", uid)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return {
        error: {
          message:
            "This account is not registered yet. Please contact the school admin.",
        },
      };
    }

    if (profile.is_blocked) {
      await supabase.auth.signOut();
      return {
        error: {
          message: "Your account has been blocked by the school admin.",
        },
      };
    }

    if (
      (profile.role === "student" || profile.role === "teacher") &&
      profile.is_active === false
    ) {
      await supabase.auth.signOut();
      return {
        error: {
          message: "Your account is still pending admin approval.",
        },
      };
    }

    setUser(profile as AppUser);
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const sendPasswordReset = async (email: string) => {
    const res = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: undefined,
    });
    return { error: res.error };
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, signIn, signOut, sendPasswordReset }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
