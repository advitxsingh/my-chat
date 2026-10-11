"use client";

import React, { useRef, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onStop: () => void;
}

export function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
  onStop,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const nextHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-1">
      <div className="relative rounded-2xl border border-[#222222] bg-[#0c0c0c] focus-within:border-[#383838] transition-colors shadow-2xl">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask MyChat..."
          rows={1}
          className="w-full bg-transparent text-[15px] text-white placeholder-[#555555] px-4 pt-3.5 pb-12 focus:outline-none resize-none min-h-[52px] max-h-[200px] leading-relaxed"
        />

        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          {isLoading ? (
            <button
              onClick={onStop}
              className="p-2 rounded-xl bg-white text-black hover:bg-[#e0e0e0] transition-colors"
              title="Stop generating"
            >
              <Square className="w-4 h-4 fill-black" />
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!input.trim()}
              className={`p-2 rounded-xl transition-all ${
                input.trim()
                  ? "bg-white text-black hover:bg-[#e0e0e0] active:scale-95"
                  : "bg-[#181818] text-[#444444] cursor-not-allowed"
              }`}
              title="Send message (Enter)"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 px-2 text-[11px] text-[#555555]">
        <span>Markdown, LaTeX, and chemical formulas supported</span>
        <span className="hidden sm:inline">↵ to send, Shift + ↵ for newline</span>
      </div>
    </div>
  );
}
