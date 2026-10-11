"use client";

import React from "react";
import { Atom, Binary, Compass, Sigma } from "lucide-react";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
  selectedModelName?: string;
}

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const suggestions = [
    {
      category: "Mathematics",
      icon: Sigma,
      label: "Evaluate the Gaussian integral with polar coordinates",
      prompt:
        "Evaluate the Gaussian integral $$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$ and explain each step using double integrals and polar coordinates.",
    },
    {
      category: "Chemistry",
      icon: Atom,
      label: "Thermodynamics of the Haber-Bosch reaction",
      prompt:
        "Analyze the thermodynamics and equilibrium of the Haber-Bosch reaction: $$\\ce{N2(g) + 3H2(g) <=> 2NH3(g)} \\quad (\\Delta H^\\circ = -92.4\\text{ kJ/mol})$$ Explain how temperature and pressure shifts affect the equilibrium position according to Le Chatelier's principle.",
    },
    {
      category: "Physics",
      icon: Compass,
      label: "Derive wave equation from Maxwell's equations",
      prompt:
        "State Maxwell's equations in vacuum in differential form and derive the electromagnetic wave equation showing that the speed of light is $$c = \\frac{1}{\\sqrt{\\mu_0 \\varepsilon_0}}$$",
    },
    {
      category: "Algorithms",
      icon: Binary,
      label: "Implement an LRU Cache in TypeScript with O(1) ops",
      prompt:
        "Write a clean, fully typed TypeScript implementation of an LRU (Least Recently Used) cache with $O(1)$ `get` and `put` operations using a doubly linked list and a hash map.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-4 text-center">
      <div className="mb-3">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white font-sans">
          MyChat
        </h1>
      </div>
      <p className="text-[14px] text-[#777777] max-w-md mb-8">
        Fast, distraction-free intelligence with native LaTeX, chemistry, physics, and code formatting.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group p-3.5 rounded-xl border border-[#1a1a1a] bg-[#070707] hover:bg-[#111111] hover:border-[#2a2a2a] transition-all flex flex-col items-start text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1.5 text-xs text-[#666666] group-hover:text-[#999999] transition-colors">
                <Icon className="w-3.5 h-3.5" />
                <span className="font-mono uppercase tracking-wider text-[11px]">
                  {item.category}
                </span>
              </div>
              <p className="text-[13px] text-[#cccccc] group-hover:text-white transition-colors line-clamp-2">
                {item.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
