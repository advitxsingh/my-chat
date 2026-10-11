"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Sparkles } from "lucide-react";
import { ModelOption, CURATED_MODELS } from "@/lib/types";

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export function ModelSelector({
  selectedModel,
  onSelectModel,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<ModelOption[]>(CURATED_MODELS);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic models list from Gemini API
  useEffect(() => {
    let isMounted = true;
    async function fetchModels() {
      try {
        const res = await fetch("/api/gemini/models");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.models && Array.isArray(data.models) && data.models.length > 0) {
            setModels(data.models);
          }
        }
      } catch (e) {
        console.warn("Using fallback model list:", e);
      }
    }
    fetchModels();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Current model metadata
  const currentModel =
    models.find((m) => m.id === selectedModel) || {
      id: selectedModel,
      name: selectedModel.replace(/^models\//, ""),
      description: "",
    };

  const filteredModels = models.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#222222] bg-[#0c0c0c] hover:bg-[#141414] hover:border-[#333333] transition-all text-xs text-[#e0e0e0] font-medium"
      >
        <span className="truncate max-w-[140px] sm:max-w-[200px]">
          {currentModel.name}
        </span>
        {currentModel.badge && (
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1c1c1c] text-[#a0a0a0] font-mono border border-[#2a2a2a]">
            {currentModel.badge}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-[#777777]" />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#242424] bg-[#0a0a0a] shadow-2xl z-50 overflow-hidden">
          <div className="p-2.5 border-b border-[#1c1c1c]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Gemini models..."
              className="w-full bg-[#121212] border border-[#222222] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#444444]"
              autoFocus
            />
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
            {filteredModels.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-[#666666]">
                No models found
              </div>
            ) : (
              filteredModels.map((model) => {
                const isSelected = model.id === selectedModel;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onSelectModel(model.id);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left transition-colors ${
                      isSelected
                        ? "bg-[#181818] text-white"
                        : "hover:bg-[#121212] text-[#cccccc]"
                    }`}
                  >
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white">
                          {model.name}
                        </span>
                        {model.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#222222] text-[#aaaaaa] font-mono">
                            {model.badge}
                          </span>
                        )}
                      </div>
                      {model.description && (
                        <p className="text-[11px] text-[#777777] line-clamp-1 mt-0.5">
                          {model.description}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
