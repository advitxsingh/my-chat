"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore } from "@/lib/chat-store";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MessageItem } from "@/components/MessageItem";
import { ChatInput } from "@/components/ChatInput";
import { EmptyState } from "@/components/EmptyState";

export default function ChatPage() {
  const {
    chats,
    activeChatId,
    activeChat,
    messages,
    selectedModel,
    setSelectedModel,
    createNewChat,
    selectChat,
    renameChat,
    deleteChat,
    addMessage,
    updateLastAssistantMessage,
    removeLastMessage,
    isLoaded,
    isConvexConnected,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Responsive sidebar default state
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom("auto");
  }, [messages.length, scrollToBottom]);

  const handleSend = async (overridePrompt?: string) => {
    const textToSend = overridePrompt !== undefined ? overridePrompt : input;
    if (!textToSend.trim() || isLoading) return;

    let currentChatId = activeChatId;
    if (!currentChatId) {
      currentChatId = createNewChat(selectedModel);
    }

    // Add user message
    addMessage(currentChatId, "user", textToSend.trim());
    setInput("");

    // Prepare assistant placeholder message
    addMessage(currentChatId, "assistant", "");
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Build context history
    const conversationHistory = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: textToSend.trim() },
    ];

    let fullAssistantResponse = "";

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: conversationHistory,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errMessage = "Failed to communicate with Gemini API.";
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream received.");

      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        fullAssistantResponse += chunkText;
        updateLastAssistantMessage(currentChatId, fullAssistantResponse);
        scrollToBottom("auto");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Chat generation stopped by user");
        if (!fullAssistantResponse) {
          removeLastMessage(currentChatId);
        }
      } else {
        console.error("Chat generation error:", err);
        const errMsg = `Error: ${err.message || "Failed to generate response."}`;
        updateLastAssistantMessage(
          currentChatId,
          fullAssistantResponse ? `${fullAssistantResponse}\n\n[Stopped: ${err.message}]` : errMsg
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleNewChat = () => {
    handleStop();
    createNewChat(selectedModel);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="font-mono text-xs text-[#666666] tracking-wider animate-pulse">
          INITIALIZING MYCHAT...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={handleNewChat}
        onRenameChat={renameChat}
        onDeleteChat={deleteChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isConvexConnected={isConvexConnected}
      />

      {/* Main Chat Workspace */}
      <div className="flex flex-col flex-1 h-full min-w-0 bg-black">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onNewChat={handleNewChat}
        />

        {/* Message View Area */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth"
        >
          {messages.length === 0 ? (
            <EmptyState
              onSelectPrompt={(prompt) => {
                handleSend(prompt);
              }}
              selectedModelName={selectedModel}
            />
          ) : (
            <div className="max-w-3xl mx-auto space-y-2">
              {messages.map((message, idx) => {
                const isLastAssistant =
                  idx === messages.length - 1 &&
                  message.role === "assistant" &&
                  isLoading;
                return (
                  <MessageItem
                    key={message.id || idx}
                    message={message}
                    isStreaming={isLastAssistant}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => handleSend()}
          isLoading={isLoading}
          onStop={handleStop}
        />
      </div>
    </div>
  );
}
