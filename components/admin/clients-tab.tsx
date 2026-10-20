"use client";

import { useState, useMemo } from "react";
import { Search, Lock, Users } from "lucide-react";
import type { UserProfileRecord, UserRole } from "@/lib/admin/types";

interface ClientsTabProps {
  initialProfiles: UserProfileRecord[];
}

export function ClientsTab({ initialProfiles }: ClientsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");

  const filteredProfiles = useMemo(() => {
    return initialProfiles.filter((profile) => {
      const roles = profile.roles || [];
      const matchesRole =
        selectedRoleFilter === "all" || roles.includes(selectedRoleFilter as UserRole);

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        profile.full_name.toLowerCase().includes(q) ||
        profile.id.toLowerCase().includes(q) ||
        (profile.phone && profile.phone.toLowerCase().includes(q));

      return matchesRole && matchesQuery;
    });
  }, [initialProfiles, selectedRoleFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="border border-white/[0.06] bg-[#111119] rounded-xl px-5 py-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Lock className="w-3.5 h-3.5 text-[#A99AFF]" strokeWidth={1.5} />
          <span className="text-[#A5A3B2]">
            User role authorizations are strictly bound server-side to <code className="font-mono text-[#F5F4FA] bg-white/[0.06] px-1.5 py-0.5 rounded">public.user_roles</code>. Client-side mutation is disabled.
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#A99AFF] px-2 py-0.5 rounded bg-[#A99AFF]/10 border border-[#A99AFF]/20 shrink-0 ml-4">
          Read-Only Access
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="border border-white/[0.06] bg-[#111119] rounded-xl p-3 sm:p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Role Filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: "all", label: "All Users" },
            { id: "client", label: "Clients" },
            { id: "lawyer", label: "Lawyers" },
            { id: "admin", label: "Administrators" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all ${
                selectedRoleFilter === tab.id
                  ? "bg-[#A99AFF]/15 text-[#F5F4FA] font-medium border border-[#A99AFF]/30 shadow-[0_0_12px_rgba(169,154,255,0.1)]"
                  : "text-[#A5A3B2] hover:text-[#F5F4FA] hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#6F6E7D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, UUID, phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#09090F] border border-white/[0.08] focus:border-[#A99AFF]/50 rounded-lg text-xs text-[#F5F4FA] placeholder:text-[#6F6E7D] focus:outline-none transition-colors font-sans"
          />
        </div>
      </div>

      {/* Table */}
      {filteredProfiles.length === 0 ? (
        <div className="border border-white/[0.06] bg-[#111119] rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#6F6E7D] mb-3">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-[#F5F4FA] mb-1">
            No user profiles match this query
          </h3>
          <p className="text-xs text-[#A5A3B2] max-w-sm">
            {initialProfiles.length === 0
              ? "No registered user profiles found in public.profiles."
              : "Try adjusting your search query or role filter."}
          </p>
        </div>
      ) : (
        <div className="border border-white/[0.06] bg-[#111119] rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#F5F4FA]">
              <thead className="border-b border-white/[0.06] bg-[#0E0E17] text-[11px] font-mono tracking-wider uppercase text-[#6F6E7D]">
                <tr>
                  <th className="px-6 py-3.5 font-medium">User Profile</th>
                  <th className="px-6 py-3.5 font-medium">Account UUID</th>
                  <th className="px-6 py-3.5 font-medium">Assigned Roles</th>
                  <th className="px-6 py-3.5 font-medium">Contact Phone</th>
                  <th className="px-6 py-3.5 font-medium">Account Status</th>
                  <th className="px-6 py-3.5 font-medium text-right">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#F5F4FA]">
                        {profile.full_name}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px] text-[#6F6E7D]">
                      {profile.id.slice(0, 13)}...
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {profile.roles && profile.roles.length > 0 ? (
                          profile.roles.map((role) => (
                            <span
                              key={role}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                                role === "admin"
                                  ? "text-[#A99AFF] bg-[#A99AFF]/10 border border-[#A99AFF]/25"
                                  : role === "lawyer"
                                  ? "text-sky-400 bg-sky-500/10 border border-sky-500/20"
                                  : "text-[#A5A3B2] bg-white/[0.04] border border-white/[0.06]"
                              }`}
                            >
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#6F6E7D] italic">None</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-[#A5A3B2] font-mono text-xs">
                      {profile.phone || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                          profile.is_active
                            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                            : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            profile.is_active ? "bg-emerald-400" : "bg-rose-400"
                          }`}
                        />
                        {profile.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>

                    <td suppressHydrationWarning className="px-6 py-4 text-right text-[#6F6E7D] font-mono text-[11px]">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
