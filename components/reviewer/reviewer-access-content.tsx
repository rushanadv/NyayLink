"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import {
  ShieldCheck,
  User,
  Briefcase,
  Sparkles,
  FolderLock,
  Calendar,
  Search,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  FileText,
  Lock,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

export function ReviewerAccessContent() {
  const router = useRouter();
  const { isHindi } = useLanguage();
  const [loadingRole, setLoadingRole] = useState<"client" | "lawyer" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLaunchWorkspace = async (role: "client" | "lawyer") => {
    setLoadingRole(role);
    setError(null);
    try {
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to authenticate reviewer session.");
      }

      router.push(data.redirectUrl || (role === "lawyer" ? "/lawyer/dashboard" : "/dashboard"));
      router.refresh();
    } catch (err: unknown) {
      console.error("[Reviewer Login Error]:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Reviewer authentication encountered an error. Please ensure ENABLE_DEMO_LOGIN is enabled."
      );
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFEFC] text-[#202824] pt-24 pb-20 selection:bg-[#205C43] selection:text-white">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#EAF3ED]/60 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] bg-[#205C43]/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-[#69736D]">
            <Link href="/" className="hover:text-[#205C43] transition-colors">
              {isHindi ? "होम" : "Home"}
            </Link>
            <span>/</span>
            <span className="text-[#205C43] font-semibold">
              {isHindi ? "ऐप स्टोर समीक्षक गेटवे" : "App Store Reviewer Gateway"}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#205C43]" />
            <span>{isHindi ? "सैंडबॉक्स आइसोलेशन सक्रिय" : "Isolated Evaluation Sandbox Active"}</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-[#202824] tracking-tight leading-tight mb-4">
            {isHindi
              ? "ऐप्पल ऐप समीक्षा एवं सैंडबॉक्स एक्सेस"
              : "Apple App Store Reviewer Gateway"}
          </h1>
          <p className="text-sm sm:text-base text-[#46514A] leading-relaxed">
            {isHindi
              ? "समीक्षक टीमों के लिए पृथक परीक्षण वर्कस्पेस। वास्तविक नागरिकों या अधिवक्ताओं के गोपनीय डेटा को प्रभावित किए बिना संपूर्ण क्लाइंट एवं अधिवक्ता सुविधाओं का परीक्षण करें।"
              : "Isolated test workspaces configured specifically for Apple App Store evaluation. Inspect complete client and advocate workflows safely without touching real citizen data or live advocate accounts."}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{isHindi ? "लॉगिन त्रुटि" : "Reviewer Login Issue"}</p>
              <p className="text-xs mt-0.5 text-rose-700">{error}</p>
            </div>
          </div>
        )}

        {/* Workspace Launchers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Client Role Workspace */}
          <div className="bg-white rounded-2xl border-2 border-[#D5E5D9] hover:border-[#205C43] transition-all p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9]">
                  <User className="w-3.5 h-3.5" />
                  {isHindi ? "भूमिका: क्लाइंट" : "Role: Citizen / Client"}
                </span>
                <span className="text-xs font-mono text-[#69736D]">demo.client@nyay.live</span>
              </div>

              <h2 className="text-2xl font-serif font-medium text-[#202824] mb-3">
                {isHindi ? "क्लाइंट परीक्षण वर्कस्पेस" : "Demo Client Workspace"}
              </h2>
              <p className="text-xs sm:text-sm text-[#46514A] leading-relaxed mb-6">
                {isHindi
                  ? "नागरिक पोर्टल का मूल्यांकन: एआई पूर्व-परामर्श, अधिवक्ता खोज, केस ट्रैकिंग, कानूनी दस्तावेज़ वॉल्ट और खाता विलोपन।"
                  : "Evaluate the complete citizen portal: AI Preconsultation, advocate directory search, legal matters docket, private document vault with SHA-256 verification, and self-service account deletion."}
              </p>

              <div className="space-y-3 mb-8 text-xs text-[#46514A]">
                <div className="font-semibold text-[#202824] uppercase tracking-wider text-[11px]">
                  {isHindi ? "उपलब्ध परीक्षण सुविधाएं:" : "Features Ready For Evaluation:"}
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                  <span>
                    <strong>AI Preconsultation:</strong> Structured informational triage with statutory disclaimer and voluntary sharing controls.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Search className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                  <span>
                    <strong>Advocate Registry:</strong> Practice area filtering, city/court search, and Rule 36 verified credentials inspection.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <FolderLock className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                  <span>
                    <strong>Document Vault:</strong> Private upload, cryptographic SHA-256 verification, document replacement, and server-side deletion.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                  <span>
                    <strong>Account Deletion:</strong> End-to-end self-service account deletion under the DPDP Act 2023 with password reauthentication.
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchWorkspace("client")}
              disabled={loadingRole !== null}
              className="w-full py-3.5 px-4 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loadingRole === "client" ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isHindi ? "सत्र प्रारंभ हो रहा है..." : "Initializing Session..."}</span>
                </>
              ) : (
                <>
                  <span>{isHindi ? "क्लाइंट वर्कस्पेस खोलें" : "Launch Client Workspace"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Advocate Role Workspace */}
          <div className="bg-white rounded-2xl border-2 border-[#D5E5D9] hover:border-[#205C43] transition-all p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9]">
                  <Briefcase className="w-3.5 h-3.5" />
                  {isHindi ? "भूमिका: अधिवक्ता" : "Role: Enrolled Advocate"}
                </span>
                <span className="text-xs font-mono text-[#69736D]">demo.lawyer@nyay.live</span>
              </div>

              <h2 className="text-2xl font-serif font-medium text-[#202824] mb-3">
                {isHindi ? "अधिवक्ता परीक्षण वर्कस्पेस" : "Demo Advocate Workspace"}
              </h2>
              <p className="text-xs sm:text-sm text-[#46514A] leading-relaxed mb-6">
                {isHindi
                  ? "अधिवक्ता पोर्टल का मूल्यांकन: बार काउंसिल सत्यापन प्रोफ़ाइल, परामर्श अनुरोध, कॉज लिस्ट व कानूनी कैलेंडर, और क्लाइंट मामले।"
                  : "Evaluate the legal practitioner portal: State Bar Council verification status, consultation booking management, cause-list court calendar, and client matter records."}
              </p>

              <div className="space-y-3 mb-8 text-xs text-[#46514A]">
                <div className="font-semibold text-[#202824] uppercase tracking-wider text-[11px]">
                  {isHindi ? "उपलब्ध परीक्षण सुविधाएं:" : "Features Ready For Evaluation:"}
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                  <span>
                    <strong>Bar Council Profile:</strong> Enrolled status, practice jurisdiction (High Court, District Courts), and academic credentials.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                  <span>
                    <strong>Court Calendar & Cause List:</strong> Demonstrative hearing dates, judicial forum logs, and limitation deadline reminders.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Layers className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                  <span>
                    <strong>Matters & Consultations:</strong> Client inquiries, appointment acceptance, and staged transparent milestone terms.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
                  <span>
                    <strong>Advocate Account Controls:</strong> Professional settings, Rule 36 directory publication consent toggle, and profile deletion.
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleLaunchWorkspace("lawyer")}
              disabled={loadingRole !== null}
              className="w-full py-3.5 px-4 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loadingRole === "lawyer" ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isHindi ? "सत्र प्रारंभ हो रहा है..." : "Initializing Session..."}</span>
                </>
              ) : (
                <>
                  <span>{isHindi ? "अधिवक्ता वर्कस्पेस खोलें" : "Launch Advocate Workspace"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feature Transparency Matrix */}
        <div className="bg-white rounded-2xl border border-[#D5E5D9] p-6 sm:p-8 mb-12 shadow-xs">
          <h3 className="text-xl font-serif font-medium text-[#202824] mb-2 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#205C43]" />
            {isHindi ? "सुविधा पारदर्शिता मैट्रिक्स (समीक्षक गाइड)" : "App Reviewer Evaluation Matrix"}
          </h3>
          <p className="text-xs sm:text-sm text-[#46514A] leading-relaxed mb-6">
            {isHindi
              ? "यह तालिका स्पष्ट करती है कि समीक्षा के दौरान कौन से घटक पूर्णतः क्रियाशील हैं, कौन से नमूना डेटा पर आधारित हैं, और किनके लिए बाहरी सरकारी क्रेडेंशियल आवश्यक हैं।"
              : "This matrix clarifies which capabilities are fully operational, which operate on synthetic fixtures, and which require external statutory authorizations."}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D5E5D9] bg-[#EAF3ED]/50 text-[#202824]">
                  <th className="py-3 px-4 font-semibold">{isHindi ? "प्रणाली घटक" : "System Component"}</th>
                  <th className="py-3 px-4 font-semibold">{isHindi ? "स्थिति" : "Evaluation Status"}</th>
                  <th className="py-3 px-4 font-semibold">{isHindi ? "विवरण व सुरक्षा सीमा" : "Technical Boundary & Safeguard"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5E5D9] text-[#46514A]">
                <tr>
                  <td className="py-3.5 px-4 font-medium text-[#202824]">
                    AI Preconsultation (एआई पूर्व-परामर्श)
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Live Operational
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    Dynamic Indian law legal reasoning prompt with statutory disclaimers. Does not hallucinate court records or replace formal legal counsel.
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-[#202824]">
                    Legal Document Vault & Deletion
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Live Operational
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    SHA-256 client/server hashing, secure Supabase storage prefix per user, replace document workflow, and verified server-side deletion.
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-[#202824]">
                    Self-Service Account Deletion
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Live Operational
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    Server action with password reauthentication, explicit phrase confirmation, storage cleanup, foreign-key handling, and DPDP compliance.
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-[#202824]">
                    Court Docket & Calendar Schedule
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Synthetic Fixtures
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    Populated with demonstrative cause-list dates and mock case titles. Live real-time automated e-Courts push feeds require court registry CIS token configuration.
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-[#202824]">
                    Digital Vakalatnama Drafting
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Document Generation
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    Generates Section 30 compliant engagement drafts. Full Aadhaar OTP eSign binding requires licensed CCA / UIDAI eSign ASP integration.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Login Information for App Store Review */}
        <div className="bg-[#EAF3ED]/60 rounded-2xl border border-[#D5E5D9] p-6 sm:p-8 mb-12">
          <div className="flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-[#205C43] shrink-0 mt-0.5" />
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-[#202824]">
                {isHindi ? "वैकल्पिक मैन्युअल लॉगिन जानकारी" : "Manual Sign-In Credentials (For App Review Notes)"}
              </h4>
              <p className="text-xs sm:text-sm text-[#46514A] leading-relaxed">
                {isHindi
                  ? "यदि आप मानक लॉगिन स्क्रीन (/auth/login) के माध्यम से प्रवेश करना चाहते हैं, तो आप निम्नलिखित क्रेडेंशियल का उपयोग कर सकते हैं:"
                  : "If Apple App Review prefers signing in manually through the standard sign-in form (/auth/login), use the credentials submitted in App Store Connect:"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-white p-4 rounded-xl border border-[#D5E5D9]">
                <div>
                  <div className="text-[#69736D] text-[11px] uppercase tracking-wider mb-1">
                    Client Demo Account
                  </div>
                  <div className="text-[#202824] font-semibold">demo.client@nyay.live</div>
                  <div className="text-[#69736D] text-[11px] mt-1">Role: Citizen / Client Portal</div>
                </div>
                <div>
                  <div className="text-[#69736D] text-[11px] uppercase tracking-wider mb-1">
                    Advocate Demo Account
                  </div>
                  <div className="text-[#202824] font-semibold">demo.lawyer@nyay.live</div>
                  <div className="text-[#69736D] text-[11px] mt-1">Role: Enrolled Legal Counsel</div>
                </div>
              </div>
              <p className="text-[11px] text-[#69736D]">
                Passwords for demo accounts are provisioned securely via server environment variables (DEMO_CLIENT_PASSWORD / DEMO_LAWYER_PASSWORD) and submitted in private App Store review notes.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Support Notice */}
        <div className="text-center text-xs text-[#69736D] space-y-2">
          <p>
            {isHindi
              ? "समीक्षा के दौरान किसी भी प्रश्न या सहायता के लिए हमारी सहायता टीम से संपर्क करें:"
              : "For immediate technical support or questions during the App Store review process:"}
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold text-[#205C43]">
            <Link href="/support" className="hover:underline flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              {isHindi ? "सहायता केंद्र" : "Support Center"}
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:underline flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {isHindi ? "गोपनीयता नीति" : "Privacy Policy"}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {isHindi ? "सेवा की शर्तें" : "Terms of Service"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
