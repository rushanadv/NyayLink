"use client";

import { useState } from "react";
import { PublicLawyer } from "@/components/lawyers/lawyer-directory-client";
import { LegalMatter } from "@/lib/portal/types";
import { createConsultationRequest } from "@/app/actions/portal";
import {
  Search,
  MapPin,
  Calendar,
  Send,
  X,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface AdvocatesTabProps {
  advocates: PublicLawyer[];
  matters: LegalMatter[];
  onConsultationRequested?: () => void;
}

export function AdvocatesTab({
  advocates,
  matters,
  onConsultationRequested,
}: AdvocatesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string>("All");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Consultation Modal State
  const [selectedLawyer, setSelectedLawyer] = useState<PublicLawyer | null>(null);
  const [subject, setSubject] = useState("");
  const [matterId, setMatterId] = useState<string>("");
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Extract unique filters
  const allPracticeAreas = Array.from(
    new Set(advocates.flatMap((l) => l.practice_areas || []))
  );
  const allCities = Array.from(
    new Set(advocates.map((l) => l.city).filter(Boolean))
  );
  const allLanguages = Array.from(
    new Set(advocates.flatMap((l) => l.languages || []))
  );

  const filteredAdvocates = advocates.filter((lawyer) => {
    const matchesSearch =
      searchQuery === "" ||
      lawyer.professional_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lawyer.practice_areas?.some((pa) =>
        pa.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      lawyer.languages?.some((lang) =>
        lang.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesArea =
      selectedPracticeArea === "All" ||
      lawyer.practice_areas?.includes(selectedPracticeArea);

    const matchesCity =
      selectedCity === "All" || lawyer.city === selectedCity;

    const matchesLanguage =
      selectedLanguage === "All" ||
      lawyer.languages?.includes(selectedLanguage);

    const lawyerStatus = lawyer.verification_status || "approved";
    const matchesStatus =
      selectedStatus === "All" || lawyerStatus === selectedStatus;

    return matchesSearch && matchesArea && matchesCity && matchesLanguage && matchesStatus;
  });

  const handleOpenConsultationModal = (lawyer: PublicLawyer) => {
    setSelectedLawyer(lawyer);
    setSubject(`Preliminary Consultation: ${lawyer.practice_areas?.[0] || "Legal Inquiry"}`);
    setMatterId(matters[0]?.id || "");
    setPreferredDate(new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]);
    setMessage("");
    setModalSuccess(false);
    setModalError(null);
  };

  const handleCloseModal = () => {
    setSelectedLawyer(null);
    setModalSuccess(false);
    setModalError(null);
  };

  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLawyer) return;

    setModalError(null);
    setIsSubmitting(true);

    try {
      const res = await createConsultationRequest({
        lawyerId: selectedLawyer.id,
        matterId: matterId || null,
        subject,
        message,
        preferredDate: preferredDate || null,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit consultation request");
      }

      setModalSuccess(true);
      if (onConsultationRequested) {
        onConsultationRequested();
      }
      setTimeout(() => {
        handleCloseModal();
      }, 1800);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="pb-4 border-b border-[#D5E5D9]">
        <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
          Find Verified Advocates
        </h1>
        <p className="text-xs text-[#69736D] mt-1">
          Connect with Bar Council verified advocates across High Courts and specialized tribunals.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#69736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by advocate name, specialty, or legal keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] placeholder-[#69736D] focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15"
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          <select
            value={selectedPracticeArea}
            onChange={(e) => setSelectedPracticeArea(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] bg-white focus:outline-none focus:border-[#205C43]"
          >
            <option value="All">All Practice Areas</option>
            {allPracticeAreas.map((pa) => (
              <option key={pa} value={pa}>
                {pa}
              </option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] bg-white focus:outline-none focus:border-[#205C43]"
          >
            <option value="All">All Jurisdictions / Cities</option>
            {allCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] bg-white focus:outline-none focus:border-[#205C43]"
          >
            <option value="All">All Languages</option>
            {allLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] bg-white focus:outline-none focus:border-[#205C43]"
          >
            <option value="All">All Statuses</option>
            <option value="approved">BCI Verified Only</option>
            <option value="pending">Newly Joined (Pending)</option>
          </select>
        </div>
      </div>

      {/* Advocates Grid */}
      {filteredAdvocates.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-[#D5E5D9] text-center space-y-2">
          <p className="text-sm font-medium text-[#202824]">No advocates match your criteria</p>
          <p className="text-xs text-[#69736D]">
            {advocates.length === 0
              ? "No advocate profiles are currently published in this registry view. As independent advocates complete onboarding and grant client discovery consent, they will appear here."
              : "Try adjusting your search terms or clearing the selected filters to view all available practitioners."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAdvocates.map((advocate) => (
            <div
              key={advocate.id}
              className="p-5 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs flex flex-col justify-between hover:border-[#205C43]/60 transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-serif font-semibold text-[#202824]">
                      {advocate.professional_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#69736D] mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#205C43]" />
                      <span>{advocate.city ? `${advocate.city}, ${advocate.state || "India"}` : "Pan-India Practice"}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9] shrink-0">
                    {advocate.experience_years}y Exp
                  </span>
                </div>

                {/* Verification Status Badge */}
                <div className="flex items-center gap-1.5">
                  {advocate.verification_status === "pending" ? (
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-700" />
                      Newly Joined • Verification Pending
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#205C43]" />
                      BCI Verified Advocate
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#69736D] leading-relaxed line-clamp-3">
                  {advocate.bio || "Practicing counsel before State High Courts and District Benches."}
                </p>

                {advocate.practice_areas && advocate.practice_areas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {advocate.practice_areas.slice(0, 3).map((area) => (
                      <span
                        key={area}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8FAF9] text-[#202824] border border-[#D5E5D9]"
                      >
                        {area}
                      </span>
                    ))}
                    {advocate.practice_areas.length > 3 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded text-[#69736D]">
                        +{advocate.practice_areas.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Pending Verification Notice */}
                {advocate.verification_status === "pending" && (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 leading-snug space-y-0.5">
                    <div className="font-semibold font-mono text-[10px] uppercase text-amber-950 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-700" />
                      <span>Verification In Progress</span>
                    </div>
                    <p className="text-amber-800 text-[11px]">
                      Bar Council credentials submitted. Preliminary chambers consultation inquiries are logged directly in their docket.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#D5E5D9] flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-[#69736D]">
                  {advocate.verification_status === "pending" ? "Credential Review" : "Bar Council Enrolled"}
                </span>
                <button
                  onClick={() => handleOpenConsultationModal(advocate)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.99]"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{advocate.verification_status === "pending" ? "Inquire with Chambers" : "Request Consult"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consultation Request Modal */}
      {selectedLawyer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#D5E5D9] shadow-xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E5D9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#205C43] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-semibold text-[#202824]">
                    Request Legal Consultation
                  </h3>
                  <p className="text-[11px] text-[#69736D]">
                    With {selectedLawyer.professional_name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-[#69736D] hover:text-[#202824] transition-colors p-1 rounded-lg hover:bg-[#F2F7F4]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalSuccess ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-semibold text-emerald-950">
                  Consultation Request Sent
                </h4>
                <p className="text-xs text-emerald-800">
                  Your request has been dispatched to {selectedLawyer.professional_name}&apos;s chambers. You will receive notification upon their response.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitConsultation} className="space-y-4">
                {selectedLawyer.verification_status === "pending" && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold font-mono text-[11px] uppercase text-amber-900">
                        Advocate Credential Notice
                      </p>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        {selectedLawyer.professional_name} is newly registered on NyayLink. Their Bar Council enrollment credentials are currently undergoing registrar review. Preliminary consultation inquiries are logged directly in their chambers inbox.
                      </p>
                    </div>
                  </div>
                )}

                {modalError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                    {modalError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                    Consultation Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full h-10 px-3.5 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15"
                  />
                </div>

                {matters.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                      Link to Active Matter (Optional)
                    </label>
                    <select
                      value={matterId}
                      onChange={(e) => setMatterId(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full h-10 px-3 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] bg-white focus:outline-none focus:border-[#205C43]"
                    >
                      <option value="">No linked matter (Standalone Inquiry)</option>
                      {matters.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.title} (#{m.id.slice(0, 6)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full h-10 px-3.5 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] focus:outline-none focus:border-[#205C43]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                    Brief Message / Questions for Counsel
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe what questions you would like addressed during this conference..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full p-3 rounded-xl border border-[#D5E5D9] text-xs text-[#202824] focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15 leading-relaxed"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#D5E5D9]">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#69736D] hover:bg-[#F2F7F4]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
