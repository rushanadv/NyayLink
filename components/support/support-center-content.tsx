"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Mail,
  Trash2,
  Lock,
  Sparkles,
  KeyRound,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  UserX,
} from "lucide-react";
import { submitSupportTicket, SupportTicketInput } from "@/app/actions/support";
import { useLanguage } from "@/lib/i18n/context";

export function SupportCenterContent() {
  const { isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState<"en" | "hi">(isHindi ? "hi" : "en");
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@nyay.live";

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<SupportTicketInput["category"]>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    ticketId?: string;
    message?: string;
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const res = await submitSupportTicket({
        name,
        email,
        category,
        subject,
        message,
        honeypot,
      });

      setSubmissionResult(res);
      if (res.success) {
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      }
    } catch (err: unknown) {
      setSubmissionResult({
        success: false,
        error: err instanceof Error ? err.message : "Failed to send support ticket.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#FFFFFF] text-[#202824] min-h-screen py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="border-b border-[#D5E5D9] pb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3ED] border border-[#205C43]/20 text-[#205C43] text-xs font-mono font-medium">
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>NYAYLINK CITIZEN & ADVOCATE SUPPORT DESK</span>
            </div>

            {/* Language Switcher */}
            <div className="inline-flex p-1 rounded-lg bg-[#F8FAF9] border border-[#D5E5D9] text-xs font-medium">
              <button
                onClick={() => setActiveTab("en")}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === "en"
                    ? "bg-[#205C43] text-white shadow-xs"
                    : "text-[#69736D] hover:text-[#202824]"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setActiveTab("hi")}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === "hi"
                    ? "bg-[#205C43] text-white shadow-xs"
                    : "text-[#69736D] hover:text-[#202824]"
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#202824] font-semibold tracking-tight">
            {activeTab === "en" ? "Support & Contact Center" : "सहायता व संपर्क केंद्र"}
          </h1>

          <p className="text-sm text-[#69736D] max-w-2xl leading-relaxed">
            {activeTab === "en"
              ? "Access troubleshooting guides for login and session issues, find step-by-step instructions for account and document deletion under the DPDP Act 2023, or submit a formal inquiry to our response team."
              : "लॉगिन समस्याओं के समाधान, डीपीडीपी अधिनियम 2023 के अंतर्गत खाता व दस्तावेज़ हटाने के निर्देश, अथवा हमारी सहायता टीम से संपर्क करने के लिए आधिकारिक सहायता केंद्र।"}
          </p>
        </div>

        {/* Official Channels Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
              <Mail className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-serif font-semibold text-[#202824]">
              {activeTab === "en" ? "Official Support Email" : "आधिकारिक ईमेल पता"}
            </h2>
            <p className="text-xs text-[#69736D]">
              {activeTab === "en"
                ? "For privacy requests, credential reviews, and platform inquiries:"
                : "गोपनीयता अनुरोधों, बार सत्यापन व मंच प्रश्नों हेतु:"}
            </p>
            <a
              href={`mailto:${supportEmail}`}
              className="text-xs font-mono text-[#205C43] font-semibold hover:underline block pt-1"
            >
              {supportEmail}
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-serif font-semibold text-[#202824]">
              {activeTab === "en" ? "Expected Response Time" : "अपेक्षित प्रतिक्रिया समय"}
            </h2>
            <p className="text-xs text-[#69736D]">
              {activeTab === "en"
                ? "Standard inquiries: 24 to 48 business hours. Urgent account security alerts: Monitored daily."
                : "सामान्य प्रश्न: 24 से 48 कार्य घंटे। सुरक्षा संबंधी मामले: दैनिक निगरानी।"}
            </p>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#EAF3ED] text-[#205C43] border border-[#D5E5D9] inline-block mt-1">
              {activeTab === "en" ? "Mon – Fri, 9:30 AM – 6:30 PM IST" : "सोम – शुक्र, 9:30 AM – 6:30 PM IST"}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#D5E5D9] flex items-center justify-center text-[#205C43]">
              <UserX className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-serif font-semibold text-[#202824]">
              {activeTab === "en" ? "Self-Service Deletion" : "स्वयं खाता विलोपन"}
            </h2>
            <p className="text-xs text-[#69736D]">
              {activeTab === "en"
                ? "You can delete your own account immediately without waiting for support confirmation."
                : "आप समर्थन टीम की प्रतीक्षा किए बिना स्वयं अपना खाता तुरंत हटा सकते हैं।"}
            </p>
            <Link
              href="/dashboard?tab=profile"
              className="text-xs text-[#205C43] font-semibold hover:underline inline-flex items-center gap-1 pt-1"
            >
              <span>{activeTab === "en" ? "Open Account Settings" : "खाता सेटिंग्स खोलें"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Interactive Self-Help Guides */}
        <div className="space-y-6">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#202824]">
            {activeTab === "en" ? "Common Self-Service & Troubleshooting Guides" : "सामान्य सहायता व समस्या निवारण निर्देश"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Guide 1: Account Deletion */}
            <div id="account-deletion" className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-red-700 font-semibold text-xs font-mono uppercase tracking-wider">
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>{activeTab === "en" ? "Account Deletion Instructions" : "खाता हटाने के निर्देश"}</span>
              </div>
              <h3 className="text-base font-serif font-semibold text-[#202824]">
                {activeTab === "en" ? "How do I permanently delete my NyayLink account?" : "मैं अपना न्यायलिंक खाता स्थायी रूप से कैसे हटाऊं?"}
              </h3>
              <p className="text-xs text-[#69736D] leading-relaxed">
                {activeTab === "en"
                  ? "Under the Digital Personal Data Protection (DPDP) Act, 2023, you can erase your account and associated private data at any time:"
                  : "डीपीडीपी अधिनियम 2023 के तहत आप किसी भी समय अपना खाता और निजी डेटा हटा सकते हैं:"}
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 text-xs text-[#202824]">
                <li>{activeTab === "en" ? "Sign in to your NyayLink account." : "अपने न्यायलिंक खाते में साइन इन करें।"}</li>
                <li>{activeTab === "en" ? "Navigate to the Profile & Account Settings tab." : "प्रोफ़ाइल व खाता सेटिंग्स टैब पर जाएं।"}</li>
                <li>{activeTab === "en" ? "Scroll down to the 'Danger Zone: Delete Account' section." : "नीचे 'डेंजर ज़ोन: खाता हटाएं' सेक्शन पर स्क्रॉल करें।"}</li>
                <li>{activeTab === "en" ? "Enter your current account password to re-authenticate." : "पुनः प्रमाणीकरण हेतु अपना खाता पासवर्ड दर्ज करें।"}</li>
                <li>{activeTab === "en" ? "Type 'DELETE MY NYAYLINK ACCOUNT' to confirm." : "पुष्टि हेतु 'DELETE MY NYAYLINK ACCOUNT' टाइप करें।"}</li>
                <li>{activeTab === "en" ? "Click 'Permanently Delete Account' to purge your records." : "डेटा मिटाने हेतु 'स्थायी रूप से खाता हटाएं' पर क्लिक करें।"}</li>
              </ol>
            </div>

            {/* Guide 2: Document Vault Deletion */}
            <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#205C43] font-semibold text-xs font-mono uppercase tracking-wider">
                <Lock className="w-4 h-4 text-[#205C43]" />
                <span>{activeTab === "en" ? "Vault Document Controls" : "वॉल्ट दस्तावेज़ प्रबंधन"}</span>
              </div>
              <h3 className="text-base font-serif font-semibold text-[#202824]">
                {activeTab === "en" ? "How do I remove or replace uploaded case documents?" : "मैं वॉल्ट में अपलोड की गई फ़ाइलें कैसे हटाऊं?"}
              </h3>
              <p className="text-xs text-[#69736D] leading-relaxed">
                {activeTab === "en"
                  ? "Your Confidential Case Vault in the Client Workspace allows full management of evidentiary files:"
                  : "मुवक्किल पोर्टल में आपका गोपनीय केस वॉल्ट फाइलों के पूर्ण प्रबंधन की अनुमति देता है:"}
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-[#202824]">
                <li>{activeTab === "en" ? "To delete: Open Documents tab, click the Trash icon next to any document, review the deletion confirmation, and confirm." : "हटाने हेतु: दस्तावेज़ टैब खोलें, ट्रैश आइकन पर क्लिक करें और पुष्टि करें।"}</li>
                <li>{activeTab === "en" ? "Storage files are removed from Supabase Storage and metadata is purged." : "फ़ाइल सुपाबेस स्टोरेज से तुरंत नष्ट कर दी जाती है।"}</li>
                <li>{activeTab === "en" ? "Shared matters: If a document has already been submitted to assigned counsel for active court hearings, ongoing matter preservation policies apply." : "यदि दस्तावेज़ अदालत में लंबित केस हेतु अधिवक्ता को सौंपा जा चुका है, तो विधिक संरक्षण नियम लागू होते हैं।"}</li>
              </ul>
            </div>

            {/* Guide 3: Login & Email Confirmation */}
            <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#205C43] font-semibold text-xs font-mono uppercase tracking-wider">
                <KeyRound className="w-4 h-4 text-[#205C43]" />
                <span>{activeTab === "en" ? "Login & Password Issues" : "लॉगिन व पासवर्ड सहायता"}</span>
              </div>
              <h3 className="text-base font-serif font-semibold text-[#202824]">
                {activeTab === "en" ? "Trouble signing in or receiving confirmation email?" : "लॉगिन अथवा सत्यापन ईमेल प्राप्त करने में कठिनाई?"}
              </h3>
              <p className="text-xs text-[#69736D] leading-relaxed">
                {activeTab === "en"
                  ? "If your email is unconfirmed, check your spam or promotional folder for an email from Supabase Auth. You can request a fresh confirmation link on the login page."
                  : "यदि आपका ईमेल असत्यापित है, तो स्पैम फ़ोल्डर की जांच करें। आप लॉगिन पृष्ठ से नया सत्यापन लिंक पुनः मांग सकते हैं।"}
              </p>
              <div className="pt-2">
                <Link
                  href="/auth/login"
                  className="text-xs text-[#205C43] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>{activeTab === "en" ? "Go to Sign In Page" : "साइन इन पृष्ठ पर जाएं"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Guide 4: AI Preconsultation Troubleshooting */}
            <div id="ai-preconsultation" className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#205C43] font-semibold text-xs font-mono uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#205C43]" />
                <span>{activeTab === "en" ? "AI Preconsultation Assistance" : "एआई पूर्व-परामर्श सहायता"}</span>
              </div>
              <h3 className="text-base font-serif font-semibold text-[#202824]">
                {activeTab === "en" ? "Voice input or assistant response troubleshooting" : "वॉयस इनपुट अथवा एआई उत्तर संबंधी सहायता"}
              </h3>
              <p className="text-xs text-[#69736D] leading-relaxed">
                {activeTab === "en"
                  ? "Voice input uses browser-provided speech recognition. Ensure your browser microphone permissions are enabled for https://nyay.live. The AI triage is rate-limited to 15 queries per minute per user to guarantee service availability."
                  : "वॉयस इनपुट हेतु ब्राउज़र माइक्रोफ़ोन अनुमति सक्षम करें। सेवा की उपलब्धता बनाए रखने के लिए एआई प्रति मिनट 15 प्रश्नों तक सीमित है।"}
              </p>
              <div className="pt-2">
                <Link
                  href="/intake"
                  className="text-xs text-[#205C43] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>{activeTab === "en" ? "Open AI Preconsultation" : "एआई पूर्व-परामर्श खोलें"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Formal Support / Contact Form */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-6">
          <div className="space-y-2">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#202824]">
              {activeTab === "en" ? "Submit a Support Inquiry or Grievance" : "सहायता अथवा शिकायत अनुरोध प्रस्तुत करें"}
            </h2>
            <p className="text-xs text-[#69736D] leading-relaxed">
              {activeTab === "en"
                ? "Fill out the verified inquiry form below. For privacy and security, do NOT submit confidential court pleadings or private case files through this contact form."
                : "नीचे दिया गया सहायता फ़ॉर्म भरें। गोपनीयता और सुरक्षा के लिए, इस फ़ॉर्म के माध्यम से निजी अदालती दस्तावेज़ न भेजें।"}
            </p>
          </div>

          {submissionResult?.success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-1 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {activeTab === "en" ? "Support Ticket Accepted" : "सहायता टिकट सफलतापूर्वक दर्ज हुआ"}
                </span>
              </div>
              <p>{submissionResult.message}</p>
              <p className="font-mono text-[11px] text-emerald-700 font-semibold pt-1">
                Reference ID: {submissionResult.ticketId}
              </p>
            </div>
          )}

          {submissionResult?.error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{submissionResult.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot field (hidden from real users) */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                  {activeTab === "en" ? "Your Name" : "आपका नाम"} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  placeholder={activeTab === "en" ? "Full Name" : "पूरा नाम"}
                  className="w-full h-10 px-3.5 rounded-xl border border-[#D5E5D9] bg-white text-xs text-[#202824] focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                  {activeTab === "en" ? "Email Address" : "ईमेल पता"} *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="name@example.com"
                  className="w-full h-10 px-3.5 rounded-xl border border-[#D5E5D9] bg-white text-xs text-[#202824] focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                  {activeTab === "en" ? "Inquiry Category" : "अनुरोध श्रेणी"}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportTicketInput["category"])}
                  disabled={isSubmitting}
                  className="w-full h-10 px-3 rounded-xl border border-[#D5E5D9] bg-white text-xs text-[#202824] focus:outline-none focus:border-[#205C43]"
                >
                  <option value="general">{activeTab === "en" ? "General Inquiry" : "सामान्य प्रश्न"}</option>
                  <option value="account_deletion">{activeTab === "en" ? "Account & Data Deletion" : "खाता व डेटा विलोपन"}</option>
                  <option value="login_issue">{activeTab === "en" ? "Login / Authentication Problem" : "लॉगिन / प्रमाणीकरण समस्या"}</option>
                  <option value="ai_preconsultation">{activeTab === "en" ? "AI Preconsultation Issue" : "एआई पूर्व-परामर्श समस्या"}</option>
                  <option value="advocate_verification">{activeTab === "en" ? "Advocate Verification & Bar Rolls" : "अधिवक्ता सत्यापन व बार रोल्स"}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                  {activeTab === "en" ? "Subject" : "विषय"} *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isSubmitting}
                  placeholder={activeTab === "en" ? "Brief summary of the issue" : "मुद्दे का संक्षिप्त विवरण"}
                  className="w-full h-10 px-3.5 rounded-xl border border-[#D5E5D9] bg-white text-xs text-[#202824] focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase text-[#202824]">
                {activeTab === "en" ? "Message" : "संदेश"} *
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                placeholder={activeTab === "en" ? "Please describe your question or issue in detail..." : "कृपया अपने प्रश्न का विस्तार से विवरण दें..."}
                className="w-full p-3.5 rounded-xl border border-[#D5E5D9] bg-white text-xs text-[#202824] focus:outline-none focus:border-[#205C43] focus:ring-2 focus:ring-[#205C43]/15"
              />
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-4">
              <span className="text-[11px] text-[#69736D]">
                {activeTab === "en"
                  ? "We will never ask for your account password or payment details."
                  : "हम आपका खाता पासवर्ड या वित्तीय विवरण कभी नहीं मांगते।"}
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? (activeTab === "en" ? "Submitting..." : "भेजा जा रहा है...") : (activeTab === "en" ? "Send Inquiry" : "संदेश भेजें")}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
