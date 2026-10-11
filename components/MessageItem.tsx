"use client";

import React, { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/contrib/mhchem.js";
import { Message } from "@/lib/types";
import { CodeBlock } from "./CodeBlock";
import { Copy, Check } from "lucide-react";
import { preprocessMarkdownMath } from "@/lib/markdown";

interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageItem({ message, isStreaming }: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy message:", e);
    }
  };

  // Preprocess LaTeX math, chemistry, and equation blocks outside code
  const processedContent = useMemo(() => {
    if (isUser) return message.content;
    return preprocessMarkdownMath(message.content);
  }, [message.content, isUser]);

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[85%] md:max-w-[75%] rounded-2xl bg-[#141414] border border-[#242424] px-4 py-3 text-white text-[15px] leading-relaxed shadow-sm">
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col mb-8 text-[#ececec]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-mono tracking-wide text-[#777777] uppercase font-medium">
            MyChat
          </span>
          {isStreaming && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 text-[#777777] hover:text-[#ffffff] rounded hover:bg-[#141414]"
          title="Copy message"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      <div className="markdown-content text-[15px] leading-relaxed break-words overflow-hidden">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).replace(/\n$/, "");

              if (!inline && (match || codeString.includes("\n"))) {
                return (
                  <CodeBlock
                    language={match ? match[1] : ""}
                    value={codeString}
                  />
                );
              }

              return (
                <code
                  className="bg-[#121212] border border-[#222222] text-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            a({ node, children, href, ...props }: any) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline underline-offset-4 hover:text-[#999999] transition-colors"
                  {...props}
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {processedContent}
        </ReactMarkdown>

        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-white animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}
