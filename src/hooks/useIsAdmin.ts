import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

/** `null` while the role check is in flight, otherwise whether the signed-in user is an admin. */
export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setIsAdmin(null);
      return;
    }
    let cancelled = false;
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(data?.role === "admin");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return isAdmin;
}
