"use client";

import { useState, useMemo } from "react";
import { Users, Search, Shield, Lock, Phone } from "lucide-react";
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
      {/* Top Banner Notice: Read-only Notice */}
      <div className="bg-[#141926] border border-[#232B3D] rounded-xl p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-0.5 font-mono">
            Role Assignment Management — Read-Only Mode
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Roles are sourced directly from <code className="text-[11px] bg-slate-800 px-1 py-0.5 rounded font-mono text-[#E5C07B]">public.user_roles</code>. Frontend role mutation is disabled to prevent privilege escalation.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#11141D] border border-[#1F2536] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedRoleFilter === tab.id
                  ? "bg-[#C5A059] text-slate-950 font-semibold shadow-md shadow-[#C5A059]/20"
                  : "bg-[#161B26] text-slate-400 hover:text-slate-200 hover:bg-[#1A2130]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by full name, UUID, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-[#161B26] border border-[#232B3D] focus:border-[#C5A059] rounded-xl text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Users Table */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-[#11141D] border border-[#1F2536] rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-400 mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-200 mb-1 font-serif">
            No user profiles match the criteria
          </h3>
          <p className="text-xs text-slate-400 max-w-md">
            {initialProfiles.length === 0
              ? "No registered user profiles found in public.profiles."
              : "Try adjusting your search query or role filter."}
          </p>
        </div>
      ) : (
        <div className="bg-[#11141D] border border-[#1F2536] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0E121C] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2536] font-mono">
                <tr>
                  <th className="px-5 py-3.5">User Full Name</th>
                  <th className="px-5 py-3.5">Account ID</th>
                  <th className="px-5 py-3.5">Assigned Roles</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2536]">
                {filteredProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-[#141926] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C5A059]/30 to-slate-800 border border-[#C5A059]/40 flex items-center justify-center text-[11px] font-bold text-[#E5C07B]">
                          {profile.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span>{profile.full_name}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-400">
                      <span className="px-2 py-1 rounded bg-[#161B26] border border-[#232B3D] text-[11px] text-slate-300" title={profile.id}>
                        {profile.id.slice(0, 13)}...
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {profile.roles && profile.roles.length > 0 ? (
                          profile.roles.map((role) => (
                            <span
                              key={role}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider ${
                                role === "admin"
                                  ? "bg-[#C5A059]/20 text-[#E5C07B] border border-[#C5A059]/40"
                                  : role === "lawyer"
                                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                                  : "bg-slate-800 text-slate-300 border border-slate-700/60"
                              }`}
                            >
                              {role === "admin" && <Shield className="w-2.5 h-2.5" />}
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No role</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {profile.phone ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{profile.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          profile.is_active
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : "bg-red-500/15 text-red-300 border border-red-500/30"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            profile.is_active ? "bg-emerald-400" : "bg-red-400"
                          }`}
                        />
                        {profile.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
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
