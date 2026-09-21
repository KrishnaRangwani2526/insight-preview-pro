import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateJson, generateText, strArray, strObject } from "./ai-core.server";

const VOICE =
  "You help rural Indian artisans sell their handmade craft. Write in plain, simple words a person with basic schooling understands. Never invent prices or facts you were not given. Keep every sentence short. Reply only with the requested JSON.";

/* ---------------- Catalogue copy ---------------- */

export const aiProductCopy = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        name: z.string().min(1),
        material: z.string().optional(),
        place: z.string().optional(),
        language: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) =>
    generateJson<{
      title: string;
      short: string;
      full: string;
      keywords: string[];
      hindi: string;
      english: string;
    }>({
      name: "catalogue_copy",
      instructions: VOICE,
      input: `Write marketplace copy for a handmade product.
Product: ${data.name}
Materials: ${data.material || "not given"}
Made in: ${data.place || "a village workshop in India"}
Return: a short selling title, a one-line short description, a full description of 60-90 words, 6 search keywords, the same description in Hindi, and in English.`,
      schema: strObject({
        title: { type: "string" },
        short: { type: "string" },
        full: { type: "string" },
        keywords: strArray,
        hindi: { type: "string" },
        english: { type: "string" },
      }),
    }),
  );

/* ---------------- Price estimation ---------------- */

export const aiPriceEstimate = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        product: z.string().optional(),
        rawMaterial: z.number(),
        labour: z.number(),
        packaging: z.number(),
        transport: z.number(),
        marginPercent: z.number(),
        market: z.enum(["village", "district", "city", "online"]),
        place: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const cost = data.rawMaterial + data.labour + data.packaging + data.transport;
    return generateJson<{
      minimum: number;
      recommended: number;
      premium: number;
      marketLow: number;
      marketHigh: number;
      reasons: string[];
    }>({
      name: "price_estimate",
      instructions:
        VOICE +
        " You are a pricing advisor for handmade Indian craft. Prices are in Indian rupees, whole numbers only. Recommended must be above cost and above minimum; premium above recommended.",
      input: `Suggest selling prices for one piece.
Product: ${data.product || "handmade craft item"}
Selling place: ${data.market} market${data.place ? ` near ${data.place}` : ""}
Cost per piece: raw material ₹${data.rawMaterial}, labour ₹${data.labour}, packaging ₹${data.packaging}, transport ₹${data.transport} (total ₹${cost})
Artisan wants about ${data.marginPercent}% margin.
Give a minimum price, a recommended price, a premium price, the typical market range buyers pay, and 4 short reasons in simple words.`,
      schema: strObject({
        minimum: { type: "number" },
        recommended: { type: "number" },
        premium: { type: "number" },
        marketLow: { type: "number" },
        marketHigh: { type: "number" },
        reasons: strArray,
      }),
      effort: "medium",
    });
  });

/* ---------------- Advertisement ---------------- */

export const aiAdvertisement = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        product: z.string().min(1),
        offer: z.string().optional(),
        audience: z.string().optional(),
        business: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) =>
    generateJson<{
      headline: string;
      primary: string;
      cta: string;
      caption: string;
      poster: string;
      whatsapp: string;
    }>({
      name: "advertisement",
      instructions: VOICE,
      input: `Write an advertisement for a handmade product.
Product: ${data.product}
Offer: ${data.offer || "none"}
Audience: ${data.audience || "online buyers in India"}
Business name: ${data.business || "a small artisan workshop"}
Return a headline, the main ad text (40-60 words), a call to action, a social caption with hashtags, 3 short poster lines separated by newlines, and a friendly WhatsApp message.`,
      schema: strObject({
        headline: { type: "string" },
        primary: { type: "string" },
        cta: { type: "string" },
        caption: { type: "string" },
        poster: { type: "string" },
        whatsapp: { type: "string" },
      }),
    }),
  );

/* ---------------- Reel script ---------------- */

