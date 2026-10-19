import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/admin/types";
import { LogoutButton } from "@/components/logout-button";

interface AccessDeniedProps {
  user: User;
  roles: UserRole[];
}

export function AccessDenied({ user, roles }: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100 flex flex-col justify-center items-center p-6 selection:bg-[#C5A059]/30">
      <div className="w-full max-w-md bg-[#11141D] border border-red-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C5A059]/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center mb-6 shadow-inner">
            <ShieldAlert className="w-8 h-8 text-red-400" strokeWidth={1.75} />
          </div>

          <span className="text-xs font-semibold uppercase tracking-widest text-red-400/90 mb-1">
            403 Forbidden
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50 mb-3">
            Administrative Access Denied
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Your authenticated account is not authorized to access the NyayaLink Administration Portal. Role permissions are enforced server-side against <code className="text-xs bg-slate-800/80 px-1.5 py-0.5 rounded font-mono text-[#E5C07B]">public.user_roles</code>.
          </p>

          <div className="w-full bg-[#161B26] border border-slate-800/80 rounded-xl p-4 mb-6 text-left">
            <div className="text-xs text-slate-400 mb-1.5 font-medium">Account Details:</div>
            <div className="text-sm font-mono text-slate-200 truncate mb-3" title={user.email}>
              {user.email || user.id}
            </div>

            <div className="text-xs text-slate-400 mb-1.5 font-medium">Assigned Roles:</div>
            <div className="flex flex-wrap gap-1.5">
              {roles.length > 0 ? (
                roles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/60 uppercase tracking-wider"
                  >
                    {role}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No assigned roles found</span>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col gap-2.5">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-[#C5A059]/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Public Portal
            </Link>

            <div className="w-full flex items-center justify-center pt-2">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
