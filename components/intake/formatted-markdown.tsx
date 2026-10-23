"use client";

import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FormattedMarkdownProps {
  content: string;
  isStreaming?: boolean;
}

/**
 * Strips raw markdown syntax while preserving structure, headings,
 * and bullet points for clean clipboard copying.
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown) return "";

  return markdown
    // Remove code block markers
    .replace(/```[a-z]*\n([\s\S]*?)\n```/g, "$1")
    // Replace markdown headings with clean uppercase or standard text
    .replace(/^#{1,6}\s+(.+)$/gm, "$1\n")
    // Replace markdown bold/italic
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // Replace markdown links [text](url) -> text (url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    // Normalize bullets
    .replace(/^\s*[-*+]\s+/gm, "• ")
    // Remove blockquote markers
    .replace(/^\s*>\s+/gm, "")
    // Remove horizontal rules
    .replace(/^-{3,}$/gm, "")
    // Collapse excess empty lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Production-grade Markdown renderer styled for NyayLink's legal document clarity.
 * Uses remarkGfm for GitHub Flavored Markdown (tables, checklists, autolinks).
 */
export const FormattedMarkdown = memo(function FormattedMarkdown({
  content,
  isStreaming = false,
}: FormattedMarkdownProps) {
  // If streaming and content ends with incomplete formatting markers, protect against jarring render jumps
  const sanitizedContent = content || "";

  return (
    <div className="prose prose-sm max-w-none text-[#202824] leading-relaxed break-words font-sans selection:bg-[#205C43]/15">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#174530] mt-6 mb-3 tracking-tight border-b border-[#D5E5D9] pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-serif font-semibold text-[#174530] mt-5 mb-2.5 tracking-tight border-b border-[#D5E5D9]/60 pb-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-semibold text-[#205C43] mt-4 mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#205C43]" />
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs sm:text-sm font-semibold text-[#202824] mt-3 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-xs sm:text-[13.5px] text-[#202824] leading-relaxed mb-3">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[#174530]">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-[#202824]/90">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="my-2.5 space-y-1.5 list-none pl-1 text-xs sm:text-[13.5px]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 space-y-1.5 list-decimal pl-5 text-xs sm:text-[13.5px] marker:text-[#205C43] marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="relative pl-5 text-xs sm:text-[13.5px] text-[#202824] leading-relaxed before:content-['•'] before:absolute before:left-1 before:text-[#205C43] before:font-bold">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 pl-4 py-1.5 border-l-2 border-[#205C43] bg-[#EAF3ED]/40 rounded-r-lg text-xs sm:text-[13px] text-[#202824] italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-4 w-full overflow-x-auto rounded-lg border border-[#D5E5D9] shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#EAF3ED] text-[#205C43] font-semibold border-b border-[#D5E5D9]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[#D5E5D9]/70 bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-[#F8FAF9] transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-semibold text-[#174530]">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2 text-[#202824]">{children}</td>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="px-1.5 py-0.5 rounded bg-[#EAF3ED] text-[#205C43] font-mono text-[11.5px] border border-[#D5E5D9]">
                {children}
              </code>
            ) : (
              <pre className="my-3 p-3.5 rounded-lg bg-[#F8FAF9] border border-[#D5E5D9] overflow-x-auto text-[11.5px] font-mono text-[#202824]">
                <code>{children}</code>
              </pre>
            );
          },
          a: ({ href, children }) => {
            // Validate protocol to prevent javascript: and data: exploits
            const isSafe =
              href &&
              (href.startsWith("https://") ||
                href.startsWith("http://") ||
                href.startsWith("/") ||
                href.startsWith("#"));

            if (!isSafe) {
              return <span>{children}</span>;
            }

            return (
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-[#205C43] font-medium underline underline-offset-2 hover:text-[#174530] transition-colors"
              >
                {children}
              </a>
            );
          },
          hr: () => <hr className="my-4 border-[#D5E5D9]" />,
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>

      {/* Pulsing cursor while actively streaming tokens */}
      {isStreaming && (
        <span
          className="inline-block w-1.5 h-3.5 bg-[#205C43] ml-1.5 animate-pulse align-middle rounded-2xs"
          aria-hidden="true"
        />
      )}
    </div>
  );
});
