"use client";

import React, { useState, useMemo } from "react";
import { Check, Copy } from "lucide-react";
import hljs from "highlight.js";

interface CodeBlockProps {
  language?: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy code:", e);
    }
  };

  const highlightedCode = useMemo(() => {
    if (!value) return "";
    const cleanLang = (language || "").toLowerCase().trim();
    if (cleanLang && hljs.getLanguage(cleanLang)) {
      try {
        return hljs.highlight(value, { language: cleanLang, ignoreIllegals: true }).value;
      } catch (e) {
        // Fallback below
      }
    }
    try {
      return hljs.highlightAuto(value).value;
    } catch (e) {
      return "";
    }
  }, [language, value]);

  return (
    <div className="relative my-4 rounded-xl border border-[#222222] bg-[#050505] overflow-hidden text-sm shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0d0d0d] border-b border-[#1a1a1a] text-xs text-[#888888] font-mono">
        <span className="uppercase tracking-wider font-semibold text-[11px] text-[#aaaaaa]">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-[#1a1a1a]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-[13px] leading-relaxed text-[#e5e5e5] m-0">
          {highlightedCode ? (
            <code
              className="hljs"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          ) : (
            <code>{value}</code>
          )}
        </pre>
      </div>
    </div>
  );
}
