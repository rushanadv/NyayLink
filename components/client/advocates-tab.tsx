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
  AlertCircle,
  ShieldCheck,
  Scale,
} from "lucide-react";

interface AdvocatesTabProps {
  advocates: PublicLawyer[];
  underReviewAdvocates?: PublicLawyer[];
  matters: LegalMatter[];
  onConsultationRequested?: () => void;
}

export function AdvocatesTab({
  advocates,
  underReviewAdvocates = [],
  matters,
  onConsultationRequested,
}: AdvocatesTabProps) {
  const [activeSurface, setActiveSurface] = useState<"verified" | "under_review">("verified");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string>("All");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");

  // Consultation Modal State
  const [selectedLawyer, setSelectedLawyer] = useState<PublicLawyer | null>(null);
  const [subject, setSubject] = useState("");
  const [matterId, setMatterId] = useState<string>("");
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Active pool of lawyers based on surface
  const currentPool = activeSurface === "verified" ? advocates : underReviewAdvocates;

  // Extract unique filters from active surface pool
  const allPracticeAreas = Array.from(
    new Set(currentPool.flatMap((l) => l.practice_areas || []))
  );
  const allCities = Array.from(
    new Set(currentPool.map((l) => l.city).filter(Boolean))
  );
  const allLanguages = Array.from(
    new Set(currentPool.flatMap((l) => l.languages || []))
  );

  const filteredAdvocates = currentPool.filter((lawyer) => {
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

    return matchesSearch && matchesArea && matchesCity && matchesLanguage;
  });

  const handleOpenConsultationModal = (lawyer: PublicLawyer) => {
    setSelectedLawyer(lawyer);
    const isPending = lawyer.verification_status === "pending";
    setSubject(
      isPending
        ? `Preliminary Inquiry: ${lawyer.practice_areas?.[0] || "General Inquiry"}`
        : `Consultation: ${lawyer.practice_areas?.[0] || "Legal Consultation"}`
    );
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
    const isPending = selectedLawyer.verification_status === "pending";

    try {
      const formattedMessage = isPending
        ? `[Preliminary Inquiry - Unverified Profile Under Review]\n${message}`
        : message;

      const res = await createConsultationRequest({
        lawyerId: selectedLawyer.id,
        matterId: matterId || null,
        subject,
        message: formattedMessage,
        preferredDate: preferredDate || null,
        termsAccepted: isPending
          ? {
              fee: 0,
              currency: "INR",
              durationMinutes: 0,
              format: "Preliminary Inquiry",
              isPreliminaryInquiry: true,
              cancellationPolicy: "Non-binding preliminary chambers inquiry. No fee charged.",
              inclusions: "Non-binding chambers inquiry. Does not establish legal representation.",
              acceptedAt: new Date().toISOString(),
            }
          : undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit request");
      }

      setModalSuccess(true);
      if (onConsultationRequested) {
        onConsultationRequested();
      }
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header with Surface Switcher */}
      <div className="pb-5 border-b border-[#D5E5D9] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
            {activeSurface === "verified"
              ? "Verified Advocate Register"
              : "Profiles Under Review"}
          </h1>
          <p className="text-xs text-[#69736D] mt-1">
            {activeSurface === "verified"
              ? "Enrolled Bar Council advocates authenticated through registry verification."
              : "Advocates currently undergoing administrative credential review. Paid bookings disabled."}
          </p>
        </div>

        {/* Distinct Surface Switcher Tabs */}
        <div className="flex items-center gap-2 bg-[#F8FAF9] p-1.5 rounded-xl border border-[#D5E5D9]">
          <button
            onClick={() => {
              setActiveSurface("verified");
              setSelectedPracticeArea("All");
              setSelectedCity("All");
              setSelectedLanguage("All");
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSurface === "verified"
                ? "bg-[#205C43] text-white shadow-xs"
                : "text-[#4A544F] hover:text-[#202824]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Advocates</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeSurface === "verified"
                  ? "bg-white/20 text-white"
                  : "bg-[#D5E5D9] text-[#202824]"
              }`}
            >
              {advocates.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSurface("under_review");
              setSelectedPracticeArea("All");
              setSelectedCity("All");
              setSelectedLanguage("All");
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSurface === "under_review"
                ? "bg-neutral-800 text-white shadow-xs"
                : "text-[#4A544F] hover:text-[#202824]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Profiles Under Review</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeSurface === "under_review"
                  ? "bg-white/20 text-white"
                  : "bg-neutral-200 text-neutral-800"
              }`}
            >
              {underReviewAdvocates.length}
            </span>
            <span className="text-[9px] font-mono uppercase bg-neutral-200/80 text-neutral-800 px-1 py-0.5 rounded">
              Not yet verified
            </span>
          </button>
        </div>
      </div>

      {/* Surface Explanatory Notice for Profiles Under Review */}
      {activeSurface === "under_review" && (
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-300 text-xs text-neutral-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold text-neutral-900 flex items-center gap-2">
              <span>Profiles Under Review</span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-neutral-200 text-neutral-800">
                Not yet verified
              </span>
            </div>
            <p className="text-neutral-600 leading-relaxed text-[11px]">
              These advocates have submitted their Bar Council enrolment details and are undergoing administrative review. Paid consultation bookings are disabled. Clients may submit free, non-binding preliminary inquiries. Inquiries do not confirm an appointment or establish legal representation.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#69736D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeSurface === "verified"
                ? "Search verified advocates by name, specialty, or court..."
                : "Search under-review profiles by name or specialization..."
            }
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
        </div>
      </div>

      {/* Advocates Grid */}
      {filteredAdvocates.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-[#D5E5D9] text-center space-y-2">
          <p className="text-sm font-medium text-[#202824]">
            {activeSurface === "verified"
              ? "No verified advocates match your criteria"
              : "No profiles under review match your criteria"}
          </p>
          <p className="text-xs text-[#69736D]">
            {currentPool.length === 0
              ? activeSurface === "verified"
                ? "No verified advocate profiles are currently published."
                : "No advocate profiles are currently under administrative review."
              : "Try adjusting your search terms or clearing filters to view available profiles."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAdvocates.map((advocate) => {
            const isPending = advocate.verification_status === "pending";

            return (
              <div
                key={advocate.id}
                className={`p-5 rounded-2xl bg-white border ${
                  isPending
                    ? "border-neutral-300 hover:border-neutral-400"
                    : "border-[#D5E5D9] hover:border-[#205C43]/60"
                } shadow-xs flex flex-col justify-between transition-all space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-serif font-semibold text-[#202824]">
                        {advocate.professional_name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#69736D] mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#205C43]" />
                        <span>
                          {advocate.city
                            ? `${advocate.city}, ${advocate.state || "India"}`
                            : "Pan-India Practice"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9] shrink-0">
                      {advocate.experience_years}y Exp
                    </span>
                  </div>

                  {/* Verification Status Badge */}
                  <div className="flex items-center gap-1.5">
                    {isPending ? (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-600" />
                        Not yet verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#205C43]" />
                        Verified Advocate
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
                  {isPending && (
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-800 leading-snug space-y-0.5">
                      <div className="font-semibold font-mono text-[10px] uppercase text-neutral-900 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-600" />
                        <span>Profile Under Review</span>
                      </div>
                      <p className="text-neutral-600 text-[11px]">
                        Credentials under review. Paid consultations disabled; preliminary inquiries are non-binding.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#D5E5D9] flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-[#69736D]">
                    {isPending ? "Under Administrative Review" : "Bar Council Enrolled"}
                  </span>
                  <button
                    onClick={() => handleOpenConsultationModal(advocate)}
                    className={`px-3.5 py-1.5 rounded-xl ${
                      isPending
                        ? "bg-neutral-800 hover:bg-neutral-900 text-white"
                        : "bg-[#205C43] hover:bg-[#174530] text-white"
                    } text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.99]`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isPending ? "Preliminary Inquiry (Free)" : "Request Consult"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Consultation Request Modal */}
      {selectedLawyer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#D5E5D9] shadow-xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5E5D9]">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg ${
                    selectedLawyer.verification_status === "pending"
                      ? "bg-neutral-100 text-neutral-800"
                      : "bg-[#EAF3ED] text-[#205C43]"
                  } flex items-center justify-center`}
                >
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-semibold text-[#202824]">
                    {selectedLawyer.verification_status === "pending"
                      ? "Non-Binding Preliminary Inquiry"
                      : "Request Legal Consultation"}
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
                  {selectedLawyer.verification_status === "pending"
                    ? "Preliminary Inquiry Dispatched"
                    : "Consultation Request Sent"}
                </h4>
                <p className="text-xs text-emerald-800">
                  {selectedLawyer.verification_status === "pending"
                    ? "Your preliminary inquiry has been forwarded to counsel's chambers. Note: Inquiries with under-review advocates are non-binding and do not establish legal representation."
                    : `Your request has been dispatched to ${selectedLawyer.professional_name}'s chambers. You will receive notification upon their response.`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitConsultation} className="space-y-4">
                {selectedLawyer.verification_status === "pending" && (
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-300 text-xs text-neutral-900 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold font-mono text-[11px] uppercase text-neutral-900">
                        Profile Under Review • Not Yet Verified
                      </p>
                      <p className="text-[11px] text-neutral-600 leading-relaxed">
                        This advocate is currently under administrative review. This inquiry is non-binding and free of charge. Submitting an inquiry does not constitute legal representation or confirm a consultation.
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
                    {selectedLawyer.verification_status === "pending"
                      ? "Inquiry Subject"
                      : "Consultation Subject"}
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
                    Brief Message / Inquiry Details
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your legal matter or questions for counsel..."
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
                    className={`px-4 py-2 rounded-xl ${
                      selectedLawyer.verification_status === "pending"
                        ? "bg-neutral-800 hover:bg-neutral-900"
                        : "bg-[#205C43] hover:bg-[#174530]"
                    } text-white text-xs font-semibold flex items-center gap-2 shadow-xs disabled:opacity-50`}
                  >
                    {isSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {selectedLawyer.verification_status === "pending"
                            ? "Submit Inquiry (Free)"
                            : "Send Consultation Request"}
                        </span>
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
