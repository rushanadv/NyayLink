import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/admin/types";
import { LogoutButton } from "@/components/logout-button";

interface AccessDeniedProps {
  user: User;
  roles: UserRole[];
}

export function AccessDenied({ user, roles }: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-[#09090F] text-[#F5F4FA] flex flex-col justify-center items-center p-6 selection:bg-[#A99AFF]/25 font-sans">
      <div className="w-full max-w-md border border-white/[0.08] bg-[#111119] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Luminous glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#A99AFF]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#A99AFF]/10 border border-[#A99AFF]/25 flex items-center justify-center text-[#A99AFF] mb-4">
            <ShieldAlert className="w-6 h-6" strokeWidth={1.5} />
          </div>

          <span className="text-[10px] font-mono tracking-widest uppercase text-[#A99AFF] px-2.5 py-0.5 rounded-full bg-[#A99AFF]/10 border border-[#A99AFF]/20 mb-2">
            403 Forbidden
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[#F5F4FA] mb-2">
            Access Prohibited
          </h1>
          <p className="text-xs text-[#A5A3B2] leading-relaxed mb-6">
            Your account is authenticated, but lacks the administrative credentials required for the NyayLink Operations Console. Role permissions are verified server-side against <code className="font-mono text-[#F5F4FA] bg-white/[0.06] px-1.5 py-0.5 rounded">public.user_roles</code>.
          </p>

          <div className="w-full border border-white/[0.06] bg-[#09090F] rounded-xl p-4 mb-6 text-left space-y-2.5 text-xs">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#6F6E7D]">Account Identity</div>
              <div className="font-mono text-[#F5F4FA] truncate mt-0.5" title={user.email || user.id}>
                {user.email || user.id}
              </div>
            </div>

            <div className="pt-1 border-t border-white/[0.04]">
              <div className="text-[10px] font-mono uppercase text-[#6F6E7D] mb-1.5">Assigned Role(s)</div>
              <div className="flex flex-wrap gap-1 font-mono text-[11px]">
                {roles.length > 0 ? (
                  roles.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded bg-white/[0.04] text-[#A5A3B2] border border-white/[0.06]"
                    >
                      {r}
                    </span>
                  ))
                ) : (
                  <span className="text-[#6F6E7D] italic">None</span>
                )}
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2.5">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium bg-[#A99AFF] text-[#09090F] hover:bg-[#9887FA] transition-colors shadow-[0_0_20px_rgba(169,154,255,0.2)]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Portal</span>
            </Link>

            <div className="pt-2 flex justify-center">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
