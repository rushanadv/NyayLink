"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Save,
  ShieldCheck,
  Building,
  GraduationCap,
  Award,
  Upload,
  FileText,
  Trash2,
  ExternalLink,
  Plus,
  Scale,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  ChevronRight,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  saveAdvocateFullDetails,
  saveAdvocateEducation,
  deleteAdvocateEducation,
  saveAdvocateQualification,
  deleteAdvocateQualification,
  uploadAdvocateDocument,
  getAdvocateDocumentSignedUrl,
  deleteAdvocateDocument,
} from "@/app/actions/advocate-profile";
import { useLanguage } from "@/lib/i18n/context";

export interface ProfileCompletionProps {
  initialData: {
    userId: string;
    userEmail: string;
    profile: { full_name?: string | null; phone?: string | null } | null;
    lawyerProfile: {
      professional_name?: string | null;
      bar_council_number?: string | null;
      bar_council_state?: string | null;
      bar_council_enrollment_year?: number | null;
      city?: string | null;
      state?: string | null;
      practice_areas?: string[] | null;
      languages?: string[] | null;
      experience_years?: number | null;
      bio?: string | null;
      courts_of_practice?: string[] | null;
      consultation_modes?: string[] | null;
      consultation_fee?: number | null;
      office_address?: string | null;
      is_published?: boolean | null;
      is_profile_completed?: boolean | null;
    } | null;
    verification: {
      status?: string | null;
      submitted_at?: string | null;
      lawyer_feedback?: string | null;
    } | null;
    educations: Array<{
      id: string;
      degree: string;
      institution: string;
      field_of_study: string | null;
      graduation_year: number;
      is_public: boolean;
    }>;
    qualifications: Array<{
      id: string;
      title: string;
      issuing_authority: string;
      issue_date: string | null;
      verification_status: string;
      is_public: boolean;
    }>;
    documents: Array<{
      id: string;
      document_type: string;
      file_name: string;
      file_size: number;
      mime_type: string;
      storage_path: string;
      is_verified: boolean;
      created_at: string;
    }>;
    completeness: {
      percentage: number;
      sections: {
        personal: boolean;
        bar_council: boolean;
        practice: boolean;
        education: boolean;
        documents: boolean;
      };
      missing_fields: string[];
      completed_fields: string[];
      can_submit: boolean;
    };
  };
  onCompleteRedirect?: string;
}

const STATE_BAR_COUNCILS = [
  "Bar Council of Delhi",
  "Bar Council of Maharashtra & Goa",
  "Bar Council of Uttar Pradesh",
  "Bar Council of Karnataka",
  "Bar Council of Tamil Nadu & Puducherry",
  "Bar Council of West Bengal",
  "Bar Council of Punjab & Haryana",
  "Bar Council of Gujarat",
  "Bar Council of Rajasthan",
  "Bar Council of Madhya Pradesh",
  "Bar Council of Bihar",
  "Bar Council of Kerala",
  "Bar Council of Andhra Pradesh",
  "Bar Council of Telangana",
  "Bar Council of Odisha",
  "Bar Council of Assam, Nagaland, Mizoram, Arunachal Pradesh & Sikkim",
  "Bar Council of Jharkhand",
  "Bar Council of Chhattisgarh",
  "Bar Council of Himachal Pradesh",
  "Bar Council of Uttarakhand",
  "Bar Council of Jammu & Kashmir and Ladakh",
];

const AVAILABLE_PRACTICE_AREAS = [
  "Constitutional Law",
  "Criminal Defense",
  "Civil Litigation",
  "Commercial & Corporate Arbitration",
  "Corporate & Commercial",
  "Insolvency & Bankruptcy (NCLT)",
  "Banking & DRT / IBC",
  "Real Estate & RERA Appeals",
  "Family & Matrimonial",
  "Consumer Protection",
  "Technology, IP & Data Protection",
  "Taxation & GST",
  "Labour & Industrial",
  "Motor Accident (MACT)",
];

const AVAILABLE_LANGUAGES = [
  "English",
  "Hindi",
  "Bengali",
  "Marathi",
  "Telugu",
  "Tamil",
  "Gujarati",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Odia",
  "Urdu",
  "Assamese",
];

const COMMON_COURTS = [
  "Supreme Court of India",
  "Delhi High Court",
  "Bombay High Court",
  "Calcutta High Court",
  "Madras High Court",
  "Karnataka High Court",
  "Punjab & Haryana High Court",
  "Allahabad High Court",
  "Rajasthan High Court",
  "Patiala House District Courts",
  "Tis Hazari District Courts",
  "Saket District Courts",
  "City Civil Court Mumbai",
  "National Company Law Tribunal (NCLT)",
  "National Consumer Disputes Redressal Commission (NCDRC)",
];

