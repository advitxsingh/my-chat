import { NextResponse } from "next/server";
import { CURATED_MODELS, ModelOption } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ models: CURATED_MODELS, source: "fallback" });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        next: { revalidate: 3600 },
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) {
      console.warn(`Gemini models fetch failed with status: ${res.status}`);
      return NextResponse.json({ models: CURATED_MODELS, source: "fallback" });
    }

    const data = await res.json();
    const rawModels: any[] = data.models || [];

    // Filter to generative text/chat models, excluding specialized non-chat endpoints
    // (TTS audio models, transcription, music/lyria, robotics, computer-use, raw image output)
    const validChatModels = rawModels.filter((m) => {
      if (!m.supportedGenerationMethods?.includes("generateContent")) {
        return false;
      }
      const id = (m.name || "").replace(/^models\//, "").toLowerCase();
      if (
        id.includes("-tts") ||
        id.includes("transcribe") ||
        id.includes("lyria") ||
        id.includes("robotics") ||
        id.includes("computer-use") ||
        id.includes("customtools") ||
        id.includes("-image") ||
        id.includes("clip-preview") ||
        id.includes("banana") ||
        id.includes("antigravity") ||
        id.includes("deep-research")
      ) {
        return false;
      }
      return true;
    });

    // Format and rank models
    const formatted: ModelOption[] = validChatModels.map((m) => {
      const id = m.name.replace(/^models\//, "");
      const isLatest =
        id.includes("3.8") ||
        id.includes("latest") ||
        id.includes("3.7") ||
        id === "gemini-3.8-flash";

      let badge: string | undefined;
      if (id.includes("3.8-flash")) badge = "Latest";
      else if (id.includes("3.7")) badge = "Reasoning";
      else if (id.includes("3.6")) badge = "Fast";
      else if (id.includes("pro")) badge = "Pro";
      else if (id.includes("lite")) badge = "Lite";
      else if (id.includes("latest")) badge = "Latest";
      else if (id.includes("flash")) badge = "Fast";

      return {
        id,
        name: m.displayName || id,
        description: m.description || "",
        badge,
        isLatest,
        contextWindow: m.inputTokenLimit
          ? `${Math.round(m.inputTokenLimit / 1000)}k tokens`
          : undefined,
      };
    });

    // Custom sort: Put latest flagships first, then others
    const priorityOrder = [
      "gemini-3.8-flash",
      "gemini-3.7-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-pro-preview",
      "gemini-3.1-flash-lite",
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-flash-latest",
      "gemini-pro-latest",
    ];

    formatted.sort((a, b) => {
      const idxA = priorityOrder.indexOf(a.id);
      const idxB = priorityOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ models: formatted, source: "gemini-api" });
  } catch (error: any) {
    console.error("Error fetching models:", error);
    return NextResponse.json({ models: CURATED_MODELS, source: "fallback" });
  }
}
