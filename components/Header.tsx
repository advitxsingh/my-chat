"use client";

import React from "react";
import { Sidebar as SidebarIcon, Plus } from "lucide-react";
import { ModelSelector } from "./ModelSelector";

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  onNewChat: () => void;
}

export function Header({
  onToggleSidebar,
  isSidebarOpen,
  selectedModel,
  onSelectModel,
  onNewChat,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3.5 py-2.5 bg-black/90 backdrop-blur-md border-b border-[#181818]">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#888888] hover:text-white hover:bg-[#141414] transition-colors"
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <SidebarIcon className="w-4 h-4" />
        </button>

        <span className="font-semibold text-sm tracking-tight text-white font-sans mr-2 select-none">
          MyChat
        </span>

        <ModelSelector
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onNewChat}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#222222] bg-[#0c0c0c] hover:bg-[#141414] text-xs text-[#cccccc] hover:text-white transition-all"
          title="Start a new chat"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-sans text-xs">New Chat</span>
        </button>
      </div>
    </header>
  );
}
