"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./client";

export interface CurrentUser {
  name: string;
  email: string;
  initials: string;
}

function toCurrent(u: User | null): CurrentUser | null {
  if (!u) return null;
  const email = u.email ?? "";
  // user_metadata is display-only here, never used for authorization.
  const name = (u.user_metadata?.full_name as string | undefined)?.trim() || email.split("@")[0];
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("") || "?";
  return { name, email, initials };
}

/** Signed-in user for display (name, email, initials); null until loaded. */
export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(toCurrent(data.user)));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(toCurrent(session?.user ?? null)),
    );
    return () => subscription.unsubscribe();
  }, []);

  return user;
}

export function useSignOut() {
  const router = useRouter();
  return async () => {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  };
}
