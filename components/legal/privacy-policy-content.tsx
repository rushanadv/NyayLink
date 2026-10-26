"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mic,
  Mail,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function PrivacyPolicyContent() {
  const { isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState<"en" | "hi">(isHindi ? "hi" : "en");
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@nyay.live";

  return (
    <div className="w-full bg-[#FFFFFF] text-[#202824] min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Document Header */}
        <div className="border-b border-[#D5E5D9] pb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3ED] border border-[#205C43]/20 text-[#205C43] text-xs font-mono font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DPDP ACT, 2023 COMPLIANT PRIVACY CHARTER</span>
            </div>

            {/* Language Switcher for Document */}
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
            {activeTab === "en" ? "NyayLink Privacy Policy" : "न्यायलिंक गोपनीयता नीति"}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#69736D] font-mono">
            <span>
              {activeTab === "en" ? "Effective Date: October 26, 2026" : "प्रभावी तिथि: 26 अक्टूबर 2026"}
            </span>
            <span>•</span>
            <span>Version 1.0 (DPDP & Advocates Act Aligned)</span>
            <span>•</span>
            <span className="text-[#205C43] font-semibold">Production Release</span>
          </div>

          <p className="text-sm text-[#69736D] leading-relaxed">
            {activeTab === "en"
              ? "This Privacy Policy describes the actual, verified data practices of NyayLink, an Indian legal-technology platform operating at https://nyay.live. It details what data is collected, how it is processed by our verified infrastructure, our AI preconsultation and voice mechanisms, our sub-processors, and how you exercise your statutory rights to access and delete your records under the Digital Personal Data Protection (DPDP) Act, 2023 and the Advocates Act, 1961."
              : "यह गोपनीयता नीति न्यायलिंक (https://nyay.live) की वास्तविक डेटा प्रबंधन पद्धतियों का विवरण देती है। यह स्पष्ट करती है कि डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023 और अधिवक्ता अधिनियम 1961 के तहत कौन-सी जानकारी एकत्र की जाती है, एआई पूर्व-परामर्श और वॉयस इनपुट कैसे काम करते हैं, और आप अपने खाते व फाइलों को कैसे हटा सकते हैं।"}
          </p>
        </div>

        {/* Highlight Summary Card */}
        <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#205C43] uppercase tracking-wider">
            <Lock className="w-4 h-4 text-[#205C43]" />
            <span>{activeTab === "en" ? "Key Architecture Principles" : "मुख्य गोपनीयता सिद्धांत"}</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#202824]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43] shrink-0 mt-0.5" />
              <span>
                {activeTab === "en"
                  ? "User data is protected via PostgreSQL Row-Level Security (RLS) in Supabase."
                  : "उपयोगकर्ता डेटा सुपाबेस में पोस्टग्रेस रो-लेवल सुरक्षा (RLS) द्वारा पृथक रहता है।"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43] shrink-0 mt-0.5" />
              <span>
                {activeTab === "en"
                  ? "Client vault documents are stored in user-isolated private storage buckets."
                  : "मुवक्किल के दस्तावेज़ उपयोगकर्ता-विशिष्ट निजी स्टोरेज बकेट में सुरक्षित रहते हैं।"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43] shrink-0 mt-0.5" />
              <span>
                {activeTab === "en"
                  ? "Full end-to-end account and document deletion directly in user profile settings."
                  : "उपयोगकर्ता प्रोफ़ाइल सेटिंग्स से खाता और निजी दस्तावेज़ हटाने की पूर्ण सुविधा।"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#205C43] shrink-0 mt-0.5" />
              <span>
                {activeTab === "en"
                  ? "Speech recognition is browser-managed; audio is never stored on NyayLink servers."
                  : "वॉयस इनपुट ब्राउज़र-आधारित है; न्यायलिंक सर्वर पर कोई ऑडियो रिकॉर्डिंग नहीं रखी जाती।"}
              </span>
            </li>
          </ul>
        </div>

        {/* Content Body */}
        {activeTab === "en" ? (
          <div className="space-y-10 text-xs sm:text-sm text-[#202824] leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">01.</span> Information We Collect
              </h2>
              <p>
                We collect personal and professional information strictly necessary to provide authentic legal-tech workflows. The categories include:
              </p>
              <div className="space-y-2.5 pl-2">
                <div className="p-3 rounded-xl bg-white border border-[#D5E5D9]">
                  <strong className="block text-xs font-semibold text-[#202824]">A. User Account & Profile Information</strong>
                  <p className="text-xs text-[#69736D] mt-1">
                    When you sign up as a Client or Advocate, we collect your full legal name, email address, mobile phone number, and account role intent. Passwords are cryptographically hashed using industry-standard secure one-way functions managed by Supabase Auth; raw passwords are never seen or stored by NyayLink application code.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D5E5D9]">
                  <strong className="block text-xs font-semibold text-[#202824]">B. Advocate Professional Credentials</strong>
                  <p className="text-xs text-[#69736D] mt-1">
                    For enrolled advocates registering chambers, we collect State Bar Council enrollment numbers (e.g., D/1429/2018), State Bar Council jurisdiction, year of enrollment, verified law degrees (institution, graduation year), courts of regular practice, consultation fee structure, and uploaded proof documents (Bar identity card, degree certificates) stored in private storage.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D5E5D9]">
                  <strong className="block text-xs font-semibold text-[#202824]">C. Case Documents & Evidence Vault</strong>
                  <p className="text-xs text-[#69736D] mt-1">
                    Files uploaded to the Confidential Case Vault (pleadings, contracts, legal notices, evidence annexures, court orders) are stored in an authenticated, isolated private bucket (<code>advocate-credentials/{`{user_id}`}/vault/...</code>). We compute a cryptographic SHA-256 fingerprint for each file to ensure evidentiary integrity under Section 65B of the Indian Evidence Act.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D5E5D9]">
                  <strong className="block text-xs font-semibold text-[#202824]">D. Legal Matters & Consultation Records</strong>
                  <p className="text-xs text-[#69736D] mt-1">
                    Legal inquiries submitted by clients, appointment dates, consultation notes, and chronological matter timeline updates are recorded in PostgreSQL tables with strict Row-Level Security ensuring only the matter client, assigned counsel, and authorized platform administrators can query the records.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">02.</span> AI Preconsultation & Data Retention
              </h2>
              <div className="p-4 rounded-xl bg-[#FFFDF7] border border-[#E8DCC0] space-y-2">
                <div className="flex items-center gap-2 font-semibold text-xs text-[#8F6A15]">
                  <AlertTriangle className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>Important Legal Information Notice</span>
                </div>
                <p className="text-xs text-[#665220] leading-relaxed">
                  NyayLink AI Preconsultation is an automated informational triage tool designed to assist citizens in understanding general Indian statutory provisions (such as BNS, CPC, Consumer Protection, and RERA). It does NOT provide legal advice, does not establish an attorney-client relationship, and cannot guarantee procedural outcomes.
                </p>
              </div>
              <p>
                When interacting with AI Preconsultation:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#69736D]">
                <li>
                  <strong>Chat Messages:</strong> Messages exchanged in an active session are sent securely from your browser via our serverless API route to Groq Inc. cloud inference endpoints using high-parameter open-weights models.
                </li>
                <li>
                  <strong>Session State:</strong> Chat messages reside in your browser session memory. NyayLink does not maintain an unconsented permanent logging database of raw AI chat queries.
                </li>
                <li>
                  <strong>Summaries Export:</strong> A case intake brief is saved to your account only if you explicitly choose to export or attach the summary to a consultation request or matter.
                </li>
                <li>
                  <strong>Sensitive Disclosures:</strong> Citizens are advised not to disclose highly confidential case secrets, Aadhaar numbers, or sensitive financial account details to the AI assistant.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">03.</span> Microphone & Voice Recognition Processing
              </h2>
              <p>
                NyayLink provides an optional voice-input microphone button for vernacular accessibility. We accurately disclose the exact mechanism:
              </p>
              <div className="p-3.5 rounded-xl bg-white border border-[#D5E5D9] space-y-2 text-xs text-[#69736D]">
                <div className="flex items-center gap-2 text-[#205C43] font-semibold font-mono">
                  <Mic className="w-4 h-4" />
                  <span>Browser-Engine Speech Recognition (Web Speech API)</span>
                </div>
                <p>
                  Voice input uses your browser&apos;s native <code>SpeechRecognition</code> or <code>webkitSpeechRecognition</code> API. Depending on your operating system and browser (e.g. Google Chrome, Apple Safari, Microsoft Edge), audio recorded through your microphone may be processed through browser-vendor cloud speech recognition services (such as Google Speech Services or Apple Dictation) to return transcription text.
                </p>
                <p className="font-medium text-[#202824]">
                  NyayLink does not record, ingest, or store raw audio files on its own application servers. Once transcription text is returned to your browser input box, you retain full control to edit or delete the text before submitting.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">04.</span> Infrastructure & Third-Party Sub-Processors
              </h2>
              <p>
                NyayLink engages trusted sub-processors strictly for technical hosting, database storage, and AI inference:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs border border-[#D5E5D9] rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-[#F8FAF9] border-b border-[#D5E5D9] text-[#202824] font-semibold">
                      <th className="p-2.5">Sub-Processor</th>
                      <th className="p-2.5">Purpose</th>
                      <th className="p-2.5">Data Processed</th>
                      <th className="p-2.5">Location / Encryption</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D5E5D9] text-[#69736D]">
                    <tr>
                      <td className="p-2.5 font-medium text-[#202824]">Supabase Inc.</td>
                      <td className="p-2.5">Managed PostgreSQL, Authentication & S3 Storage</td>
                      <td className="p-2.5">User accounts, profile credentials, encrypted files, matter records</td>
                      <td className="p-2.5">Encrypted in transit (TLS 1.3) & at rest (AES-256)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-[#202824]">Vercel Inc.</td>
                      <td className="p-2.5">Next.js Web Application Hosting & Edge Runtime</td>
                      <td className="p-2.5">HTTP request logs, client IP for rate limiting</td>
                      <td className="p-2.5">Serverless compute; zero persistent storage of payloads</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-[#202824]">Groq Inc.</td>
                      <td className="p-2.5">High-Speed AI Preconsultation LLM Inference</td>
                      <td className="p-2.5">Citizen triage prompt text and conversation turns</td>
                      <td className="p-2.5">Zero data retention agreement for API inference</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">05.</span> Data Retention & Account Deletion Controls
              </h2>
              <p>
                In compliance with the DPDP Act, 2023, you maintain complete sovereignty over your personal data:
              </p>
              <div className="space-y-2 text-xs text-[#69736D]">
                <div className="p-3 rounded-xl bg-white border border-[#D5E5D9] space-y-1">
                  <strong className="text-[#202824] block">How to Delete Your Account:</strong>
                  <p>
                    You can delete your account at any time by navigating to your authenticated <strong>Profile & Account Settings</strong> tab and selecting <strong>&quot;Delete My Account&quot;</strong> in the Danger Zone. Deletion requires entering your account password and typing the explicit confirmation phrase.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D5E5D9] space-y-1">
                  <strong className="text-[#202824] block">What Happens Upon Account Deletion:</strong>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Your personal identity, phone number, and profile records in <code>public.profiles</code> are purged or anonymized.</li>
                    <li>Your private Case Vault documents and uploaded credentials stored in Supabase Storage are permanently removed from storage disks.</li>
                    <li>Your tracked court cases, personal reminders, and private calendar entries are deleted.</li>
                    <li>Your authenticated session is immediately terminated.</li>
                    <li>
                      <em>Statutory & Dispute Exception:</em> Where a matter has been formally accepted by an enrolled advocate and represents an active legal proceeding in court, filings and timeline events already on the official court record or shared with assigned counsel are retained in anonymized form to uphold advocate professional compliance under the Advocates Act, 1961.
                    </li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D5E5D9] space-y-1">
                  <strong className="text-[#202824] block">Individual Document Deletion:</strong>
                  <p>
                    In your Case Vault, you can delete individual unshared documents or replace draft pleadings at any time with immediate removal of the underlying storage object.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">06.</span> Privacy Officer & Grievance Contact
              </h2>
              <p>
                For questions regarding this policy, data correction requests, or statutory DPDP Act rights, contact our designated privacy response desk:
              </p>
              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#205C43] font-semibold">
                  <Mail className="w-4 h-4" />
                  <span>NyayLink Privacy & Grievance Officer</span>
                </div>
                <p className="text-[#69736D]">
                  Official Contact Email:{" "}
                  <a href={`mailto:${supportEmail}`} className="text-[#205C43] font-mono font-medium underline">
                    {supportEmail}
                  </a>
                </p>
                <p className="text-[#69736D]">
                  Statutory Grievance Redressal Timeline: We acknowledge inquiries within 48 business hours and process legitimate statutory deletion or correction requests within 30 days under applicable Indian legal standards.
                </p>
                <div className="pt-2">
                  <Link
                    href="/support"
                    className="inline-flex items-center gap-1.5 text-xs text-[#205C43] font-semibold hover:underline"
                  >
                    <span>Visit NyayLink Support Center</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* Hindi Translation Body */
          <div className="space-y-10 text-xs sm:text-sm text-[#202824] leading-relaxed">
            {/* Section 1 Hindi */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">01.</span> एकत्र की जाने वाली जानकारी
              </h2>
              <p>
                हम केवल वही व्यक्तिगत और व्यावसायिक जानकारी एकत्र करते हैं जो प्रामाणिक कानूनी तकनीक सेवाएं प्रदान करने हेतु आवश्यक है:
              </p>
              <div className="space-y-2.5 pl-2">
                <div className="p-3 rounded-xl bg-white border border-[#D5E5D9]">
                  <strong className="block text-xs font-semibold text-[#202824]">क. खाता व प्रोफ़ाइल विवरण</strong>
                  <p className="text-xs text-[#69736D] mt-1">
                    जब आप क्लाइंट या अधिवक्ता के रूप में पंजीकरण करते हैं, तो हम आपका पूरा नाम, ईमेल पता, मोबाइल नंबर और पोर्टल भूमिका एकत्र करते हैं। पासवर्ड सुपाबेस प्रमाणीकरण द्वारा क्रिप्टोग्राफ़िक रूप से सुरक्षित रखे जाते हैं और न्यायलिंक कोड में कभी भी सादे पाठ में संग्रहीत नहीं होते।
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D5E5D9]">
                  <strong className="block text-xs font-semibold text-[#202824]">ख. अधिवक्ता व्यावसायिक साख व प्रमाण</strong>
                  <p className="text-xs text-[#69736D] mt-1">
                    अधिवक्ता पंजीकरण हेतु हम राज्य बार काउंसिल नामांकन संख्या (जैसे D/1429/2018), नामांकन वर्ष, विधि डिग्री व विश्वविद्यालय, नियमित न्यायालय, परामर्श शुल्क और बार पहचान पत्र की प्रतियां एकत्र करते हैं, जो निजी स्टोरेज में सुरक्षित रहती हैं।
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#D5E5D9]">
                  <strong className="block text-xs font-semibold text-[#202824]">ग. केस दस्तावेज़ व गोपनीय वॉल्ट</strong>
                  <p className="text-xs text-[#69736D] mt-1">
                    केस वॉल्ट में अपलोड की गई फाइलें (याचिकाएं, कानूनी नोटिस, साक्ष्य, अदालती आदेश) उपयोगकर्ता-विशिष्ट निजी बकेट में संग्रहीत होती हैं। भारतीय साक्ष्य अधिनियम की धारा 65B के अनुसार दस्तावेज़ अखंडता सुनिश्चित करने के लिए प्रत्येक फ़ाइल का SHA-256 हैश तैयार किया जाता है।
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 Hindi */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">02.</span> एआई पूर्व-परामर्श और डेटा प्रतिधारण
              </h2>
              <div className="p-4 rounded-xl bg-[#FFFDF7] border border-[#E8DCC0] space-y-2">
                <div className="flex items-center gap-2 font-semibold text-xs text-[#8F6A15]">
                  <AlertTriangle className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>महत्वपूर्ण विधिक प्रकटीकरण</span>
                </div>
                <p className="text-xs text-[#665220] leading-relaxed">
                  न्यायलिंक एआई पूर्व-परामर्श नागरिकों को सामान्य भारतीय कानूनों (जैसे बीएनएस, सीपीसी, उपभोक्ता संरक्षण, रेरा) को समझने में सहायता करने हेतु एक स्वचालित सूचनात्मक साधन है। यह कानूनी सलाह का विकल्प नहीं है और न ही वकील-मुवक्किल संबंध स्थापित करता है।
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#69736D]">
                <li>एआई संदेश सत्र समाप्त होने तक ब्राउज़र मेमोरी में रहते हैं और स्थायी रूप से लॉग नहीं किए जाते।</li>
                <li>केस सारांश आपके खाते में केवल तभी सहेजा जाता है जब आप स्वयं इसे ब्रीफ या परामर्श में जोड़ना चुनते हैं।</li>
                <li>उपयोगकर्ताओं को सलाह दी जाती है कि वे अत्यधिक संवेदनशील व्यक्तिगत डेटा, आधार नंबर या बैंक विवरण एआई चैट में साझा न करें।</li>
              </ul>
            </section>

            {/* Section 3 Hindi */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">03.</span> माइक्रोफ़ोन व वॉयस इनपुट प्रणाली
              </h2>
              <p>
                मातृभाषा में सुगमता हेतु वॉयस इनपुट सुविधा ब्राउज़र की <code>SpeechRecognition</code> या <code>webkitSpeechRecognition</code> (Web Speech API) पर आधारित है।
              </p>
              <div className="p-3.5 rounded-xl bg-white border border-[#D5E5D9] space-y-2 text-xs text-[#69736D]">
                <p>
                  ब्राउज़र इंजन के अनुसार ऑडियो को टेक्स्ट में बदलने हेतु आपका ब्राउज़र विक्रेता (जैसे गूगल या एप्पल) के रिमोट सर्वर का उपयोग कर सकता है।
                </p>
                <p className="font-medium text-[#202824]">
                  न्यायलिंक अपने सर्वर पर कोई भी ऑडियो फ़ाइल संग्रहीत नहीं करता है। ट्रांसक्रिप्टेड टेक्स्ट आने के बाद आप उसे अपनी इच्छानुसार संपादित कर सकते हैं।
                </p>
              </div>
            </section>

            {/* Section 4 Hindi */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">04.</span> खाता विलोपन और उपयोगकर्ता अधिकार
              </h2>
              <div className="p-3 rounded-xl bg-white border border-[#D5E5D9] space-y-2 text-xs text-[#69736D]">
                <strong className="text-[#202824] block">खाता कैसे हटाएं:</strong>
                <p>
                  आप किसी भी समय अपनी <strong>प्रोफ़ाइल व खाता सेटिंग्स</strong> में जाकर <strong>&quot;खाता हटाएं&quot;</strong> विकल्प चुन सकते हैं। इसके लिए पासवर्ड और पुष्टिकरण वाक्यांश दर्ज करना आवश्यक है।
                </p>
                <p>
                  खाता हटाने पर आपकी निजी प्रोफ़ाइल जानकारी, वॉल्ट दस्तावेज़, और ट्रैकिंग रिकॉर्ड्स स्थायी रूप से मिटा दिए जाते हैं।
                </p>
              </div>
            </section>

            {/* Section 5 Hindi */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">05.</span> संपर्क व शिकायत निवारण
              </h2>
              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-2 text-xs">
                <p className="text-[#69736D]">
                  गोपनीयता संबंधी प्रश्नों अथवा डीपीडीपी अधिनियम के तहत अधिकारों हेतु संपर्क करें:{" "}
                  <a href={`mailto:${supportEmail}`} className="text-[#205C43] font-mono font-medium underline">
                    {supportEmail}
                  </a>
                </p>
                <div className="pt-2">
                  <Link
                    href="/support"
                    className="inline-flex items-center gap-1.5 text-xs text-[#205C43] font-semibold hover:underline"
                  >
                    <span>सहायता केंद्र पर जाएं</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
