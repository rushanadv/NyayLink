"use client";

import React, { useState, useEffect, useRef } from "react";
import { LegalMatter } from "@/lib/portal/types";
import {
  ShieldCheck,
  FolderLock,
  Upload,
  FileText,
  FileCheck,
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Scale,
  Hash,
} from "lucide-react";
import {
  uploadVaultDocument,
  getClientVaultDocuments,
  deleteVaultDocument,
  renameVaultDocument,
  replaceVaultDocument,
  type VaultDocumentRecord,
} from "@/app/actions/vault";
import { useLanguage } from "@/lib/i18n/context";

interface DocumentsTabProps {
  matters: LegalMatter[];
  userId?: string;
}

const CATEGORY_LABELS: Record<string, { en: string; hi: string }> = {
  pleading: { en: "Pleading / Petition", hi: "याचिका / वाद पत्र" },
  evidence: { en: "Evidence / Annexure", hi: "साक्ष्य / अनुलग्नक" },
  notice: { en: "Legal Notice / Reply", hi: "कानूनी नोटिस / उत्तर" },
  order: { en: "Court Order / Judgment", hi: "अदालती आदेश / निर्णय" },
  contract: { en: "Contract / Agreement", hi: "अनुबंध / इकरारनामा" },
  general: { en: "General Document / ID", hi: "सामान्य दस्तावेज़" },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function DocumentsTab({ matters }: DocumentsTabProps) {
  const { isHindi } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document list & loading states
  const [documents, setDocuments] = useState<VaultDocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [category, setCategory] = useState<string>("pleading");
  const [selectedMatterId, setSelectedMatterId] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Rename Dialog State
  const [renamingDoc, setRenamingDoc] = useState<VaultDocumentRecord | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Deletion Modal State
  const [deletingDoc, setDeletingDoc] = useState<VaultDocumentRecord | null>(null);
  const [isDeletingDoc, setIsDeletingDoc] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Replacement Modal State
  const [replacingDoc, setReplacingDoc] = useState<VaultDocumentRecord | null>(null);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [isReplacingDoc, setIsReplacingDoc] = useState(false);
  const [replaceError, setReplaceError] = useState<string | null>(null);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await getClientVaultDocuments();
      if (res.success && res.documents) {
        setDocuments(res.documents);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    // 15MB limit
    if (file.size > 15 * 1024 * 1024) {
      setUploadFeedback({
        type: "error",
        message: isHindi
          ? "फ़ाइल का आकार 15MB से अधिक नहीं होना चाहिए।"
          : "File size exceeds 15MB. Please choose a smaller file.",
      });
      return;
    }

    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadFeedback({
        type: "error",
        message: isHindi
          ? "केवल PDF, JPEG, PNG, या WebP प्रारूप स्वीकृत हैं।"
          : "Only PDF, JPEG, PNG, or WebP files are accepted.",
      });
      return;
    }

    setSelectedFile(file);
    if (!docTitle) {
      // Auto-populate title from clean filename
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setDocTitle(cleanName);
    }
    setUploadFeedback(null);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !docTitle.trim()) return;

    setIsUploading(true);
    setUploadFeedback(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", docTitle.trim());
    formData.append("category", category);
    if (selectedMatterId) {
      formData.append("matterId", selectedMatterId);
    }

    try {
      const res = await uploadVaultDocument(formData);
      if (res.success && res.document) {
        setUploadFeedback({
          type: "success",
          message: isHindi
            ? "दस्तावेज़ सफलतापूर्वक एन्क्रिप्ट कर सुरक्षित वॉल्ट में सहेज दिया गया।"
            : "Document encrypted and stored in secure vault successfully.",
        });
        setSelectedFile(null);
        setDocTitle("");
        setSelectedMatterId("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        await loadDocuments();
      } else {
        throw new Error(res.error || "Failed to upload document");
      }
    } catch (err: unknown) {
      setUploadFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to upload file.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (doc: VaultDocumentRecord) => {
    setDeleteError(null);
    setDeletingDoc(doc);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDoc) return;
    setIsDeletingDoc(true);
    setDeleteError(null);

    try {
      const res = await deleteVaultDocument(deletingDoc.id, deletingDoc.storage_path);
      if (res.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== deletingDoc.id));
        setDeletingDoc(null);
      } else {
        setDeleteError(res.error || "Failed to delete document from vault.");
      }
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "An error occurred while deleting.");
    } finally {
      setIsDeletingDoc(false);
    }
  };

  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingDoc || !replacementFile) return;

    setIsReplacingDoc(true);
    setReplaceError(null);

    const formData = new FormData();
    formData.append("file", replacementFile);

    try {
      const res = await replaceVaultDocument(replacingDoc.id, replacingDoc.storage_path, formData);
      if (res.success && res.document) {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === replacingDoc.id
              ? {
                  ...d,
                  file_name: res.document!.file_name,
                  file_size: res.document!.file_size,
                  mime_type: res.document!.mime_type,
                  storage_path: res.document!.storage_path,
                  sha256_hash: res.document!.sha256_hash,
                }
              : d
          )
        );
        setReplacingDoc(null);
        setReplacementFile(null);
      } else {
        setReplaceError(res.error || "Failed to replace document.");
      }
    } catch (err: unknown) {
      setReplaceError(err instanceof Error ? err.message : "Failed to replace document.");
    } finally {
      setIsReplacingDoc(false);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingDoc || !newTitle.trim()) return;

    try {
      const res = await renameVaultDocument(renamingDoc.id, newTitle.trim());
      if (res.success) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === renamingDoc.id ? { ...d, title: newTitle.trim() } : d))
        );
        setRenamingDoc(null);
      } else {
        alert(res.error || "Failed to rename document");
      }
    } catch (err) {
      console.error("Rename error:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#D5E5D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
            {isHindi ? "गोपनीय केस वॉल्ट व दस्तावेज़" : "Confidential Case Vault & Documents"}
          </h1>
          <p className="text-xs text-[#69736D] mt-1">
            {isHindi
              ? "सांविधिक नोटिस, याचिकाएं, साक्ष्य व अदालती आदेशों हेतु निजी स्टोरेज (DPDP अधिनियम 2023 अनुपालित)"
              : "Private cryptographic vault for pleadings, notices, evidence, and orders under strict Row-Level Security."}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF3ED] border border-[#D5E5D9] text-xs font-mono font-semibold text-[#205C43] self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5 text-[#205C43]" />
          <span>{isHindi ? "आरएलएस व टीएलएस संरक्षित वॉल्ट" : "RLS & TLS Protected Vault"}</span>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-4 rounded-2xl bg-[#EAF3ED]/80 border border-[#D5E5D9] flex items-start gap-3.5 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-[#205C43] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-semibold text-[#202824] uppercase font-mono tracking-wider text-[11px]">
            {isHindi ? "विशेषाधिकार प्राप्त साक्ष्य वॉल्ट" : "Privileged Evidence Vault (DPDP Act, 2023)"}
          </span>
          <p className="leading-relaxed text-[#69736D] text-[11px]">
            {isHindi
              ? "सभी अपलोड सीधे आपके उपयोगकर्ता पहचान से बंधे निजी स्टोरेज में संग्रहीत होते हैं। केवल आप और आपके अधिकृत अधिवक्ता को ही समयबद्ध हस्ताक्षरित लिंक से एक्सेस प्राप्त होता है।"
              : "All evidentiary uploads are scoped exclusively to authenticated matters. Files can only be retrieved by you and your assigned advocate using time-bounded authorized signed URLs."}
          </p>
        </div>
      </div>

      {/* Feedback Alert */}
      {uploadFeedback && (
        <div
          className={`p-4 rounded-xl text-xs leading-relaxed flex items-start gap-2.5 ${
            uploadFeedback.type === "success"
              ? "bg-[#EAF3ED] border border-[#D5E5D9] text-[#174530]"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          {uploadFeedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[#205C43] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          )}
          <span>{uploadFeedback.message}</span>
        </div>
      )}

      {/* Upload Document Section */}
      <div className="p-6 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#205C43]" />
          <h2 className="text-sm font-serif font-bold text-[#202824] uppercase tracking-wider">
            {isHindi ? "नया दस्तावेज़ वॉल्ट में अपलोड करें" : "Upload Document to Case Vault"}
          </h2>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files?.[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
              isDragOver
                ? "border-[#205C43] bg-[#EAF3ED]"
                : selectedFile
                ? "border-[#205C43]/50 bg-[#F8FAF9]"
                : "border-[#D5E5D9] hover:border-[#205C43]/40 bg-[#FDFEFC]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpeg,.jpg,.png,.webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <FileCheck className="w-8 h-8 text-[#205C43]" />
                <div className="text-xs">
                  <p className="font-semibold text-[#202824]">{selectedFile.name}</p>
                  <p className="text-[#69736D] font-mono text-[11px]">{formatBytes(selectedFile.size)}</p>
                </div>
                <span className="text-[10px] text-[#205C43] font-semibold underline">
                  {isHindi ? "दूसरी फ़ाइल चुनें" : "Click to select a different file"}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="w-8 h-8 text-[#69736D]" />
                <p className="text-xs font-semibold text-[#202824]">
                  {isHindi
                    ? "फ़ाइल यहाँ खींचें व छोड़ें, या ब्राउज़ करने के लिए क्लिक करें"
                    : "Drag and drop legal file here, or click to browse"}
                </p>
                <p className="text-[11px] text-[#69736D]">
                  PDF, JPEG, PNG, WebP (Max 15MB)
                </p>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#69736D] uppercase font-semibold">
                {isHindi ? "दस्तावेज़ शीर्षक *" : "Document Title *"}
              </label>
              <input
                type="text"
                required
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Writ Petition Annexure A"
                className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] text-xs bg-[#F8FAF9] focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] outline-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#69736D] uppercase font-semibold">
                {isHindi ? "श्रेणी" : "Document Category"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] text-xs bg-[#F8FAF9] focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] outline-none cursor-pointer"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {isHindi ? label.hi : label.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Link to Matter */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-[#69736D] uppercase font-semibold">
                {isHindi ? "संबंधित मामला (वैकल्पिक)" : "Link to Matter (Optional)"}
              </label>
              <select
                value={selectedMatterId}
                onChange={(e) => setSelectedMatterId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] text-xs bg-[#F8FAF9] focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] outline-none cursor-pointer"
              >
                <option value="">{isHindi ? "कोई विशिष्ट मामला नहीं (सामान्य वॉल्ट)" : "No specific matter (General Vault)"}</option>
                {matters.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!selectedFile || !docTitle.trim() || isUploading}
              className="px-5 py-2.5 rounded-xl bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isHindi ? "सुरक्षित वॉल्ट में सहेज रहे हैं..." : "Encrypting & Uploading..."}</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isHindi ? "वॉल्ट में सुरक्षित सहेजें" : "Securely Save to Vault"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-serif font-bold text-[#202824]">
            {isHindi ? "वॉल्ट में सुरक्षित दस्तावेज़" : "Encrypted Vault Documents"} ({documents.length})
          </h2>
          <span className="text-xs font-mono text-[#69736D]">
            {isHindi ? "अद्यतन स्थिति" : "Auto-synced with Supabase RLS"}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#69736D] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#205C43]" />
            <span>{isHindi ? "वॉल्ट दस्तावेज़ लोड हो रहे हैं..." : "Loading encrypted vault files..."}</span>
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => {
              const catLabel = CATEGORY_LABELS[doc.category] || CATEGORY_LABELS.general;

              return (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl bg-white border border-[#D5E5D9] hover:border-[#205C43]/40 transition-all shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43] shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-xs sm:text-sm text-[#202824] leading-tight line-clamp-1">
                            {doc.title}
                          </h3>
                          <p className="text-[11px] text-[#69736D] font-mono mt-0.5 truncate max-w-[220px]">
                            {doc.file_name}
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full bg-[#F8FAF9] text-[10px] font-mono font-semibold text-[#205C43] border border-[#D5E5D9] shrink-0">
                        {isHindi ? catLabel.hi : catLabel.en}
                      </span>
                    </div>

                    {/* Metadata strip */}
                    <div className="pt-2 border-t border-[#D5E5D9]/60 flex flex-wrap items-center justify-between text-[11px] text-[#69736D] gap-2">
                      <span>{formatBytes(doc.file_size)}</span>
                      <span>
                        {new Date(doc.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Matter Tag if linked */}
                    {doc.matter_title && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#4A544F] bg-[#F8FAF9] px-2.5 py-1 rounded-lg border border-[#D5E5D9]/70">
                        <Scale className="w-3 h-3 text-[#205C43] shrink-0" />
                        <span className="truncate">{doc.matter_title}</span>
                      </div>
                    )}

                    {/* Cryptographic SHA-256 Hash badge */}
                    {doc.sha256_hash && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-[#69736D] truncate" title={`SHA-256: ${doc.sha256_hash}`}>
                        <Hash className="w-3 h-3 text-[#205C43] shrink-0" />
                        <span className="truncate">SHA-256: {doc.sha256_hash.slice(0, 16)}...</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[#D5E5D9] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setRenamingDoc(doc);
                          setNewTitle(doc.title);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#F8FAF9] text-[#69736D] hover:text-[#202824] transition-colors"
                        title="Rename title"
                        aria-label="Rename document"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setReplacingDoc(doc);
                          setReplacementFile(null);
                          setReplaceError(null);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#F8FAF9] text-[#69736D] hover:text-[#205C43] transition-colors"
                        title={isHindi ? "फ़ाइल बदलें (नया संस्करण)" : "Replace with new version"}
                        aria-label="Replace document"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(doc)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-[#69736D] hover:text-rose-700 transition-colors"
                        title={isHindi ? "वॉल्ट से हटाएं" : "Delete from vault"}
                        aria-label="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {doc.download_url ? (
                      <a
                        href={doc.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#EAF3ED] hover:bg-[#D5E5D9] text-[#205C43] font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isHindi ? "देखें / डाउनलोड" : "View / Download"}</span>
                      </a>
                    ) : (
                      <span className="text-[10px] font-mono text-[#69736D] italic">
                        Signed URL regenerating
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Vault State */
          <div className="p-12 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3ED] border border-[#D5E5D9] text-[#205C43] flex items-center justify-center mx-auto">
              <FolderLock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-serif font-semibold text-[#202824]">
              {isHindi ? "कोई दस्तावेज़ वॉल्ट में अपलोड नहीं है" : "No Case Documents in Vault Yet"}
            </h3>
            <p className="text-xs text-[#69736D] max-w-sm mx-auto">
              {isHindi
                ? "याचिका, नोटिस या आदेश फ़ाइल ऊपर दिए गए फ़ॉर्म से अपलोड करें। वे यहाँ एन्क्रिप्टेड रूप में उपलब्ध होंगे।"
                : "Upload your legal notice, court order, or petition annexure above. They will be stored securely with cryptographic integrity."}
            </p>
          </div>
        )}
      </div>

      {/* Rename Dialog Modal */}
      {renamingDoc && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D5E5D9] p-6 max-w-md w-full shadow-lg space-y-4">
            <h3 className="text-sm font-serif font-bold text-[#202824]">
              {isHindi ? "दस्तावेज़ का नाम बदलें" : "Rename Document"}
            </h3>
            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#D5E5D9] text-xs focus:ring-2 focus:ring-[#205C43]/20 focus:border-[#205C43] outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenamingDoc(null)}
                  className="px-4 py-2 rounded-lg border border-[#D5E5D9] text-xs font-medium text-[#69736D] hover:bg-[#F8FAF9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold"
                >
                  Save Title
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rich Delete Confirmation Modal */}
      {deletingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D5E5D9] p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#202824]">
                  {isHindi ? "दस्तावेज़ हटाने की पुष्टि" : "Confirm Document Deletion"}
                </h3>
                <p className="text-[11px] text-[#69736D] truncate max-w-xs">{deletingDoc.title}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] space-y-1.5 text-[11px] text-[#69736D]">
              <div className="flex justify-between">
                <span>{isHindi ? "फ़ाइल नाम:" : "File Name:"}</span>
                <span className="font-mono text-[#202824] truncate max-w-[180px]">{deletingDoc.file_name}</span>
              </div>
              <div className="flex justify-between">
                <span>{isHindi ? "आकार:" : "Size:"}</span>
                <span className="font-mono text-[#202824]">{formatBytes(deletingDoc.file_size)}</span>
              </div>
              {deletingDoc.matter_title && (
                <div className="pt-1 border-t border-[#D5E5D9] text-amber-800">
                  ⚠️ <strong>{isHindi ? "संबद्ध केस:" : "Associated Matter:"}</strong> {deletingDoc.matter_title}
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    {isHindi
                      ? "यह दस्तावेज़ आपके वॉल्ट से हटा दिया जाएगा। यदि यह केस अदालत में विचाराधीन है, तो अधिवक्ता के पास विधिक रिकॉर्ड सुरक्षित रह सकते हैं।"
                      : "Removing this file clears your personal vault. If this matter is active in court, assigned counsel may retain statutory proceeding copies."}
                  </p>
                </div>
              )}
            </div>

            <p className="text-[#69736D] leading-relaxed">
              {isHindi
                ? "यह फ़ाइल सुपाबेस स्टोरेज बकेट और आपके डेटाबेस से स्थायी रूप से हटा दी जाएगी।"
                : "This file will be permanently removed from Supabase Storage and your vault index. This action is irreversible."}
            </p>

            {deleteError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D5E5D9]">
              <button
                type="button"
                onClick={() => setDeletingDoc(null)}
                disabled={isDeletingDoc}
                className="px-4 py-2 rounded-lg border border-[#D5E5D9] text-xs font-medium text-[#69736D] hover:bg-[#F8FAF9]"
              >
                {isHindi ? "रद्द करें" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingDoc}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingDoc ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isHindi ? "हटाया जा रहा है..." : "Deleting..."}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isHindi ? "स्थायी रूप से हटाएं" : "Permanently Delete"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replace Document Modal */}
      {replacingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D5E5D9] p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF3ED] border border-[#D5E5D9] flex items-center justify-center text-[#205C43] shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#202824]">
                  {isHindi ? "दस्तावेज़ बदलें (नया संस्करण)" : "Replace Document Version"}
                </h3>
                <p className="text-[11px] text-[#69736D] truncate max-w-xs">{replacingDoc.title}</p>
              </div>
            </div>

            <p className="text-[#69736D]">
              {isHindi
                ? "नया प्रारूप (PDF, JPEG, PNG, WebP) चुनें। नई फ़ाइल का SHA-256 हैश तैयार कर पुरानी फ़ाइल बदल दी जाएगी।"
                : "Select an updated file (PDF, JPEG, PNG, WebP). A fresh cryptographic SHA-256 fingerprint will be computed and the previous version replaced."}
            </p>

            <form onSubmit={handleReplaceSubmit} className="space-y-4">
              <input
                type="file"
                required
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => setReplacementFile(e.target.files?.[0] || null)}
                disabled={isReplacingDoc}
                className="w-full text-xs text-[#69736D] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#EAF3ED] file:text-[#205C43] hover:file:bg-[#D5E5D9]"
              />

              {replaceError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{replaceError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#D5E5D9]">
                <button
                  type="button"
                  onClick={() => setReplacingDoc(null)}
                  disabled={isReplacingDoc}
                  className="px-4 py-2 rounded-lg border border-[#D5E5D9] text-xs font-medium text-[#69736D] hover:bg-[#F8FAF9]"
                >
                  {isHindi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isReplacingDoc || !replacementFile}
                  className="px-4 py-2 rounded-lg bg-[#205C43] hover:bg-[#174530] text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isReplacingDoc ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isHindi ? "अपलोड हो रहा है..." : "Replacing..."}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isHindi ? "नया संस्करण सहेजें" : "Upload Replacement"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