export const aiReelScript = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ product: z.string().min(1) }).parse(d))
  .handler(async ({ data }) =>
    generateJson<{
      concept: string;
      hook: string;
      scenes: string[];
      voiceover: string;
      subtitles: string;
      music: string;
      caption: string;
      hashtags: string[];
    }>({
      name: "reel_script",
      instructions: VOICE,
      input: `Plan a 20-second phone-shot reel for this handmade product: ${data.product}. Return the concept, an opening hook line, 3 scenes, a voiceover script, a subtitles note, a music suggestion, a caption and 5 hashtags.`,
      schema: strObject({
        concept: { type: "string" },
        hook: { type: "string" },
        scenes: strArray,
        voiceover: { type: "string" },
        subtitles: { type: "string" },
        music: { type: "string" },
        caption: { type: "string" },
        hashtags: strArray,
      }),
    }),
  );

/* ---------------- Content repurposing ---------------- */

export const aiTransformContent = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        input: z.string().min(1),
        outputs: z.array(z.string()).min(1).max(8),
        params: z.record(z.string(), z.string()).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) =>
    generateJson<{ items: { type: string; body: string }[] }>({
      name: "content_outputs",
      instructions: VOICE,
      input: `Turn this into the formats listed.
Source: ${data.input}
Formats: ${data.outputs.join(", ")}
Tone: ${data.params?.['tone'] || "warm"}
Return one item per format, using exactly the format name as "type".`,
      schema: strObject({
        items: {
          type: "array",
          items: strObject({ type: { type: "string" }, body: { type: "string" } }),
        },
      }),
    }),
  );

/* ---------------- SWOT ---------------- */

export const aiSwot = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        business: z.string().optional(),
        craft: z.string().optional(),
        place: z.string().optional(),
        products: z.array(z.string()).optional(),
        monthlyRevenue: z.number().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) =>
    generateJson<{
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    }>({
      name: "swot",
      instructions: VOICE,
      input: `Make a SWOT for this artisan business.
Business: ${data.business || "small handmade craft business"}
Craft: ${data.craft || "handicraft"}
Place: ${data.place || "rural India"}
Products: ${(data.products ?? []).join(", ") || "handmade items"}
Monthly sales: ${data.monthlyRevenue ? `₹${data.monthlyRevenue}` : "not given"}
Give 3 short points in each of the four lists.`,
      schema: strObject({
        strengths: strArray,
        weaknesses: strArray,
        opportunities: strArray,
        threats: strArray,
      }),
      effort: "medium",
    }),
  );

/* ---------------- Feasibility ---------------- */

export const aiFeasibility = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        category: z.string().min(1),
        capital: z.number(),
        place: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) =>
    generateJson<{
      score: number;
      verdict: string;
      reach: string;
      demand: number;
      opportunity: string;
      competitorDensity: string;
      priceRange: string;
      risks: string[];
      explanation: string;
    }>({
      name: "feasibility",
      instructions:
        VOICE +
        " Score and demand are whole numbers from 0 to 100. Verdict is one of Good, Moderate, High Risk.",
      input: `Judge how workable this small business idea is.
Category: ${data.category}
Own money available: ₹${data.capital}
Place: ${data.place || "a small town in India"}
Return a score, verdict, the local reach in one line, a demand number, the main opportunity, competitor density, a likely price range, 3 risks and a short 2-sentence explanation.`,
      schema: strObject({
        score: { type: "number" },
        verdict: { type: "string" },
        reach: { type: "string" },
        demand: { type: "number" },
        opportunity: { type: "string" },
        competitorDensity: { type: "string" },
        priceRange: { type: "string" },
        risks: strArray,
        explanation: { type: "string" },
      }),
      effort: "medium",
    }),
  );

/* ---------------- Assistant ---------------- */

export const aiAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ question: z.string().min(1), context: z.string().optional() }).parse(d),
  )
  .handler(async ({ data }) =>
    generateText({
      instructions:
        "You are a practical business helper for a rural Indian artisan. Answer in 3-5 short sentences, in the same language the question is asked in. Give one clear next step. Use only the business details provided; never invent numbers.",
      input: `Business details: ${data.context || "not provided"}\n\nQuestion: ${data.question}`,
    }),
  );
