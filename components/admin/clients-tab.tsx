"use client";

import { useState, useMemo } from "react";
import { Search, Lock } from "lucide-react";
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
      <div className="border border-white/[0.07] bg-[#141614] rounded-lg px-5 py-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Lock className="w-3.5 h-3.5 text-[#B8A078]" strokeWidth={1.5} />
          <span className="text-[#92958E]">
            User roles are enforced server-side against <code className="font-mono text-[#EEECE5] bg-white/[0.04] px-1 py-0.5 rounded">public.user_roles</code>. Frontend role modification is disabled.
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#B8A078] shrink-0 ml-4">
          Read-Only Access
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="border border-white/[0.07] bg-[#141614] rounded-lg p-3 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Role Filters */}
        <div className="flex flex-wrap gap-1 w-full md:w-auto">
          {[
            { id: "all", label: "All Users" },
            { id: "client", label: "Clients" },
            { id: "lawyer", label: "Lawyers" },
            { id: "admin", label: "Administrators" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-sans transition-all ${
                selectedRoleFilter === tab.id
                  ? "bg-white/[0.08] text-[#EEECE5] font-medium border border-white/[0.12]"
                  : "text-[#92958E] hover:text-[#EEECE5] hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-[#92958E]/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, UUID, phone..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#0C0D0C] border border-white/[0.08] focus:border-[#B8A078]/50 rounded text-xs text-[#EEECE5] placeholder:text-[#92958E]/50 focus:outline-none transition-colors font-sans"
          />
        </div>
      </div>

      {/* Table */}
      {filteredProfiles.length === 0 ? (
        <div className="border border-white/[0.07] bg-[#141614] rounded-lg p-12 text-center flex flex-col items-center justify-center">
          <h3 className="text-base font-serif text-[#EEECE5] mb-1">
            No user profiles match this query
          </h3>
          <p className="text-xs text-[#92958E] max-w-sm">
            {initialProfiles.length === 0
              ? "No registered user profiles found in public.profiles."
              : "Try adjusting your search query or role filter."}
          </p>
        </div>
      ) : (
        <div className="border border-white/[0.07] bg-[#141614] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#EEECE5]">
              <thead className="border-b border-white/[0.07] bg-[#0E100E] text-[10px] font-mono tracking-wider uppercase text-[#92958E]">
                <tr>
                  <th className="px-6 py-3 font-medium">User Profile</th>
                  <th className="px-6 py-3 font-medium">Account UUID</th>
                  <th className="px-6 py-3 font-medium">Assigned Roles</th>
                  <th className="px-6 py-3 font-medium">Contact</th>
                  <th className="px-6 py-3 font-medium">Account Status</th>
                  <th className="px-6 py-3 font-medium text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#EEECE5]">
                        {profile.full_name}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px] text-[#92958E]/70">
                      {profile.id.slice(0, 13)}...
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {profile.roles && profile.roles.length > 0 ? (
                          profile.roles.map((role) => (
                            <span
                              key={role}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                                role === "admin"
                                  ? "text-[#B8A078] bg-[#B8A078]/10 border border-[#B8A078]/25"
                                  : role === "lawyer"
                                  ? "text-sky-300 bg-sky-950/30 border border-sky-800/30"
                                  : "text-[#92958E] bg-white/[0.04] border border-white/[0.06]"
                              }`}
                            >
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#92958E]/40 italic">None</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-[#92958E] font-mono text-xs">
                      {profile.phone || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                          profile.is_active
                            ? "text-emerald-300 bg-emerald-950/30 border border-emerald-800/30"
                            : "text-red-300 bg-red-950/30 border border-red-800/30"
                        }`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${
                            profile.is_active ? "bg-emerald-400" : "bg-red-400"
                          }`}
                        />
                        {profile.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right text-[#92958E]/70 font-mono text-[11px]">
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
