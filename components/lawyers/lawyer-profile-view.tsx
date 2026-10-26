"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  MapPin,
  Clock,
  Languages,
  CheckCircle2,
  Scale,
  GraduationCap,
  Award,
  Calendar,
  Building,
  ArrowLeft,
  ArrowRight,
  Send,
  Sparkles,
  Phone,
  Video,
  AlertCircle,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { createConsultationRequest } from "@/app/actions/portal";
import { useLanguage } from "@/lib/i18n/context";

export interface LawyerEducation {
  id: string;
  degree: string;
  institution: string;
  field_of_study: string | null;
  graduation_year: number;
}

export interface LawyerQualification {
  id: string;
  title: string;
  issuing_authority: string;
  issue_date: string | null;
  verification_status: string;
}

export interface DetailedLawyerProfile {
  id: string;
  professional_name: string;
  bio: string | null;
  practice_areas: string[];
  experience_years: number;
  city: string;
  state: string;
  languages: string[];
  verification_status?: string;
  courts_of_practice?: string[];
  consultation_modes?: string[];
  consultation_fee?: number | null;
  office_address?: string | null;
  created_at?: string;
  educations: LawyerEducation[];
  qualifications: LawyerQualification[];
}

interface LawyerProfileViewProps {
  lawyer: DetailedLawyerProfile;
  isAuthenticated: boolean;
  userEmail?: string;
}

