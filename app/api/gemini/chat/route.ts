import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_INSTRUCTION = `You are MyChat, a clean, fast, and precise assistant.
Guidelines:
1. Mathematics: Always use LaTeX. Use inline math $...$ for inline equations, symbols, and variables. Use display math $$...$$ for standalone formulas and multi-line derivations.
2. Chemistry: Provide clear chemical formulas and balanced equations. Use standard chemical notation or \\ce{...} syntax (e.g., \\ce{2H2 + O2 -> 2H2O}, \\ce{H2SO4}, \\ce{CH4 + 2O2 -> CO2 + 2H2O}). Clearly show state symbols (s, l, g, aq), charges, and reaction arrows.
3. Physics: Always state fundamental formulas clearly with LaTeX, including vector symbols (\\vec{F}), derivatives, integrals, and proper SI units.
4. Code: Use fenced code blocks with explicit language identifiers (e.g., \`\`\`python, \`\`\`javascript). Keep code clean, modern, and well-commented.
5. Tone: Be concise, clear, and direct. Avoid unnecessary conversational pleasantries, generic AI throat-clearing, or repetitive disclaimers. Provide elegant, structured answers.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model = "gemini-3.8-flash", apiKey: customApiKey } = body;

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Gemini API key is missing. Please set GEMINI_API_KEY in your environment or enter it in settings.",
        },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    // Convert messages to Gemini format
    // Filter out messages with empty content
    const contents = messages
      .filter((m: any) => m.content && m.content.trim().length > 0)
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    // Ensure first message is from "user"
    if (contents.length > 0 && contents[0].role !== "user") {
      contents.shift();
    }

    if (contents.length === 0) {
      return NextResponse.json(
        { error: "Valid user message required." },
        { status: 400 }
      );
    }

    const payload = {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    };

    const targetModel = model.replace(/^models\//, "");
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const upstreamResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!upstreamResponse.ok) {
      const errText = await upstreamResponse.text();
      let parsedErr: any;
      try {
        parsedErr = JSON.parse(errText);
      } catch {
        parsedErr = null;
      }

      const errorMessage =
        parsedErr?.error?.message ||
        `Gemini API error (${upstreamResponse.status}): ${errText}`;

      return NextResponse.json(
        { error: errorMessage },
        { status: upstreamResponse.status }
      );
    }

    if (!upstreamResponse.body) {
      return NextResponse.json(
        { error: "No response stream received from Gemini." },
        { status: 502 }
      );
    }

    // Transform stream: parse Gemini SSE and stream pure text chunks
    const upstreamReader = upstreamResponse.body.getReader();
    const decoder = new TextDecoder("utf-8");
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await upstreamReader.read();
            if (done) {
              if (buffer.trim()) {
                processBuffer(buffer, controller, encoder);
              }
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;

              const jsonStr = trimmed.slice(5).trim();
              if (!jsonStr) continue;

              try {
                const parsed = JSON.parse(jsonStr);
                const candidates = parsed.candidates;
                if (candidates && candidates.length > 0) {
                  const parts = candidates[0]?.content?.parts || [];
                  for (const part of parts) {
                    if (part.text) {
                      controller.enqueue(encoder.encode(part.text));
                    }
                  }
                }
              } catch {
                // Ignore chunk parse error, keep stream alive
              }
            }
          }
        } catch (err: any) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: any) {
    console.error("Chat API route error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function processBuffer(buffer: string, controller: any, encoder: any) {
  const lines = buffer.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;
    const jsonStr = trimmed.slice(5).trim();
    if (!jsonStr) continue;
    try {
      const parsed = JSON.parse(jsonStr);
      const candidates = parsed.candidates;
      if (candidates && candidates.length > 0) {
        const parts = candidates[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.text) {
            controller.enqueue(encoder.encode(part.text));
          }
        }
      }
    } catch {
      // Ignored
    }
  }
}
