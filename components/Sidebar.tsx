"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Sidebar as SidebarIcon,
} from "lucide-react";
import { Chat } from "@/lib/types";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  isOpen,
  onClose,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const filteredChats = useMemo(() => {
    if (!search.trim()) return chats;
    return chats.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [chats, search]);

  // Group chats by date
  const groupedChats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const weekAgo = today - 7 * 86400000;

    const groups: { [key: string]: Chat[] } = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      Older: [],
    };

    filteredChats.forEach((chat) => {
      const time = chat.updatedAt || chat.createdAt;
      if (time >= today) {
        groups.Today.push(chat);
      } else if (time >= yesterday) {
        groups.Yesterday.push(chat);
      } else if (time >= weekAgo) {
        groups["Previous 7 Days"].push(chat);
      } else {
        groups.Older.push(chat);
      }
    });

    return groups;
  }, [filteredChats]);

  const handleStartRename = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editingTitle.trim()) {
      onRenameChat(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteChat(id);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 bg-black border-r border-[#1a1a1a] transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${!isOpen ? "md:hidden" : ""}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-[#161616]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-white font-sans">
              MyChat
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onClose();
              }}
              className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#141414] transition-colors"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#141414] transition-colors"
              title="Close sidebar"
            >
              <SidebarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-[#141414]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#555555]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#333333]"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#555555]">
              {search ? "No matches found" : "No chats yet"}
            </div>
          ) : (
            Object.entries(groupedChats).map(([groupTitle, groupItems]) => {
              if (groupItems.length === 0) return null;
              return (
                <div key={groupTitle} className="space-y-1">
                  <div className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-[#555555]">
                    {groupTitle}
                  </div>
                  {groupItems.map((chat) => {
                    const isActive = chat.id === activeChatId;
                    const isEditing = chat.id === editingId;

                    return (
                      <div
                        key={chat.id}
                        onClick={() => {
                          onSelectChat(chat.id);
                          if (window.innerWidth < 768) onClose();
                        }}
                        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                          isActive
                            ? "bg-[#141414] text-white border border-[#242424]"
                            : "text-[#aaaaaa] hover:bg-[#0c0c0c] hover:text-white border border-transparent"
                        }`}
                      >
                        {isEditing ? (
                          <form
                            onSubmit={(e) => handleSaveRename(chat.id, e)}
                            className="flex items-center gap-1 w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="flex-1 bg-[#1a1a1a] text-white px-2 py-0.5 rounded text-xs focus:outline-none border border-[#333333]"
                              autoFocus
                              onBlur={() => handleSaveRename(chat.id)}
                            />
                            <button
                              type="submit"
                              className="p-1 hover:text-emerald-400"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 hover:text-rose-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 truncate flex-1 pr-1">
                              <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-[#666666]" />
                              <span className="truncate">{chat.title}</span>
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                              <button
                                onClick={(e) => handleStartRename(chat, e)}
                                className="p-1 text-[#777777] hover:text-white rounded hover:bg-[#202020]"
                                title="Rename"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(chat.id, e)}
                                className="p-1 text-[#777777] hover:text-rose-400 rounded hover:bg-[#202020]"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#161616] flex items-center justify-between text-[11px] text-[#555555]">
          <span className="font-mono">AMOLED Black</span>
          <span className="text-[10px] bg-[#121212] px-2 py-0.5 rounded border border-[#222222]">
            Convex Ready
          </span>
        </div>
      </aside>
    </>
  );
}
