"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  AlertTriangle,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ShieldAlert,
} from "lucide-react";
import { deleteUserAccount } from "@/app/actions/account-deletion";
import { useLanguage } from "@/lib/i18n/context";

interface AccountDeletionCardProps {
  userEmail: string;
  userRole?: "client" | "lawyer" | "admin";
}

export function AccountDeletionCard({ userEmail, userRole = "client" }: AccountDeletionCardProps) {
  const router = useRouter();
  const { isHindi } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletionSuccess, setDeletionSuccess] = useState(false);

  const expectedPhrase = "DELETE MY NYAYLINK ACCOUNT";
  const isPhraseMatching = confirmationPhrase.trim().toUpperCase() === expectedPhrase;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhraseMatching) {
      setError(
        isHindi
          ? `कृपया पुष्टिकरण हेतु ठीक "${expectedPhrase}" टाइप करें।`
          : `Please type the exact phrase "${expectedPhrase}" to confirm.`
      );
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const res = await deleteUserAccount({
        confirmationText: confirmationPhrase,
        password: password.trim() ? password : undefined,
      });

      if (res.success) {
        setDeletionSuccess(true);
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 3000);
      } else {
        setError(res.error || "Failed to delete account. Please retry or contact support.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-red-200 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 text-red-700">
        <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
          <Trash2 className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-serif font-semibold text-red-900">
            {isHindi ? "डेंजर ज़ोन: खाता स्थायी रूप से हटाएं" : "Danger Zone: Delete Account"}
          </h2>
          <p className="text-[11px] text-red-700">
            {isHindi
              ? "डीपीडीपी अधिनियम 2023 के तहत खाता और व्यक्तिगत डेटा विलोपन"
              : "Permanently erase your identity, documents, and credentials under the DPDP Act 2023."}
          </p>
        </div>
      </div>

      <p className="text-xs text-[#69736D] leading-relaxed">
        {isHindi
          ? "एक बार खाता हटा दिए जाने पर यह क्रिया पूर्ववत नहीं की जा सकती। आपके निजी वॉल्ट दस्तावेज़, ट्रैकिंग रिकॉर्ड्स और प्रोफ़ाइल स्थायी रूप से मिटा दिए जाएंगे।"
          : "Once you delete your account, this action cannot be undone. All personal profile records, private vault documents in Supabase Storage, and calendar entries will be permanently removed."}
      </p>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isHindi ? "मेरा खाता हटाएं..." : "Delete my account..."}</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#D5E5D9] shadow-2xl p-6 sm:p-7 space-y-5 text-[#202824] relative">
            <button
              onClick={() => {
                if (!isDeleting) setIsModalOpen(false);
              }}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#69736D] hover:text-[#202824] transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {deletionSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#202824]">
                  {isHindi ? "खाता सफलतापूर्वक हटा दिया गया" : "Account Permanently Deleted"}
                </h3>
                <p className="text-xs text-[#69736D] max-w-sm mx-auto">
                  {isHindi
                    ? "आपके व्यक्तिगत रिकॉर्ड और स्टोरेज फाइलें मिटा दी गई हैं। आपको होमपेज पर पुनर्निर्देशित किया जा रहा है..."
                    : "Your personal data and storage files have been purged. Redirecting you to the home page..."}
                </p>
                <div className="pt-2 flex justify-center">
                  <Loader2 className="w-5 h-5 text-[#205C43] animate-spin" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-semibold text-[#202824]">
                      {isHindi ? "खाता विलोपन की पुष्टि करें" : "Confirm Permanent Account Deletion"}
                    </h3>
                    <p className="text-[11px] text-[#69736D]">
                      {isHindi ? `खाता: ${userEmail}` : `Target Account: ${userEmail}`}
                    </p>
                  </div>
                </div>

                {/* Detailed disclosure of consequences */}
                <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 text-xs text-red-950 space-y-2">
                  <strong className="block font-semibold">
                    {isHindi ? "विलोपन के परिणाम:" : "Consequences of Deletion:"}
                  </strong>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-red-900">
                    <li>
                      {isHindi
                        ? "आपके निजी वॉल्ट की सभी फाइलें और स्टोरेज बकेट ऑब्जेक्ट तुरंत नष्ट कर दिए जाएंगे।"
                        : "All private vault documents and uploaded credentials will be erased from storage."}
                    </li>
                    <li>
                      {isHindi
                        ? "आपकी व्यक्तिगत प्रोफ़ाइल, कॉज लिस्ट ट्रैकिंग और कैलेंडर इवेंट्स मिटा दिए जाएंगे।"
                        : "Your user profile, tracked court dockets, and calendar entries will be removed."}
                    </li>
                    <li>
                      {isHindi
                        ? "अधिवक्ताओं के लिए: आपकी प्रोफ़ाइल सार्वजनिक निर्देशिका से तत्काल हटा दी जाएगी।"
                        : "For advocates: Your profile will be delisted from the public advocate directory."}
                    </li>
                    <li>
                      {isHindi
                        ? "विधिक संरक्षण: अदालत में विचाराधीन मामलों में विधिक आचार संहिता अनुपालन हेतु केस फाइलिंग रिकॉर्ड्स को केवल अनामित (anonymized) किया जाएगा।"
                        : "Legal retention: Filings already associated with active court matters assigned to counsel are retained in anonymized form for statutory recordkeeping."}
                    </li>
                  </ul>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleDelete} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block font-mono font-semibold uppercase text-[#202824]">
                      {isHindi ? "खाता पासवर्ड दर्ज करें (सुरक्षा पुनःप्रमाणीकरण)" : "Enter Account Password (Re-authentication)"} *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#69736D] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isDeleting}
                        placeholder={isHindi ? "आपका वर्तमान पासवर्ड" : "Your current password"}
                        className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#D5E5D9] bg-white text-xs text-[#202824] focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/15"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-mono font-semibold uppercase text-[#202824]">
                      {isHindi ? "पुष्टिकरण वाक्यांश टाइप करें" : "Type Confirmation Phrase"} *
                    </label>
                    <p className="text-[11px] text-[#69736D]">
                      {isHindi
                        ? `कृपया नीचे ठीक यह टाइप करें:`
                        : `Please type the following phrase exactly to confirm:`}{" "}
                      <code className="font-mono font-semibold text-red-700 bg-red-50 px-1 py-0.5 rounded">
                        {expectedPhrase}
                      </code>
                    </p>
                    <input
                      type="text"
                      required
                      value={confirmationPhrase}
                      onChange={(e) => setConfirmationPhrase(e.target.value)}
                      disabled={isDeleting}
                      placeholder={expectedPhrase}
                      className="w-full h-10 px-3 rounded-xl border border-[#D5E5D9] bg-white text-xs font-mono text-[#202824] focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/15"
                    />
                  </div>

                  <div className="pt-3 border-t border-[#D5E5D9] flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isDeleting}
                      className="px-4 py-2 rounded-xl border border-[#D5E5D9] text-[#202824] hover:bg-[#F8FAF9] text-xs font-medium transition-colors"
                    >
                      {isHindi ? "रद्द करें" : "Cancel"}
                    </button>

                    <button
                      type="submit"
                      disabled={isDeleting || !isPhraseMatching || !password}
                      className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-40 shadow-xs"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{isHindi ? "हटाया जा रहा है..." : "Deleting Account..."}</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isHindi ? "खाता स्थायी रूप से हटाएं" : "Permanently Delete Account"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
