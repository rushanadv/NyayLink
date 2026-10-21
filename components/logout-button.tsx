"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("[NyayaLink Logout]:", err);
    } finally {
      router.push("/auth/login");
    }
  };

  return <Button onClick={logout}>Logout</Button>;
}
