/**
 * Shared helper for the app's text AI features.
 * Streams from the Lovable AI gateway and returns strict JSON.
 */

const RESPONSES = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

function friendlyError(status: number, body: string) {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string }; message?: string };
    const message = parsed.error?.message ?? parsed.message;
    if (message) return message;
  } catch {
    /* not JSON */
  }
  if (status === 401) return "AI is not configured.";
  if (status === 402) return "AI credits are unavailable. Please add credits and try again.";
  if (status === 403) return "AI is disabled for this workspace.";
  if (status === 429) return "AI is busy right now. Please wait a moment and try again.";
  return `AI request failed (${status}).`;
}

async function readStream(res: Response) {
  const reader = res.body?.getReader();
  if (!reader) throw new Error("AI returned an empty response.");
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as {
          type?: string;
          delta?: string;
          response?: { output_text?: string };
        };
        if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
          text += event.delta;
        } else if (event.type === "response.completed" && event.response?.output_text) {
          if (!text) text = event.response.output_text;
        }
      } catch {
        /* partial event */
      }
    }
  }
  return text.trim();
}

export async function generateJson<T>(options: {
  name: string;
  schema: Record<string, unknown>;
  instructions: string;
  input: string;
  effort?: "low" | "medium" | "high";
}): Promise<T> {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("AI is not configured.");

  const res = await fetch(RESPONSES, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      instructions: options.instructions,
      input: options.input,
      stream: true,
      reasoning: { effort: options.effort ?? "low" },
      text: {
        format: {
          type: "json_schema",
          name: options.name,
          strict: true,
          schema: options.schema,
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(friendlyError(res.status, await res.text().catch(() => "")));
  }

  const text = await readStream(res);
  if (!text) throw new Error("AI could not produce an answer. Please try again.");
  return JSON.parse(text) as T;
}

export async function generateText(options: {
  instructions: string;
  input: string;
  effort?: "low" | "medium" | "high";
}): Promise<string> {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("AI is not configured.");

  const res = await fetch(RESPONSES, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      instructions: options.instructions,
      input: options.input,
      stream: true,
      reasoning: { effort: options.effort ?? "low" },
    }),
  });

  if (!res.ok) throw new Error(friendlyError(res.status, await res.text().catch(() => "")));
  const text = await readStream(res);
  if (!text) throw new Error("AI could not produce an answer. Please try again.");
  return text;
}

export function strObject(properties: Record<string, unknown>) {
  return {
    type: "object",
    additionalProperties: false,
    required: Object.keys(properties),
    properties,
  };
}

export const strArray = { type: "array", items: { type: "string" } };
