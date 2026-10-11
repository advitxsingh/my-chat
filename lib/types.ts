export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  chatId: string;
  role: Role;
  content: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  title: string;
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
  isLatest?: boolean;
  contextWindow?: string;
}

export const DEFAULT_MODEL = "gemini-3.8-flash";

export const CURATED_MODELS: ModelOption[] = [
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    description: "Next-gen ultra fast multimodal model, exceptional speed & reasoning",
    badge: "Latest",
    isLatest: true,
    contextWindow: "1M tokens",
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    description: "High-speed reasoning model with hybrid capabilities",
    badge: "Fast",
    contextWindow: "1M tokens",
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    description: "Balanced speed and intelligence for general reasoning",
    badge: "Stable",
    contextWindow: "1M tokens",
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro Preview",
    description: "Advanced complex problem solving, coding and science analysis",
    badge: "Pro",
    contextWindow: "1M tokens",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Deep multimodal comprehension & mathematical proofs",
    badge: "Pro",
    contextWindow: "1M tokens",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Dependable, efficient model for daily queries",
    contextWindow: "1M tokens",
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash-Lite",
    description: "Ultra-low latency lightweight model",
    badge: "Lite",
    contextWindow: "1M tokens",
  },
];