function getInitials(name: string): string {
  const clean = name.replace(/^(fake\s+)?(Adv\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s*/i, "").trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase() || "AD";
}

export function LawyerProfileView({
  lawyer,
  isAuthenticated,
  userEmail,
}: LawyerProfileViewProps) {
  const shouldReduceMotion = useReducedMotion();
  const { isHindi } = useLanguage();

  // Consultation Request State
  const [subject, setSubject] = useState("");
  const [consultationMode, setConsultationMode] = useState(
    lawyer.consultation_modes?.[0] || "Online Video Consultation"
  );
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");
  const [termsAcceptedChecked, setTermsAcceptedChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isVerified = lawyer.verification_status === "approved";
  const isPending = lawyer.verification_status === "pending";
  const initials = getInitials(lawyer.professional_name);
  const consultationFee = lawyer.consultation_fee || 1500;

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    if (!subject.trim()) {
      setSubmitFeedback({
        type: "error",
        message: isHindi ? "कृपया विषय दर्ज करें।" : "Please enter a subject for the consultation.",
      });
      return;
    }

    if (!message.trim()) {
      setSubmitFeedback({
        type: "error",
        message: isHindi ? "कृपया मामले का संक्षिप्त विवरण लिखें।" : "Please provide brief details of your legal matter.",
      });
      return;
    }

    if (!termsAcceptedChecked) {
      setSubmitFeedback({
        type: "error",
        message: isHindi
          ? "कृपया परामर्श नियम व शर्तों की पुष्टि करें।"
          : "Please confirm that you have reviewed and agree to the consultation terms.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitFeedback(null);

    try {
      const fullDetails = `[Mode: ${consultationMode}]\n${message.trim()}`;
      const res = await createConsultationRequest({
        lawyerId: lawyer.id,
        subject: subject.trim(),
        message: fullDetails,
        preferredDate: preferredDate || null,
        termsAccepted: {
          fee: consultationFee,
          currency: "INR",
          durationMinutes: 45,
          format: consultationMode,
          cancellationPolicy: "Free rescheduling or cancellation up to 4 hours before the session.",
          inclusions: "45-min legal evaluation, preliminary document review, procedural strategy advice.",
          acceptedAt: new Date().toISOString(),
        },
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit request");
      }

      setSubmitFeedback({
        type: "success",
        message: isHindi
          ? "परामर्श अनुरोध सफलतापूर्वक भेजा गया। अधिवक्ता की प्रतिक्रिया आपके डैशबोर्ड पर दिखाई देगी।"
          : "Consultation request sent successfully! You can track the advocate's response in your dashboard.",
      });
      setSubject("");
      setMessage("");
      setPreferredDate("");
      setTermsAcceptedChecked(false);
    } catch (err: unknown) {
      setSubmitFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to submit consultation request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFEFC] text-[#202824] antialiased">
      {/* Top Breadcrumb & Navigation */}
      <div className="border-b border-[#D5E5D9] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link
            href="/lawyers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#205C43] hover:text-[#174530] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isHindi ? "अधिवक्ता निर्देशिका पर वापस जाएं" : "Back to Directory"}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#69736D]">
              {isHindi ? "पहचान संदर्भ:" : "Registry ID:"}{" "}
              <strong className="text-[#202824]">{lawyer.id.slice(0, 8)}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Advocate Profile & Professional Credentials (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Card */}
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 15 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center font-serif text-xl sm:text-2xl font-bold text-[#205C43] shrink-0 shadow-2xs">
                  {initials}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#202824] tracking-tight">
                      {lawyer.professional_name}
                    </h1>
                  </div>

                  {/* Verification Status Pill */}
                  <div>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9] text-xs font-semibold font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43]" />
                        {isHindi ? "बीसीआई सत्यापित अधिवक्ता" : "BCI Verified Advocate"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        {isHindi ? "सत्यापन लंबित • बार काउंसिल साख प्रस्तुत" : "Newly Joined • Verification Pending"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Notice for Pending Verification */}
              {isPending && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block mb-0.5">
                      {isHindi ? "पंजीकरण सत्यापन प्रक्रियाधीन है" : "Verification in Progress"}
                    </strong>
                    {isHindi
                      ? "अधिवक्ता की बार काउंसिल साख सत्यापन हेतु प्रस्तुत कर दी गई है। बार काउंसिल ऑफ इंडिया के नियम 36 के तहत सहमति प्राप्त होने के कारण प्रारंभिक संपर्क सक्षम है।"
                      : "This advocate has submitted Bar Council credentials for administrative verification. Direct consultation booking is enabled for preliminary chambers inquiry while formal registrar validation completes."}
                  </div>
                </div>
              )}

              {/* Key Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#D5E5D9]">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#69736D] block font-semibold">
                    {isHindi ? "स्थान" : "Location"}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#202824]">
                    <MapPin className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
                    <span>{lawyer.city}, {lawyer.state}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#69736D] block font-semibold">
                    {isHindi ? "अनुभव" : "Experience"}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#202824]">
                    <Clock className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
                    <span>{lawyer.experience_years} {isHindi ? "वर्ष" : "Years"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#69736D] block font-semibold">
                    {isHindi ? "भाषाएं" : "Languages"}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#202824]">
                    <Languages className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
                    <span className="truncate">{lawyer.languages.join(", ")}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#69736D] block font-semibold">
                    {isHindi ? "परामर्श शुल्क" : "Consultation Fee"}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#202824]">
                    <Scale className="w-3.5 h-3.5 text-[#205C43] shrink-0" />
                    <span>
                      {lawyer.consultation_fee
                        ? `₹${lawyer.consultation_fee.toLocaleString("en-IN")}`
                        : isHindi ? "अधिवक्ता से पूछें" : "Inquire"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Biography & Practice Areas */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-6">
              {/* Practice Areas */}
              <div className="space-y-3">
                <h2 className="text-sm font-serif font-bold text-[#202824] uppercase tracking-wider">
                  {isHindi ? "अभ्यास क्षेत्र व विशेषज्ञताएं" : "Practice Areas & Specializations"}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {lawyer.practice_areas.map((pa) => (
                    <span
                      key={pa}
                      className="px-3 py-1 rounded-lg bg-[#EAF3ED] text-xs font-medium text-[#174530] border border-[#D5E5D9]"
                    >
                      {pa}
                    </span>
                  ))}
                </div>
              </div>

              {/* Courts of Practice */}
              {lawyer.courts_of_practice && lawyer.courts_of_practice.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-[#D5E5D9]">
                  <h2 className="text-sm font-serif font-bold text-[#202824] uppercase tracking-wider">
                    {isHindi ? "अदालतें व न्यायाधिकरण" : "Courts & Tribunals of Practice"}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {lawyer.courts_of_practice.map((court) => (
                      <span
                        key={court}
                        className="px-3 py-1 rounded-lg bg-[#F8FAF9] text-xs font-medium text-[#202824] border border-[#D5E5D9] flex items-center gap-1.5"
                      >
                        <Scale className="w-3 h-3 text-[#205C43]" />
                        {court}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Biography */}
              {lawyer.bio && (
                <div className="space-y-2 pt-4 border-t border-[#D5E5D9]">
                  <h2 className="text-sm font-serif font-bold text-[#202824] uppercase tracking-wider">
                    {isHindi ? "व्यावसायिक प्रोफ़ाइल व परिचय" : "Professional Biography"}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4A544F] leading-relaxed whitespace-pre-line">
                    {lawyer.bio}
                  </p>
                </div>
              )}

              {/* Chamber Address */}
              {lawyer.office_address && (
                <div className="space-y-1.5 pt-4 border-t border-[#D5E5D9] text-xs text-[#69736D]">
                  <span className="font-mono uppercase text-[10px] block font-semibold text-[#69736D]">
                    {isHindi ? "चैंबर व कार्यालय पता" : "Office / Chamber Address"}
                  </span>
                  <div className="flex items-start gap-1.5 text-xs text-[#202824]">
                    <Building className="w-3.5 h-3.5 text-[#205C43] shrink-0 mt-0.5" />
                    <span>{lawyer.office_address}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Education History Section */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#205C43]" />
                <h2 className="text-base font-serif font-bold text-[#202824]">
                  {isHindi ? "शैक्षणिक पृष्ठभूमि व डिग्रियां" : "Education & Academic Qualifications"}
                </h2>
              </div>

              {lawyer.educations.length > 0 ? (
                <div className="divide-y divide-[#D5E5D9]/70">
                  {lawyer.educations.map((edu) => (
                    <div key={edu.id} className="py-3.5 first:pt-1 last:pb-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-xs sm:text-sm text-[#202824]">
                          {edu.degree}
                        </h3>
                        <span className="text-[11px] font-mono text-[#69736D] bg-[#F8FAF9] px-2 py-0.5 rounded border border-[#D5E5D9]">
                          {edu.graduation_year}
                        </span>
                      </div>
                      <p className="text-xs text-[#4A544F] flex items-center gap-1.5">
                        <Building className="w-3 h-3 text-[#205C43] shrink-0" />
                        <span>{edu.institution}</span>
                      </p>
                      {edu.field_of_study && (
                        <p className="text-[11px] text-[#69736D] italic">
                          Specialization: {edu.field_of_study}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#69736D] italic">
                  {isHindi ? "कोई सार्वजनिक शैक्षणिक विवरण दर्ज नहीं है।" : "No public education entries registered yet."}
                </p>
              )}
            </div>

            {/* Professional Qualifications & Accreditations Section */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#205C43]" />
                <h2 className="text-base font-serif font-bold text-[#202824]">
                  {isHindi ? "व्यावसायिक प्रमाणन व अतिरिक्त साख" : "Professional Qualifications & Accreditations"}
                </h2>
              </div>

              {lawyer.qualifications.length > 0 ? (
                <div className="divide-y divide-[#D5E5D9]/70">
                  {lawyer.qualifications.map((qual) => (
                    <div key={qual.id} className="py-3.5 first:pt-1 last:pb-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-xs sm:text-sm text-[#202824]">
                          {qual.title}
                        </h3>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9] font-semibold">
                          {qual.verification_status === "verified" ? "Verified Credential" : "Declared by Advocate"}
                        </span>
                      </div>
                      <p className="text-xs text-[#4A544F]">
                        Issuing Authority: <strong className="text-[#202824]">{qual.issuing_authority}</strong>
                      </p>
                      {qual.issue_date && (
                        <p className="text-[11px] font-mono text-[#69736D]">
                          Issued: {new Date(qual.issue_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#69736D] italic">
                  {isHindi ? "कोई अतिरिक्त प्रमाणन दर्ज नहीं है।" : "No professional certifications listed."}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Consultation Booking & Inquiry Box (4 cols) */}
          <div className="lg:col-span-4 sticky top-20 space-y-4" id="consultation">
            <motion.div
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 15 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-sm space-y-5"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#205C43] font-bold block">
                  {isHindi ? "प्रत्यक्ष चैंबर संपर्क" : "Direct Chambers Inquiry"}
                </span>
                <h3 className="text-lg font-serif font-bold text-[#202824]">
                  {isPending
                    ? isHindi ? "प्रारंभिक पूछताछ भेजें" : "Submit Preliminary Inquiry"
                    : isHindi ? "कानूनी परामर्श अनुरोध" : "Request Legal Consultation"}
                </h3>
                <p className="text-xs text-[#69736D]">
                  {isHindi
                    ? "सीधे अधिवक्ता के चैंबर को सुरक्षित संदेश व समय प्राथमिकता भेजें।"
                    : "Connect directly with this advocate's legal team with confidentiality."}
                </p>
              </div>

              {submitFeedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs leading-relaxed flex items-start gap-2 ${
                    submitFeedback.type === "success"
                      ? "bg-[#EAF3ED] border border-[#D5E5D9] text-[#174530]"
                      : "bg-rose-50 border border-rose-200 text-rose-800"
                  }`}
                >
                  {submitFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  )}
                  <span>{submitFeedback.message}</span>
                </div>
              )}

              {isAuthenticated ? (
                <form onSubmit={handleConsultationSubmit} className="space-y-4">
                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#202824] block">
                      {isHindi ? "परामर्श विषय *" : "Subject of Inquiry *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Commercial Contract Review or Bail Appeal"
                      className="w-full px-3 py-2 rounded-xl border border-[#D5E5D9] text-xs focus:ring-2 focus:ring-[#205C43] focus:border-transparent outline-none bg-[#FDFEFC]"
                    />
                  </div>

                  {/* Consultation Mode */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#202824] block">
                      {isHindi ? "परामर्श माध्यम" : "Preferred Mode"}
                    </label>
                    <select
                      value={consultationMode}
                      onChange={(e) => setConsultationMode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5E5D9] text-xs focus:ring-2 focus:ring-[#205C43] focus:border-transparent outline-none bg-white text-[#202824]"
                    >
                      <option value="Online Video Consultation">Online Video Consultation</option>
                      <option value="In-Chambers Consultation">In-Chambers (In-Person)</option>
                      <option value="Phone Consultation">Phone Consultation</option>
                    </select>
                  </div>

                  {/* Preferred Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#202824] block">
                      {isHindi ? "इच्छित तिथि (वैकल्पिक)" : "Preferred Date (Optional)"}
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5E5D9] text-xs focus:ring-2 focus:ring-[#205C43] focus:border-transparent outline-none bg-white text-[#202824]"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#202824] block">
                      {isHindi ? "मामले का संक्षिप्त विवरण *" : "Brief Summary of Matter *"}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Outline relevant background, urgent deadlines, court if applicable..."
                      className="w-full px-3 py-2 rounded-xl border border-[#D5E5D9] text-xs focus:ring-2 focus:ring-[#205C43] focus:border-transparent outline-none bg-[#FDFEFC] resize-none"
                    />
                  </div>

                  {/* Transparent Consultation Terms Summary Box */}
                  <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-[#D5E5D9]/70 font-semibold text-[#202824]">
                      <span className="flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-[#205C43]" />
                        <span>{isHindi ? "पारदर्शी परामर्श शर्तें" : "Transparent Consultation Terms"}</span>
                      </span>
                      <span className="text-[#205C43] font-mono font-bold">
                        ₹{consultationFee.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-[#4A544F]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#69736D]">{isHindi ? "अवधि व प्रारूप:" : "Duration & Format:"}</span>
                        <span className="font-medium text-[#202824]">45 Mins • {consultationMode}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#69736D]">{isHindi ? "शामिल सेवाएं:" : "Scope:"}</span>
                        <span className="font-medium text-[#202824]">Preliminary legal evaluation</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#69736D]">{isHindi ? "रद्दीकरण नीति:" : "Cancellation:"}</span>
                        <span className="font-medium text-[#202824]">Free up to 4 hrs prior</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#D5E5D9]/70">
                      <label className="flex items-start gap-2 cursor-pointer text-[11px] text-[#202824] leading-tight select-none">
                        <input
                          type="checkbox"
                          checked={termsAcceptedChecked}
                          onChange={(e) => setTermsAcceptedChecked(e.target.checked)}
                          className="mt-0.5 rounded border-[#D5E5D9] text-[#205C43] focus:ring-[#205C43] cursor-pointer"
                        />
                        <span>
                          {isHindi
                            ? `मैं ₹${consultationFee.toLocaleString("en-IN")} परामर्श शुल्क और चैंबर नियमों की समीक्षा व स्वीकृति देता हूँ।`
                            : `I review & accept the ₹${consultationFee.toLocaleString("en-IN")} consultation fee and chambers policy before request submission.`}
                        </span>
                      </label>
                    </div>
                  </div>

                  <MagneticWrapper className="w-full" maxDisplacement={4}>
                    <button
                      type="submit"
                      disabled={isSubmitting || !termsAcceptedChecked}
                      className="w-full py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>{isHindi ? "भेजा जा रहा है..." : "Submitting Inquiry..."}</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{isPending ? "Send Chambers Inquiry" : "Submit Consultation Request"}</span>
                        </>
                      )}
                    </button>
                  </MagneticWrapper>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-[#EAF3ED]/80 border border-[#D5E5D9] text-center space-y-3">
                  <p className="text-xs text-[#4A544F]">
                    {isHindi
                      ? "अधिवक्ता से परामर्श अनुरोध भेजने के लिए कृपया मुवक्किल खाते से साइन इन करें।"
                      : "Please sign in or register as a client to submit a direct consultation request to this advocate."}
                  </p>
                  <Link
                    href={`/auth/login?redirect=${encodeURIComponent(`/lawyers/${lawyer.id}`)}`}
                    className="w-full py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 block text-center"
                  >
                    <span>{isHindi ? "साइन इन करें" : "Sign In to Request"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              <div className="pt-2 border-t border-[#D5E5D9] text-[11px] text-[#69736D] flex items-center gap-1.5 justify-center">
                <BadgeCheck className="w-3.5 h-3.5 text-[#205C43]" />
                <span>BCI Rule 36 Ethical Non-Solicitation Compliant</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