export function ProfileCompletionExperience({
  initialData,
  onCompleteRedirect = "/lawyer/dashboard",
}: ProfileCompletionProps) {
  const shouldReduceMotion = useReducedMotion();
  const { isHindi } = useLanguage();
  const [isPending, startTransition] = useTransition();

  // Active Wizard Tab: 1: Basics, 2: Bar Council, 3: Practice & Courts, 4: Education, 5: Qualifications, 6: Documents, 7: Review & Publication
  const [activeStep, setActiveStep] = useState<number>(1);

  // Form State
  const [professionalName, setProfessionalName] = useState(
    initialData.lawyerProfile?.professional_name || initialData.profile?.full_name || ""
  );
  const [phone, setPhone] = useState(
    initialData.profile?.phone || ""
  );
  const [city, setCity] = useState(initialData.lawyerProfile?.city || "");
  const [state, setState] = useState(initialData.lawyerProfile?.state || "Delhi");
  const [officeAddress, setOfficeAddress] = useState(
    initialData.lawyerProfile?.office_address || ""
  );

  // Bar Council
  const [barCouncilNumber, setBarCouncilNumber] = useState(
    initialData.lawyerProfile?.bar_council_number || ""
  );
  const [barCouncilState, setBarCouncilState] = useState(
    initialData.lawyerProfile?.bar_council_state || "Bar Council of Delhi"
  );
  const [enrollmentYear, setEnrollmentYear] = useState<number>(
    initialData.lawyerProfile?.bar_council_enrollment_year || 2018
  );

  // Practice & Courts
  const [practiceAreas, setPracticeAreas] = useState<string[]>(
    initialData.lawyerProfile?.practice_areas || ["Civil Litigation", "Criminal Defense"]
  );
  const [languages, setLanguages] = useState<string[]>(
    initialData.lawyerProfile?.languages || ["English", "Hindi"]
  );
  const [experienceYears, setExperienceYears] = useState<number>(
    initialData.lawyerProfile?.experience_years ?? 5
  );
  const [courts, setCourts] = useState<string[]>(
    initialData.lawyerProfile?.courts_of_practice || ["Delhi High Court"]
  );
  const [customCourtInput, setCustomCourtInput] = useState("");
  const [consultationModes, setConsultationModes] = useState<string[]>(
    initialData.lawyerProfile?.consultation_modes || ["Online Video Consultation", "In-Chambers Consultation"]
  );
  const [consultationFee, setConsultationFee] = useState<string>(
    initialData.lawyerProfile?.consultation_fee ? String(initialData.lawyerProfile.consultation_fee) : ""
  );
  const [bio, setBio] = useState(initialData.lawyerProfile?.bio || "");

  // Education state
  const [educations, setEducations] = useState(initialData.educations);
  const [newDegree, setNewDegree] = useState("");
  const [newInstitution, setNewInstitution] = useState("");
  const [newField, setNewField] = useState("");
  const [newGradYear, setNewGradYear] = useState<number>(2018);
  const [isAddingEdu, setIsAddingEdu] = useState(false);

  // Qualifications state
  const [qualifications, setQualifications] = useState(initialData.qualifications);
  const [newQualTitle, setNewQualTitle] = useState("");
  const [newQualAuth, setNewQualAuth] = useState("");
  const [newQualDate, setNewQualDate] = useState("");
  const [isAddingQual, setIsAddingQual] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState(initialData.documents);
  const [selectedDocType, setSelectedDocType] = useState("bar_council_id");
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Publication Consent & Status
  const [isPublished, setIsPublished] = useState<boolean>(
    initialData.lawyerProfile?.is_published ?? true
  );

  // Live Completeness
  const [completeness, setCompleteness] = useState(initialData.completeness);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Feedback helper
  const showFeedback = (type: "success" | "error", text: string) => {
    setStatusFeedback({ type, text });
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  // Save General Profile Progress
  const handleSaveGeneralDetails = async (showToast = true) => {
    setStatusFeedback(null);
    try {
      const parsedFee = consultationFee ? parseFloat(consultationFee) : null;
      const res = await saveAdvocateFullDetails({
        professional_name: professionalName,
        phone,
        bar_council_number: barCouncilNumber,
        bar_council_state: barCouncilState,
        bar_council_enrollment_year: enrollmentYear,
        city,
        state,
        practice_areas: practiceAreas,
        languages,
        experience_years: experienceYears,
        bio,
        courts_of_practice: courts,
        consultation_modes: consultationModes,
        consultation_fee: parsedFee,
        office_address: officeAddress,
        is_published: isPublished,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to save profile progress.");
      }

      if (res.completeness) {
        setCompleteness(res.completeness);
      }
      if (showToast) {
        showFeedback("success", isHindi ? "विवरण सफलतापूर्वक सहेजा गया।" : "Profile details saved successfully.");
      }
      return true;
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Failed to save details");
      return false;
    }
  };

  // Add Education Entry
  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDegree.trim() || !newInstitution.trim()) return;

    startTransition(async () => {
      const res = await saveAdvocateEducation({
        degree: newDegree.trim(),
        institution: newInstitution.trim(),
        field_of_study: newField.trim() || null,
        graduation_year: newGradYear,
        is_public: true,
      });

      if (res.success && res.education) {
        setEducations([res.education, ...educations]);
        setNewDegree("");
        setNewInstitution("");
        setNewField("");
        setIsAddingEdu(false);
        showFeedback("success", "Education credential recorded.");
        await handleSaveGeneralDetails(false);
      } else {
        showFeedback("error", res.error || "Failed to add education");
      }
    });
  };

  // Remove Education Entry
  const handleDeleteEdu = async (id: string) => {
    startTransition(async () => {
      const res = await deleteAdvocateEducation(id);
      if (res.success) {
        setEducations(educations.filter((e) => e.id !== id));
        showFeedback("success", "Education entry removed.");
        await handleSaveGeneralDetails(false);
      }
    });
  };

  // Add Qualification Entry
  const handleAddQualification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQualTitle.trim() || !newQualAuth.trim()) return;

    startTransition(async () => {
      const res = await saveAdvocateQualification({
        title: newQualTitle.trim(),
        issuing_authority: newQualAuth.trim(),
        issue_date: newQualDate || null,
        is_public: true,
      });

      if (res.success && res.qualification) {
        setQualifications([res.qualification, ...qualifications]);
        setNewQualTitle("");
        setNewQualAuth("");
        setNewQualDate("");
        setIsAddingQual(false);
        showFeedback("success", "Professional qualification recorded.");
        await handleSaveGeneralDetails(false);
      } else {
        showFeedback("error", res.error || "Failed to add qualification");
      }
    });
  };

  // Remove Qualification
  const handleDeleteQual = async (id: string) => {
    startTransition(async () => {
      const res = await deleteAdvocateQualification(id);
      if (res.success) {
        setQualifications(qualifications.filter((q) => q.id !== id));
        showFeedback("success", "Qualification removed.");
        await handleSaveGeneralDetails(false);
      }
    });
  };

  // Document Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress("Uploading document to private credentials vault...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", selectedDocType);

      const res = await uploadAdvocateDocument(formData);
      if (res.success && res.document) {
        setDocuments([res.document, ...documents]);
        showFeedback("success", `Document "${file.name}" uploaded successfully.`);
        await handleSaveGeneralDetails(false);
      } else {
        showFeedback("error", res.error || "Failed to upload document");
      }
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadProgress(null);
      e.target.value = "";
    }
  };

  // View Document via Signed URL
  const handleViewDocument = async (storagePath: string) => {
    try {
      const res = await getAdvocateDocumentSignedUrl(storagePath);
      if (res.success && res.signedUrl) {
        window.open(res.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        showFeedback("error", res.error || "Failed to retrieve signed document link.");
      }
    } catch (err) {
      showFeedback("error", "Failed to retrieve document.");
    }
  };

  // Delete Document
  const handleDeleteDocument = async (docId: string) => {
    startTransition(async () => {
      const res = await deleteAdvocateDocument(docId);
      if (res.success) {
        setDocuments(documents.filter((d) => d.id !== docId));
        showFeedback("success", "Document removed from vault.");
        await handleSaveGeneralDetails(false);
      } else {
        showFeedback("error", res.error || "Failed to delete document");
      }
    });
  };

  // Practice area toggle
  const togglePracticeArea = (area: string) => {
    if (practiceAreas.includes(area)) {
      if (practiceAreas.length > 1) {
        setPracticeAreas(practiceAreas.filter((a) => a !== area));
      }
    } else {
      setPracticeAreas([...practiceAreas, area]);
    }
  };

  // Language toggle
  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      if (languages.length > 1) {
        setLanguages(languages.filter((l) => l !== lang));
      }
    } else {
      setLanguages([...languages, lang]);
    }
  };

  // Courts toggle
  const toggleCourt = (court: string) => {
    if (courts.includes(court)) {
      if (courts.length > 1) {
        setCourts(courts.filter((c) => c !== court));
      }
    } else {
      setCourts([...courts, court]);
    }
  };

  // Add custom court
  const handleAddCustomCourt = () => {
    if (customCourtInput.trim() && !courts.includes(customCourtInput.trim())) {
      setCourts([...courts, customCourtInput.trim()]);
      setCustomCourtInput("");
    }
  };

  const STEPS = [
    { num: 1, label: isHindi ? "व्यक्तिगत विवरण" : "Personal Details" },
    { num: 2, label: isHindi ? "बार काउंसिल साख" : "Bar Council" },
    { num: 3, label: isHindi ? "अभ्यास व अदालतें" : "Practice & Courts" },
    { num: 4, label: isHindi ? "शिक्षा" : "Education" },
    { num: 5, label: isHindi ? "प्रमाणन" : "Qualifications" },
    { num: 6, label: isHindi ? "दस्तावेज़ वॉल्ट" : "Document Vault" },
    { num: 7, label: isHindi ? "समीक्षा व प्रकाशन" : "Review & Consent" },
  ];

  return (
    <div className="space-y-8">
      {/* SECTION HEADER: Complete your profile */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#205C43] font-bold">
              {isHindi ? "अधिवक्ता प्रोफ़ाइल पूर्णता" : "Advocate Onboarding & Verification"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#202824]">
              {isHindi ? "अपनी प्रोफ़ाइल पूरी करें" : "Complete your profile"}
            </h1>
            <p className="text-xs sm:text-sm text-[#69736D] max-w-2xl">
              {isHindi
                ? "बार काउंसिल ऑफ इंडिया के नियमों के अनुसार अपनी पहचान, नामांकन, शैक्षणिक पृष्ठभूमि व प्रमाणित दस्तावेज़ दर्ज करें।"
                : "Complete your professional advocate credentials, Bar Council enrollment, academic history, and uploaded certificates to appear on the verified client directory."}
            </p>
          </div>

          {/* Completeness Badge */}
          <div className="p-4 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] text-center min-w-[140px] shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#69736D] block font-semibold">
              {isHindi ? "पूर्णता प्रतिशत" : "Profile Completeness"}
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-serif text-[#205C43]">
              {completeness.percentage}%
            </span>
            <span className="text-[10px] font-mono text-[#4A544F] block mt-0.5">
              {completeness.percentage >= 70 ? "Eligible for Review" : "Incomplete Details"}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-2.5 bg-[#EAF3ED] rounded-full overflow-hidden border border-[#D5E5D9]">
            <motion.div
              className="h-full bg-[#205C43] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completeness.percentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Section Indicators */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="text-[#69736D] font-mono mr-1">Sections:</span>
            <span
              className={`px-2 py-0.5 rounded font-mono text-[10px] flex items-center gap-1 font-semibold ${
                completeness.sections.personal
                  ? "bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9]"
                  : "bg-amber-50 text-amber-900 border border-amber-200"
              }`}
            >
              {completeness.sections.personal ? <Check className="w-3 h-3" /> : "•"} Personal
            </span>
            <span
              className={`px-2 py-0.5 rounded font-mono text-[10px] flex items-center gap-1 font-semibold ${
                completeness.sections.bar_council
                  ? "bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9]"
                  : "bg-amber-50 text-amber-900 border border-amber-200"
              }`}
            >
              {completeness.sections.bar_council ? <Check className="w-3 h-3" /> : "•"} Bar Council
            </span>
            <span
              className={`px-2 py-0.5 rounded font-mono text-[10px] flex items-center gap-1 font-semibold ${
                completeness.sections.practice
                  ? "bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9]"
                  : "bg-amber-50 text-amber-900 border border-amber-200"
              }`}
            >
              {completeness.sections.practice ? <Check className="w-3 h-3" /> : "•"} Practice & Courts
            </span>
            <span
              className={`px-2 py-0.5 rounded font-mono text-[10px] flex items-center gap-1 font-semibold ${
                completeness.sections.education
                  ? "bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9]"
                  : "bg-amber-50 text-amber-900 border border-amber-200"
              }`}
            >
              {completeness.sections.education ? <Check className="w-3 h-3" /> : "•"} Education
            </span>
            <span
              className={`px-2 py-0.5 rounded font-mono text-[10px] flex items-center gap-1 font-semibold ${
                completeness.sections.documents
                  ? "bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9]"
                  : "bg-amber-50 text-amber-900 border border-amber-200"
              }`}
            >
              {completeness.sections.documents ? <Check className="w-3 h-3" /> : "•"} Credentials Vault
            </span>
          </div>

          {/* Missing Fields Banner if any */}
          {completeness.missing_fields.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between gap-3 mt-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Missing items for 100% completion:</strong>{" "}
                  {completeness.missing_fields.map((f) => f.replace(/_/g, " ")).join(", ")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!completeness.sections.education) setActiveStep(4);
                  else if (!completeness.sections.documents) setActiveStep(6);
                  else if (!completeness.sections.practice) setActiveStep(3);
                }}
                className="text-[11px] font-semibold text-[#205C43] hover:underline shrink-0"
              >
                Complete next section &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Global Action Feedback Alert */}
        {statusFeedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              statusFeedback.type === "success"
                ? "bg-[#EAF3ED] border border-[#D5E5D9] text-[#174530]"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {statusFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-[#205C43]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-700" />
            )}
            <span>{statusFeedback.text}</span>
          </div>
        )}

        {/* Multi-step Nav Tabs */}
        <div className="flex overflow-x-auto gap-2 pt-2 border-t border-[#D5E5D9] no-scrollbar">
          {STEPS.map((step) => (
            <button
              key={step.num}
              type="button"
              onClick={() => setActiveStep(step.num)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeStep === step.num
                  ? "bg-[#205C43] text-white shadow-xs"
                  : "bg-[#F8FAF9] text-[#4A544F] hover:bg-[#EAF3ED] border border-[#D5E5D9]"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-mono">
                {step.num}
              </span>
              <span>{step.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: Personal Details */}
      {activeStep === 1 && (
        <motion.div
          key="step-1"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-serif font-bold text-[#202824]">
              Personal & Professional Contact Information
            </h2>
            <p className="text-xs text-[#69736D]">
              Ensure your professional name reflects your legal credentials as registered with the Bar Council.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-[#202824] block">
                Full Professional Name (with prefix) *
              </label>
              <input
                type="text"
                required
                value={professionalName}
                onChange={(e) => setProfessionalName(e.target.value)}
                placeholder="Adv. Rajesh Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] text-xs focus:ring-2 focus:ring-[#205C43] outline-none bg-white text-[#202824] placeholder:text-[#9AA39E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#202824] block">
                Primary Mobile / Chamber Phone *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] text-xs focus:ring-2 focus:ring-[#205C43] outline-none bg-white text-[#202824] placeholder:text-[#9AA39E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#202824] block">
                Primary City / District Jurisdiction *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="New Delhi, Mumbai, Bengaluru"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] text-xs focus:ring-2 focus:ring-[#205C43] outline-none bg-white text-[#202824] placeholder:text-[#9AA39E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#202824] block">
                State / Union Territory *
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Delhi, Maharashtra, Karnataka"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] text-xs focus:ring-2 focus:ring-[#205C43] outline-none bg-white text-[#202824] placeholder:text-[#9AA39E]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-[#202824] block">
                Chamber / Office Address (Optional)
              </label>
              <input
                type="text"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                placeholder="Chamber No., Lawyers Block, High Court / District Court Complex"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] text-xs focus:ring-2 focus:ring-[#205C43] outline-none bg-white text-[#202824] placeholder:text-[#9AA39E]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#D5E5D9] flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleSaveGeneralDetails(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#EAF3ED] text-xs font-semibold text-[#202824] border border-[#D5E5D9] transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-[#205C43]" />
              Save Progress
            </button>
            <button
              type="button"
              onClick={async () => {
                const ok = await handleSaveGeneralDetails(false);
                if (ok) setActiveStep(2);
              }}
              className="px-5 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              Next: Bar Council &rarr;
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: Bar Council Details */}
      {activeStep === 2 && (
        <motion.div
          key="step-2"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-serif font-bold text-[#202824]">
              Bar Council of India Enrollment Information
            </h2>
            <p className="text-xs text-[#69736D]">
              Required for statutory compliance. Enrollment details are kept isolated and reviewed by registry officers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-[#202824] block">
                State Bar Council of Enrollment *
              </label>
              <select
                value={barCouncilState}
                onChange={(e) => setBarCouncilState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] text-xs focus:ring-2 focus:ring-[#205C43] outline-none bg-white text-[#202824]"
              >
                {STATE_BAR_COUNCILS.map((council) => (
                  <option key={council} value={council}>
                    {council}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#202824] block">
                Bar Council Enrollment Number *
              </label>
              <input
                type="text"
                required
                value={barCouncilNumber}
                onChange={(e) => setBarCouncilNumber(e.target.value.toUpperCase())}
                placeholder="e.g. D/1429/2016 or MAH/3021/2018"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] text-xs font-mono uppercase focus:ring-2 focus:ring-[#205C43] outline-none bg-white text-[#202824] placeholder:text-[#9AA39E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#202824] block">
                Year of Bar Enrollment *
              </label>
              <input
                type="number"
                required
                min={1950}
                max={2026}
                value={enrollmentYear}
                onChange={(e) => setEnrollmentYear(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] text-xs font-mono focus:ring-2 focus:ring-[#205C43] outline-none bg-white text-[#202824] placeholder:text-[#9AA39E]"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#EAF3ED]/60 border border-[#D5E5D9] text-xs text-[#174530] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
            <div>
              <strong>Rule 36 Safeguard:</strong> Enrollment numbers are verified against official Bar Council rolls.
              They are not exposed directly to search engine crawlers without consent.
            </div>
          </div>

          <div className="pt-4 border-t border-[#D5E5D9] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#EAF3ED] text-xs font-semibold text-[#202824] border border-[#D5E5D9] transition-colors flex items-center gap-1.5"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={async () => {
                const ok = await handleSaveGeneralDetails(false);
                if (ok) setActiveStep(3);
              }}
              className="px-5 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              Next: Practice & Courts &rarr;
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: Practice, Courts & Fees */}
      {activeStep === 3 && (
        <motion.div
          key="step-3"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-serif font-bold text-[#202824]">
              Legal Practice Areas, Courts & Consultation
            </h2>
            <p className="text-xs text-[#69736D]">
              Select specializations and courts so clients can discover you for relevant matters.
            </p>
          </div>

          {/* Practice Areas */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#202824] block">
              Areas of Legal Practice * (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_PRACTICE_AREAS.map((area) => {
                const selected = practiceAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => togglePracticeArea(area)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selected
                        ? "bg-[#205C43] text-white shadow-xs"
                        : "bg-[#F8FAF9] text-[#4A544F] hover:bg-[#EAF3ED] border border-[#D5E5D9]"
                    }`}
                  >
                    {selected ? "✓ " : "+ "}
                    {area}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Courts of practice */}
          <div className="space-y-2 pt-3 border-t border-[#D5E5D9]">
            <label className="text-xs font-semibold text-[#202824] block">
              Courts & Tribunals Where You Regularly Practise
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_COURTS.map((court) => {
                const selected = courts.includes(court);
                return (
                  <button
                    key={court}
                    type="button"
                    onClick={() => toggleCourt(court)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      selected
                        ? "bg-[#174530] text-white shadow-xs"
                        : "bg-[#F8FAF9] text-[#4A544F] hover:bg-[#EAF3ED] border border-[#D5E5D9]"
                    }`}
                  >
                    {selected ? "✓ " : "+ "}
                    {court}
                  </button>
                );
              })}
            </div>

            {/* Custom court addition */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={customCourtInput}
                onChange={(e) => setCustomCourtInput(e.target.value)}
                placeholder="Add other court (e.g. Rohini District Courts)"
                className="px-3 py-1.5 rounded-lg border border-[#D5E5D9] text-xs flex-1 outline-none bg-white text-[#202824] placeholder:text-[#9AA39E]"
              />
              <button
                type="button"
                onClick={handleAddCustomCourt}
                className="px-3 py-1.5 rounded-lg bg-[#EAF3ED] text-xs font-semibold text-[#205C43] border border-[#D5E5D9]"
              >
                Add Court
              </button>
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-2 pt-3 border-t border-[#D5E5D9]">
            <label className="text-xs font-semibold text-[#202824] block">
              Professional Languages Spoken *
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const selected = languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      selected
                        ? "bg-[#205C43] text-white"
                        : "bg-[#F8FAF9] text-[#4A544F] border border-[#D5E5D9]"
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meta inputs: Experience, Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#D5E5D9]">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#202824] block">
                Years of Standing / Professional Experience *
              </label>
              <input
                type="number"
                min={0}
                max={70}
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] text-xs focus:ring-2 focus:ring-[#205C43] outline-none bg-white text-[#202824] placeholder:text-[#9AA39E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#202824] block">
                Standard Consultation Fee (₹ INR, Optional)
              </label>
              <input
                type="number"
                min={0}
                step={100}
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] text-xs focus:ring-2 focus:ring-[#205C43] outline-none bg-white text-[#202824] placeholder:text-[#9AA39E]"
              />
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-1.5 pt-3 border-t border-[#D5E5D9]">
            <label className="text-xs font-semibold text-[#202824] block">
              Professional Biography & Areas of Expertise
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Outline your background, landmark matters handled, key areas of expertise and practice philosophy..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5D9] text-xs focus:ring-2 focus:ring-[#205C43] outline-none resize-none bg-white text-[#202824] placeholder:text-[#9AA39E]"
            />
          </div>

          <div className="pt-4 border-t border-[#D5E5D9] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#EAF3ED] text-xs font-semibold text-[#202824] border border-[#D5E5D9]"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={async () => {
                const ok = await handleSaveGeneralDetails(false);
                if (ok) setActiveStep(4);
              }}
              className="px-5 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              Next: Education History &rarr;
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 4: Education */}
      {activeStep === 4 && (
        <motion.div
          key="step-4"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-serif font-bold text-[#202824]">
                Academic Background & Degrees
              </h2>
              <p className="text-xs text-[#69736D]">
                Add your law degrees (LL.B., B.A. LL.B., LL.M., Ph.D.) and undergraduate qualifications.
              </p>
            </div>
            {!isAddingEdu && (
              <button
                type="button"
                onClick={() => setIsAddingEdu(true)}
                className="px-3.5 py-2 rounded-xl bg-[#EAF3ED] text-xs font-semibold text-[#205C43] border border-[#D5E5D9] hover:bg-[#D5E5D9] transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Degree
              </button>
            )}
          </div>

          {/* Form to add education */}
          {isAddingEdu && (
            <form onSubmit={handleAddEducation} className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-4">
              <h3 className="text-xs font-bold text-[#202824] uppercase tracking-wider font-mono">
                New Education Entry
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#202824] block mb-1">
                    Degree / Qualification *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDegree}
                    onChange={(e) => setNewDegree(e.target.value)}
                    placeholder="e.g. LL.B. (Hons.), LL.M., B.A. LL.B."
                    className="w-full px-3 py-2 rounded-lg border border-[#D5E5D9] text-xs outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#202824] block mb-1">
                    Institution / University *
                  </label>
                  <input
                    type="text"
                    required
                    value={newInstitution}
                    onChange={(e) => setNewInstitution(e.target.value)}
                    placeholder="e.g. Faculty of Law, University of Delhi"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5E5D9] text-xs outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#202824] block mb-1">
                    Field of Study / Specialization (Optional)
                  </label>
                  <input
                    type="text"
                    value={newField}
                    onChange={(e) => setNewField(e.target.value)}
                    placeholder="e.g. Constitutional Law, Corporate Jurisprudence"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5E5D9] text-xs outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#202824] block mb-1">
                    Year of Graduation *
                  </label>
                  <input
                    type="number"
                    min={1950}
                    max={2035}
                    value={newGradYear}
                    onChange={(e) => setNewGradYear(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5E5D9] text-xs outline-none bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingEdu(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#D5E5D9] text-xs font-medium text-[#69736D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-lg bg-[#205C43] text-xs font-semibold text-white shadow-xs"
                >
                  Save Degree Entry
                </button>
              </div>
            </form>
          )}

          {/* Education Entries List */}
          <div className="space-y-3">
            {educations.length > 0 ? (
              educations.map((edu) => (
                <div
                  key={edu.id}
                  className="p-4 rounded-xl bg-white border border-[#D5E5D9] flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#205C43]" />
                      <h4 className="font-semibold text-xs sm:text-sm text-[#202824]">{edu.degree}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8FAF9] border border-[#D5E5D9]">
                        {edu.graduation_year}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A544F]">{edu.institution}</p>
                    {edu.field_of_study && (
                      <p className="text-[11px] text-[#69736D] italic">Specialization: {edu.field_of_study}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteEdu(edu.id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-center space-y-2">
                <GraduationCap className="w-8 h-8 text-[#69736D] mx-auto" />
                <p className="text-xs text-[#69736D]">
                  No educational credentials added yet. Add at least 1 degree to complete your profile score.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#D5E5D9] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#EAF3ED] text-xs font-semibold text-[#202824] border border-[#D5E5D9]"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(5)}
              className="px-5 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              Next: Professional Certifications &rarr;
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 5: Qualifications */}
      {activeStep === 5 && (
        <motion.div
          key="step-5"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-serif font-bold text-[#202824]">
                Professional Qualifications & Accreditations
              </h2>
              <p className="text-xs text-[#69736D]">
                Capture Advocate-on-Record (AOR), mediator accreditations, arbitration diplomas and specialized training.
              </p>
            </div>
            {!isAddingQual && (
              <button
                type="button"
                onClick={() => setIsAddingQual(true)}
                className="px-3.5 py-2 rounded-xl bg-[#EAF3ED] text-xs font-semibold text-[#205C43] border border-[#D5E5D9] hover:bg-[#D5E5D9] transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Qualification
              </button>
            )}
          </div>

          {/* Add Qualification Form */}
          {isAddingQual && (
            <form onSubmit={handleAddQualification} className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-4">
              <h3 className="text-xs font-bold text-[#202824] uppercase tracking-wider font-mono">
                New Professional Credential
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-[#202824] block mb-1">
                    Qualification / Certification Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newQualTitle}
                    onChange={(e) => setNewQualTitle(e.target.value)}
                    placeholder="e.g. Advocate on Record (AOR) or Certified Arbitrator"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5E5D9] text-xs outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#202824] block mb-1">
                    Issuing Authority / Institution *
                  </label>
                  <input
                    type="text"
                    required
                    value={newQualAuth}
                    onChange={(e) => setNewQualAuth(e.target.value)}
                    placeholder="e.g. Supreme Court of India or IIAM"
                    className="w-full px-3 py-2 rounded-lg border border-[#D5E5D9] text-xs outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#202824] block mb-1">
                    Issue Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newQualDate}
                    onChange={(e) => setNewQualDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5E5D9] text-xs outline-none bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingQual(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#D5E5D9] text-xs font-medium text-[#69736D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-lg bg-[#205C43] text-xs font-semibold text-white shadow-xs"
                >
                  Save Credential
                </button>
              </div>
            </form>
          )}

          {/* List of Qualifications */}
          <div className="space-y-3">
            {qualifications.length > 0 ? (
              qualifications.map((qual) => (
                <div
                  key={qual.id}
                  className="p-4 rounded-xl bg-white border border-[#D5E5D9] flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#205C43]" />
                      <h4 className="font-semibold text-xs sm:text-sm text-[#202824]">{qual.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9] font-semibold">
                        {qual.verification_status === "verified" ? "Verified" : "Self-Declared"}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A544F]">Authority: {qual.issuing_authority}</p>
                    {qual.issue_date && (
                      <p className="text-[11px] font-mono text-[#69736D]">Issued: {qual.issue_date}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteQual(qual.id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-center space-y-2">
                <Award className="w-8 h-8 text-[#69736D] mx-auto" />
                <p className="text-xs text-[#69736D]">
                  No additional certifications added yet. (Optional, adds to verification weight).
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#D5E5D9] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(4)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#EAF3ED] text-xs font-semibold text-[#202824] border border-[#D5E5D9]"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(6)}
              className="px-5 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              Next: Document Vault &rarr;
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 6: Document Vault & Uploads */}
      {activeStep === 6 && (
        <motion.div
          key="step-6"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-serif font-bold text-[#202824]">
              Supporting Documents & Credentials Vault
            </h2>
            <p className="text-xs text-[#69736D]">
              Upload proof of enrollment, law degree certificates, and practice credentials. Documents are kept in encrypted private storage accessible only to you and authorized verifiers.
            </p>
          </div>

          {/* Upload Widget */}
          <div className="p-6 rounded-2xl bg-[#F8FAF9] border-2 border-dashed border-[#D5E5D9] text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43] mx-auto">
              <Upload className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-semibold text-[#202824]">
                Upload Supporting Credential Document
              </h3>
              <p className="text-[11px] text-[#69736D]">
                Supported formats: PDF, PNG, JPEG, WebP (Max file size: 10MB)
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-2">
              <label className="text-[11px] font-mono text-[#69736D] block font-semibold">
                Document Category:
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#D5E5D9] text-xs bg-white text-[#202824]"
              >
                <option value="bar_council_id">State Bar Council ID / Card</option>
                <option value="degree_certificate">LL.B. / Law Degree Certificate</option>
                <option value="certificate_of_practice">Certificate of Practice (COP)</option>
                <option value="other_qualification">Other Professional Credential</option>
              </select>

              <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold shadow-xs transition-colors w-full mt-2">
                <Upload className="w-3.5 h-3.5" />
                <span>Select & Upload File</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploadProgress && (
              <div className="text-xs font-mono text-[#205C43] animate-pulse flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{uploadProgress}</span>
              </div>
            )}
          </div>

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono text-[#202824] uppercase tracking-wider">
              Uploaded Credentials ({documents.length})
            </h3>
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-white border border-[#D5E5D9] flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43] shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-[#202824] truncate max-w-xs sm:max-w-md">
                        {doc.file_name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#69736D] mt-0.5">
                        <span className="capitalize">{doc.document_type.replace(/_/g, " ")}</span>
                        <span>•</span>
                        <span>{(doc.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                        <span>•</span>
                        <span className="text-[#205C43] font-semibold">Private & Encrypted</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewDocument(doc.storage_path)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#EAF3ED] hover:bg-[#D5E5D9] text-xs font-semibold text-[#205C43] transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#69736D] italic">
                No credential documents uploaded yet. Upload your enrollment certificate or ID to reach 100% profile completeness.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-[#D5E5D9] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(5)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#EAF3ED] text-xs font-semibold text-[#202824] border border-[#D5E5D9]"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={() => setActiveStep(7)}
              className="px-5 py-2 rounded-xl bg-[#205C43] hover:bg-[#174530] text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              Next: Review & Submission &rarr;
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 7: Review & Publication Consent */}
      {activeStep === 7 && (
        <motion.div
          key="step-7"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-serif font-bold text-[#202824]">
              Profile Summary & Publication Consent
            </h2>
            <p className="text-xs text-[#69736D]">
              Review your information before submitting. You maintain complete control over directory publication under Bar Council of India Rule 36.
            </p>
          </div>

          {/* Profile Overview Card */}
          <div className="p-5 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-mono text-[10px] uppercase text-[#69736D] block font-semibold">
                  Professional Name:
                </span>
                <span className="font-semibold text-sm text-[#202824]">{professionalName}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-[#69736D] block font-semibold">
                  Bar Enrollment:
                </span>
                <span className="font-semibold text-[#202824]">{barCouncilNumber} ({barCouncilState}, {enrollmentYear})</span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-[#69736D] block font-semibold">
                  Primary Jurisdiction:
                </span>
                <span className="font-medium text-[#202824]">{city}, {state}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-[#69736D] block font-semibold">
                  Standing Experience:
                </span>
                <span className="font-medium text-[#202824]">{experienceYears} Years</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-mono text-[10px] uppercase text-[#69736D] block font-semibold">
                  Specializations:
                </span>
                <span className="font-medium text-[#202824]">{practiceAreas.join(", ")}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-mono text-[10px] uppercase text-[#69736D] block font-semibold">
                  Courts of Practice:
                </span>
                <span className="font-medium text-[#202824]">{courts.join(" • ")}</span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-[#69736D] block font-semibold">
                  Academic History:
                </span>
                <span className="font-medium text-[#202824]">
                  {educations.length > 0 ? `${educations.length} degree(s) recorded` : "No education added"}
                </span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-[#69736D] block font-semibold">
                  Credentials in Vault:
                </span>
                <span className="font-medium text-[#202824]">
                  {documents.length} verified/uploaded document(s)
                </span>
              </div>
            </div>
          </div>

          {/* Publication Consent Toggle */}
          <div className="p-5 rounded-xl bg-[#EAF3ED]/70 border border-[#D5E5D9] space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#205C43]" />
                  <h3 className="font-semibold text-xs sm:text-sm text-[#202824]">
                    Directory Publication Consent (BCI Rule 36)
                  </h3>
                </div>
                <p className="text-xs text-[#4A544F] leading-relaxed max-w-xl">
                  Allow registered NyayLink clients to discover your profile and practice areas for legitimate consultation inquiries. You can revoke this consent at any time from your profile dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPublished ? "bg-[#205C43]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isPublished ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="text-[11px] font-mono text-[#174530] pt-2 border-t border-[#D5E5D9]/70 flex items-center justify-between">
              <span>Current Status: <strong>{isPublished ? "Consent Granted • Discoverable" : "Hidden from Directory"}</strong></span>
              <span>Verification: <strong className="capitalize">{initialData.verification?.status || "Pending"}</strong></span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#D5E5D9] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveStep(6)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#EAF3ED] text-xs font-semibold text-[#202824] border border-[#D5E5D9]"
            >
              &larr; Back
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSaveGeneralDetails(true)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#EAF3ED] text-xs font-semibold text-[#202824] border border-[#D5E5D9] flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5 text-[#205C43]" />
                Save Draft
              </button>
              <Link
                href={onCompleteRedirect}
                onClick={async () => {
                  await handleSaveGeneralDetails(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-xs font-semibold text-white transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span>Save & Return to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
