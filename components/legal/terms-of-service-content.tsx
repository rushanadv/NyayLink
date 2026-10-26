"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export function TermsOfServiceContent() {
  const { isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState<"en" | "hi">(isHindi ? "hi" : "en");
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@nyay.live";

  return (
    <div className="w-full bg-[#FFFFFF] text-[#202824] min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="border-b border-[#D5E5D9] pb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF3ED] border border-[#205C43]/20 text-[#205C43] text-xs font-mono font-medium">
              <Scale className="w-3.5 h-3.5" />
              <span>ADVOCATES ACT, 1961 & BCI RULE 36 COMPLIANT TERMS</span>
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
            {activeTab === "en" ? "NyayLink Terms of Service" : "न्यायलिंक सेवा की शर्तें"}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#69736D] font-mono">
            <span>
              {activeTab === "en" ? "Effective Date: October 26, 2026" : "प्रभावी तिथि: 26 अक्टूबर 2026"}
            </span>
            <span>•</span>
            <span>Version 1.0 (Operational Release)</span>
          </div>

          {/* Mandatory Legal Review Notice */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 text-amber-950 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold font-mono uppercase tracking-wider text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {activeTab === "en"
                  ? "Notice of Professional Legal Review Status"
                  : "विधिक समीक्षा प्रकटीकरण सूचना"}
              </span>
            </div>
            <p className="leading-relaxed">
              {activeTab === "en"
                ? "These Terms of Service accurately describe the existing technical infrastructure and operational rules of NyayLink. As a matter of good governance and regulatory prudence, these terms are subject to formal periodic review and sign-off by a qualified legal professional admitted to practice in India prior to definitive commercial publication. These terms do not present themselves as an absolute warranty of compliance."
                : "ये शर्तें न्यायलिंक के तकनीकी बुनियादी ढांचे और संचालन नियमों का सही विवरण प्रस्तुत करती हैं। नियामक विवेक के अनुसार, अंतिम प्रकाशन से पूर्व ये शर्तें भारत में विधि व्यवसाय हेतु योग्य पेशेवर अधिवक्ता द्वारा समीक्षा के अधीन हैं।"}
            </p>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === "en" ? (
          <div className="space-y-10 text-xs sm:text-sm text-[#202824] leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">01.</span> Nature of Service & Regulatory Boundary
              </h2>
              <p>
                <strong>NyayLink is an informational legal-technology platform, not a law firm.</strong> NyayLink does not practice law, does not provide legal advice, does not draft pleadings on its own behalf, and does not solicit briefs or tout for clients.
              </p>
              <p>
                Under Section 36 of the Bar Council of India (BCI) Rules framed under the Advocates Act, 1961, practicing advocates are strictly prohibited from advertising or soliciting professional work. NyayLink operates solely as an independent, neutral informational infrastructure that enables:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#69736D]">
                <li>Citizens to search publicly verifiable Bar Council enrollment records and view objective professional profiles.</li>
                <li>Citizens to clarify their preliminary statutory options through automated AI preconsultation.</li>
                <li>Direct, voluntary consultation requests between citizens and independent advocates with transparent upfront fee terms.</li>
                <li>Digital litigation workflow tools, including chamber calendar scheduling and Section 30 Vakalatnama draft generation.</li>
              </ul>
              <p className="font-medium text-[#202824]">
                NyayLink does not operate an escrow service, does not hold client funds in trust, and does not charge referral commissions on advocate fees.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">02.</span> User Accounts & Roles
              </h2>
              <div className="space-y-2 text-xs text-[#69736D]">
                <p>
                  <strong>A. Client Role:</strong> Registered users who seek legal information, maintain a personal document vault, or book consultations with verified counsel. Clients are responsible for maintaining the confidentiality of their login credentials.
                </p>
                <p>
                  <strong>B. Advocate Role:</strong> Practicing advocates admitted to the roll of a State Bar Council under the Advocates Act, 1961. Advocates represent that all submitted enrollment details (Bar Council enrollment number, university law degrees, office addresses) are genuine, accurate, and in good standing. Misrepresentation results in immediate account suspension.
                </p>
                <p>
                  <strong>C. Administrative Process:</strong> Administrative moderation is restricted to verifying Bar Council enrollment against public rolls and managing technical security incidents.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">03.</span> AI Preconsultation Boundaries & Disclaimer
              </h2>
              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#205C43] font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Informational Assistance Only</span>
                </div>
                <p className="text-[#69736D]">
                  The AI Preconsultation feature is an automated informational assistant. It is powered by high-parameter language models designed to translate statutory provisions (such as Bharatiya Nyaya Sanhita, Code of Civil Procedure, Consumer Protection Act, RERA) into plain language.
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[#69736D]">
                  <li>AI answers are NOT legal advice and cannot replace the counsel of an enrolled advocate.</li>
                  <li>AI answers may be incomplete, outdated, or inapplicable to your specific judicial district or factual context.</li>
                  <li>You must independently verify all limitation deadlines, court procedures, and statutory citations.</li>
                  <li>Interactions with the AI assistant do not establish advocate-client privilege.</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">04.</span> Advocate-Client Engagement & Fees
              </h2>
              <p>
                Any professional legal engagement formed between a Client and an Advocate on NyayLink is a direct contract between those two parties:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#69736D]">
                <li>Advocates independently determine their professional fees in accordance with Bar Council ethical standards.</li>
                <li>NyayLink provides fixed, transparent consultation fee disclosures so clients encounter zero unexpected costs.</li>
                <li>Digital Vakalatnama drafts generated on the platform are appointment memorandums under Section 30 of the Advocates Act, 1961, containing cryptographic SHA-256 integrity fingerprints suitable for physical signing or e-Filing submission.</li>
                <li>NyayLink is not a party to the advocate-client engagement and disclaims liability for professional advice rendered by independent counsel.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">05.</span> Confidential Case Vault & Document Ownership
              </h2>
              <p>
                You retain complete ownership and intellectual property rights in all documents, petitions, and evidence uploaded to your Confidential Case Vault. We isolate storage objects under authenticated user identifiers. You may delete or replace documents you own at any time, subject to legal matter preservation where active court proceedings require evidentiary retention by assigned counsel.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">06.</span> Account Suspension & Deletion
              </h2>
              <p>
                You have the statutory right to delete your NyayLink account at any time through your Profile & Account Settings. Deletion purges your profile, removes private vault storage objects, deletes personal calendar and tracking entries, and terminates active sessions. We reserve the right to suspend accounts that engage in fraudulent credential representation, abusive conduct, or attempts to circumvent platform security.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">07.</span> Governing Law & Support Contact
              </h2>
              <p>
                These terms are governed by and construed in accordance with the laws of India, including the Information Technology Act, 2000, the Digital Personal Data Protection Act, 2023, and the Advocates Act, 1961.
              </p>
              <div className="p-3.5 rounded-xl bg-white border border-[#D5E5D9] text-xs text-[#69736D] space-y-1">
                <p>
                  For inquiries or questions regarding these terms:{" "}
                  <a href={`mailto:${supportEmail}`} className="text-[#205C43] font-mono underline">
                    {supportEmail}
                  </a>
                </p>
                <div className="pt-2">
                  <Link
                    href="/privacy"
                    className="text-[#205C43] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Read NyayLink Privacy Policy</span>
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
                <span className="font-mono text-xs text-[#205C43]">01.</span> सेवा का स्वरूप व विधिक सीमाएं
              </h2>
              <p>
                <strong>न्यायलिंक एक सूचनात्मक विधिक-तकनीकी मंच है, कोई लॉ फर्म नहीं है।</strong> न्यायलिंक स्वयं वकालत नहीं करता, कानूनी सलाह नहीं देता, और न ही मुवक्किलों की याचना (solicitation) करता है।
              </p>
              <p>
                अधिवक्ता अधिनियम 1961 के अंतर्गत बार काउंसिल ऑफ इंडिया के नियम 36 के अनुसार अधिवक्ताओं को विज्ञापन करने की मनाही है। न्यायलिंक एक तटस्थ डिजिटल बुनियादी ढांचा प्रदान करता है जो नागरिकों को सार्वजनिक रूप से सत्यापित अधिवक्ताओं से सीधे संपर्क करने और एआई पूर्व-परामर्श द्वारा अपने कानूनी विकल्पों को समझने की सुविधा देता है।
              </p>
              <p className="font-medium text-[#202824]">
                न्यायलिंक कोई एस्क्रो सेवा संचालित नहीं करता और न ही वकीलों की फीस पर कोई रेफरल कमीशन लेता है।
              </p>
            </section>

            {/* Section 2 Hindi */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">02.</span> एआई पूर्व-परामर्श सीमाएं
              </h2>
              <p>
                एआई पूर्व-परामर्श सुविधा एक स्वचालित सूचनात्मक साधन है। यह भारतीय कानूनों की सामान्य जानकारी प्रदान करता है, किंतु यह किसी अधिवक्ता की कानूनी सलाह का स्थान नहीं ले सकता। नागरिक न्यायालयीन समय-सीमाओं और प्रक्रियाओं का स्वतंत्र रूप से सत्यापन करने के लिए स्वयं उत्तरदायी हैं।
              </p>
            </section>

            {/* Section 3 Hindi */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">03.</span> खाता व दस्तावेज़ विलोपन अधिकार
              </h2>
              <p>
                उपयोगकर्ता किसी भी समय अपने प्रोफ़ाइल सेटिंग्स से अपना खाता और वॉल्ट के दस्तावेज़ पूरी तरह हटा सकते हैं। खाता हटाने पर व्यक्तिगत डेटा और निजी फाइलें पूरी तरह नष्ट कर दी जाती हैं।
              </p>
            </section>

            {/* Section 4 Hindi */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#202824] flex items-center gap-2 border-b border-[#D5E5D9] pb-2">
                <span className="font-mono text-xs text-[#205C43]">04.</span> संपर्क व विधिक सहायता
              </h2>
              <p>
                सेवा की शर्तों से संबंधित किसी भी प्रश्न के लिए संपर्क करें:{" "}
                <a href={`mailto:${supportEmail}`} className="text-[#205C43] font-mono underline">
                  {supportEmail}
                </a>
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
