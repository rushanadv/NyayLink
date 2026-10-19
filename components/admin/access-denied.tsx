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
    <div className="min-h-screen bg-[#0C0D0C] text-[#EEECE5] flex flex-col justify-center items-center p-6 selection:bg-[#B8A078]/25 font-sans">
      <div className="w-full max-w-md border border-white/[0.08] bg-[#141614] rounded-lg p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#B8A078] mb-4">
            <ShieldAlert className="w-5 h-5" strokeWidth={1.5} />
          </div>

          <span className="text-[10px] font-mono tracking-widest uppercase text-[#B8A078] mb-1">
            403 Forbidden
          </span>
          <h1 className="text-2xl font-serif font-normal tracking-tight text-[#EEECE5] mb-2">
            Access Prohibited
          </h1>
          <p className="text-xs text-[#92958E] leading-relaxed mb-6">
            Your account is authenticated, but does not possess the administrative role required for the NyayaLink Operations Console. Authorization is verified server-side against <code className="font-mono text-[#EEECE5] bg-white/[0.04] px-1 py-0.5 rounded">public.user_roles</code>.
          </p>

          <div className="w-full border border-white/[0.06] bg-[#0C0D0C] rounded p-4 mb-6 text-left space-y-2 text-xs">
            <div className="text-[10px] font-mono uppercase text-[#92958E]/60">Account Identity</div>
            <div className="font-mono text-[#EEECE5] truncate" title={user.email || user.id}>
              {user.email || user.id}
            </div>

            <div className="text-[10px] font-mono uppercase text-[#92958E]/60 pt-1">Assigned Role(s)</div>
            <div className="flex flex-wrap gap-1 font-mono text-[11px]">
              {roles.length > 0 ? (
                roles.map((r) => (
                  <span
                    key={r}
                    className="px-2 py-0.5 rounded bg-white/[0.04] text-[#EEECE5] border border-white/[0.06]"
                  >
                    {r}
                  </span>
                ))
              ) : (
                <span className="text-[#92958E]/40 italic">None</span>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded text-xs font-medium bg-[#B8A078] text-[#0C0D0C] hover:bg-[#C9B38F] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Public Portal
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
