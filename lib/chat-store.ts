"use client";

import { useState, useEffect, useCallback } from "react";
import { Chat, Message, DEFAULT_MODEL } from "./types";

const STORAGE_CHATS_KEY = "mychat_history_chats";
const STORAGE_MESSAGES_KEY = "mychat_history_messages";

export interface ChatStore {
  chats: Chat[];
  activeChatId: string | null;
  activeChat: Chat | null;
  messages: Message[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  createNewChat: (model?: string) => string;
  selectChat: (id: string) => void;
  renameChat: (id: string, newTitle: string) => void;
  deleteChat: (id: string) => void;
  clearAllChats: () => void;
  addMessage: (chatId: string, role: "user" | "assistant" | "system", content: string) => Message;
  updateLastAssistantMessage: (chatId: string, content: string) => void;
  isLoaded: boolean;
}

export function useChatStore(): ChatStore {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedChats = localStorage.getItem(STORAGE_CHATS_KEY);
      const storedMessages = localStorage.getItem(STORAGE_MESSAGES_KEY);

      if (storedChats) {
        const parsedChats: Chat[] = JSON.parse(storedChats);
        setChats(parsedChats);
        if (parsedChats.length > 0) {
          setActiveChatId(parsedChats[0].id);
          setSelectedModel(parsedChats[0].model || DEFAULT_MODEL);
        }
      }

      if (storedMessages) {
        const parsedMessages: Record<string, Message[]> = JSON.parse(storedMessages);
        setMessagesMap(parsedMessages);
      }
    } catch (e) {
      console.error("Failed to load local chat state:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save chats to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(chats));
    } catch (e) {
      console.error("Failed to save chats:", e);
    }
  }, [chats, isLoaded]);

  // Save messages to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messagesMap));
    } catch (e) {
      console.error("Failed to save messages:", e);
    }
  }, [messagesMap, isLoaded]);

  const createNewChat = useCallback((modelOverride?: string): string => {
    const id = "chat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    const model = modelOverride || selectedModel || DEFAULT_MODEL;
    const newChat: Chat = {
      id,
      title: "New Chat",
      model,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(id);
    setSelectedModel(model);
    setMessagesMap((prev) => ({ ...prev, [id]: [] }));
    return id;
  }, [selectedModel]);

  const selectChat = useCallback((id: string) => {
    setActiveChatId(id);
    setChats((prev) => {
      const chat = prev.find((c) => c.id === id);
      if (chat && chat.model) {
        setSelectedModel(chat.model);
      }
      return prev;
    });
  }, []);

  const renameChat = useCallback((id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setChats((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, title: newTitle.trim(), updatedAt: Date.now() }
          : c
      )
    );
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeChatId === id) {
        const nextActive = filtered.length > 0 ? filtered[0].id : null;
        setActiveChatId(nextActive);
        if (filtered.length > 0) {
          setSelectedModel(filtered[0].model || DEFAULT_MODEL);
        }
      }
      return filtered;
    });

    setMessagesMap((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, [activeChatId]);

  const clearAllChats = useCallback(() => {
    setChats([]);
    setActiveChatId(null);
    setMessagesMap({});
    try {
      localStorage.removeItem(STORAGE_CHATS_KEY);
      localStorage.removeItem(STORAGE_MESSAGES_KEY);
    } catch {}
  }, []);

  const addMessage = useCallback(
    (chatId: string, role: "user" | "assistant" | "system", content: string): Message => {
      const message: Message = {
        id: "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
        chatId,
        role,
        content,
        createdAt: Date.now(),
      };

      setMessagesMap((prev) => {
        const currentList = prev[chatId] || [];
        return {
          ...prev,
          [chatId]: [...currentList, message],
        };
      });

      // Update chat's updatedAt and auto-title if it was "New Chat" and this is the first user message
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          let title = c.title;
          if (role === "user" && title === "New Chat") {
            const cleanTitle = content
              .replace(/[\n\r]+/g, " ")
              .trim()
              .slice(0, 36);
            title = cleanTitle || "New Chat";
          }
          return {
            ...c,
            title,
            updatedAt: Date.now(),
          };
        })
      );

      return message;
    },
    []
  );

  const updateLastAssistantMessage = useCallback((chatId: string, content: string) => {
    setMessagesMap((prev) => {
      const currentList = prev[chatId] || [];
      if (currentList.length === 0) return prev;

      const lastIdx = currentList.length - 1;
      const lastMsg = currentList[lastIdx];

      if (lastMsg.role !== "assistant") return prev;

      const updated = [...currentList];
      updated[lastIdx] = {
        ...lastMsg,
        content,
      };

      return {
        ...prev,
        [chatId]: updated,
      };
    });
  }, []);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const currentMessages = (activeChatId && messagesMap[activeChatId]) || [];

  return {
    chats,
    activeChatId,
    activeChat,
    messages: currentMessages,
    selectedModel,
    setSelectedModel: (m: string) => {
      setSelectedModel(m);
      if (activeChatId) {
        setChats((prev) =>
          prev.map((c) => (c.id === activeChatId ? { ...c, model: m } : c))
        );
      }
    },
    createNewChat,
    selectChat,
    renameChat,
    deleteChat,
    clearAllChats,
    addMessage,
    updateLastAssistantMessage,
    isLoaded,
  };
}
