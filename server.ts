import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const PORT = 3000;

// High-reliability primary and fallback models for text generation
const TEXT_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-2.5-flash-lite",
];

// Helper to generate with automatic failover between available models
async function generateContentWithFailover(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    preferredModel?: string;
  }
) {
  const models = [
    params.preferredModel || "gemini-2.5-flash",
    ...TEXT_MODELS.filter((m) => m !== (params.preferredModel || "gemini-2.5-flash")),
  ];

  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[Gemini] Attempting content generation with model: ${model} (attempt ${attempt + 1})`);
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        const text = response.text;
        if (text && text.trim().length > 0) {
          console.log(`[Gemini] Successfully generated content using model: ${model}`);
          return { text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        console.warn(`[Gemini] Model ${model} attempt ${attempt + 1} failed: ${msg}`);

        const isTransient =
          msg.includes("503") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("high demand") ||
          msg.includes("429") ||
          msg.includes("RESOURCE_EXHAUSTED");

        if (isTransient && attempt === 0) {
          // Brief pause before retry on same model
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        // Move to next model in the fallback pool
        break;
      }
    }
  }

  throw lastError || new Error("All AI models are currently busy. Please try again in a few moments.");
}

// Helper to safely parse JSON from AI model response
function cleanAndParseJSON(rawText: string) {
  let cleaned = rawText.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return JSON.parse(cleaned);
}

// Generate creative, eye-catching SVG thumbnail graphics when external image quotas are unavailable
function generateFallbackSvgThumbnail(prompt: string, aspectRatio: "16:9" | "9:16", variationIndex: number): string {
  const isShorts = aspectRatio === "9:16";
  const width = isShorts ? 720 : 1280;
  const height = isShorts ? 1280 : 720;

  const colorPalettes = [
    { bg1: "#ff0844", bg2: "#ffb199", accent: "#FFE600", textBg: "#111827", name: "Fire Punch" },
    { bg1: "#6a11cb", bg2: "#2575fc", accent: "#00F5D4", textBg: "#0F172A", name: "Neon Cyber" },
    { bg1: "#0ba360", bg2: "#3cba92", accent: "#FFF700", textBg: "#064E3B", name: "Viral Emerald" },
    { bg1: "#f857a6", bg2: "#ff5858", accent: "#FFFFFF", textBg: "#831843", name: "Vibrant Sunset" },
  ];

  const palette = colorPalettes[variationIndex % colorPalettes.length];
  const words = prompt.replace(/[^\w\s]/gi, '').split(/\s+/).filter(Boolean);
  const headline = words.slice(0, 5).join(" ").toUpperCase() || "VIRAL VIDEO";
  const subtext = words.slice(5, 12).join(" ") || "Watch Now • High CTR";

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="grad${variationIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.bg1}" />
        <stop offset="100%" stop-color="${palette.bg2}" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#grad${variationIndex})" />

    <!-- Geometric Accent Patterns -->
    <circle cx="${width * 0.85}" cy="${height * 0.2}" r="${width * 0.35}" fill="#ffffff" opacity="0.08" />
    <circle cx="${width * 0.15}" cy="${height * 0.85}" r="${width * 0.3}" fill="#000000" opacity="0.12" />

    <!-- Badges -->
    <g transform="translate(${isShorts ? 60 : 80}, ${isShorts ? 100 : 70})">
      <rect width="200" height="48" rx="24" fill="${palette.accent}" filter="url(#shadow)"/>
      <text x="100" y="32" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="20" fill="#000000" text-anchor="middle" letter-spacing="1">
        ${isShorts ? '⚡ SHORTS' : '★ 4K ULTRA'}
      </text>
    </g>

    <!-- Main CTR Headline Box -->
    <g transform="translate(${isShorts ? 60 : 80}, ${isShorts ? height * 0.38 : height * 0.32})" filter="url(#shadow)">
      <rect width="${isShorts ? 600 : 960}" height="${isShorts ? 280 : 210}" rx="20" fill="${palette.textBg}" opacity="0.92" />
      <text x="${isShorts ? 300 : 480}" y="${isShorts ? 110 : 90}" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="${isShorts ? 46 : 56}" fill="#FFFFFF" text-anchor="middle">
        ${headline}
      </text>
      <text x="${isShorts ? 300 : 480}" y="${isShorts ? 190 : 155}" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="${isShorts ? 26 : 30}" fill="${palette.accent}" text-anchor="middle">
        ${subtext}
      </text>
    </g>

    <!-- Bottom Action Pill -->
    <g transform="translate(${isShorts ? 60 : 80}, ${isShorts ? height - 160 : height - 120})">
      <rect width="${isShorts ? 320 : 360}" height="56" rx="28" fill="#FFFFFF" opacity="0.95" filter="url(#shadow)" />
      <circle cx="36" cy="28" r="16" fill="#DC2626" />
      <polygon points="32,20 44,28 32,36" fill="#FFFFFF" />
      <text x="190" y="36" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="18" fill="#111827" text-anchor="middle">
        WATCH BEFORE IT'S GONE
      </text>
    </g>
  </svg>
  `;

  const base64Svg = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64Svg}`;
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "15mb" }));

  // Initialize Gemini Client
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      hasApiKey: Boolean(apiKey),
      activeModel: "gemini-2.5-flash",
      fallbackModels: TEXT_MODELS,
    });
  });

  // YouTube SEO Generation Endpoint
  app.post("/api/seo/generate", async (req, res) => {
    try {
      const input = req.body;
      if (!input || !input.topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured in server environment.",
        });
      }

      const isShorts = input.videoFormat === "YouTube Shorts";
      const category = input.category || "General";

      // Google Search Grounding when requested
      let liveSearchContext = "";
      const searchSources: Array<{ title: string; uri: string }> = [];

      if (input.useSearchGrounding) {
        try {
          console.log(`[Gemini] Fetching Google Search grounding for: ${input.topic}`);
          const searchPromise = ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Search Google for recent news, trending queries, and competitive videos related to: "${input.topic}" in category: "${category}". Summarize 3-4 key factual insights, user search intent points, and top trending keywords.`,
            config: {
              tools: [{ googleSearch: {} }],
            },
          });

          // Timeout to ensure instant, snappy UX
          const searchResponse: any = await Promise.race([
            searchPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Search timeout")), 6000)),
          ]);

          if (searchResponse?.text) {
            liveSearchContext = searchResponse.text;
          }

          const metadata = searchResponse?.candidates?.[0]?.groundingMetadata;
          if (metadata?.groundingChunks) {
            for (const chunk of metadata.groundingChunks) {
              if (chunk.web?.uri) {
                searchSources.push({
                  title: chunk.web.title || "Google Search Result",
                  uri: chunk.web.uri,
                });
              }
            }
          }
        } catch (searchErr) {
          console.warn("[Gemini] Search grounding lookup skipped/timed out, proceeding with direct generation:", searchErr);
        }
      }

      const prompt = `
        You are an elite YouTube SEO Strategist and Algorithm Expert.
        
        STEP 1: ANALYZE
        Topic: "${input.topic}"
        Category: "${category}"
        Format: ${input.videoFormat || "Long Form"} (Important: ${isShorts ? "Optimize for Shorts Feed (Vertical, <60s)" : "Optimize for Search/Browse (Horizontal)"})
        Keywords: "${input.mainKeyword || ""}", "${input.secondaryKeywords || ""}"
        Language: ${input.language || "English"} ${input.language === "Hinglish" ? '(Hindi language written in Latin/English script - e.g., "Video kaise banaye")' : ""}
        Tone: ${input.tone || "Viral"}
        ${liveSearchContext ? `\nREAL-TIME GOOGLE SEARCH GROUNDING DATA:\n${liveSearchContext}\nUse these grounded search insights to make the titles, descriptions, and tags timely, factual, and competitive.` : ""}

        STEP 2: GENERATE JSON WITH HIGH CTR & RETENTION
        Return a JSON object:

        1. category: The best-fitting YouTube category for this video (e.g. "${category}").
        2. titles: Array of 3 viral, high-CTR titles (under 60 characters).
        3. descriptions: Array of 2 complete descriptions.
           - Start with strong keyword hook echoing the title.
           - Deep contextual overview of the video.
           - 2-3 FAQ questions & answers${input.language === "Hindi" ? ' (include Hinglish phrasing where natural)' : ""}.
           - Key timestamps or breakdown structure.
           - CRITICAL: At the VERY END of the description, append 4-6 viral hashtags on their own line (e.g., #YouTubeSEO #${input.topic.replace(/\s+/g, '')} #Shorts) so the user doesn't need to copy hashtags separately.
        4. tags: Array of 20-30 high-traffic search tags. Total combined comma-separated length MUST be between 400 and 495 characters.
        5. hashtags: Array of 5-8 relevant viral hashtags (each starting with '#').
        6. thumbnailText: Short, punchy text overlay (maximum 4-5 words).
        7. thumbnailPrompt: Highly descriptive image generation prompt. ${isShorts ? "Vertical composition (9:16), centered subject, big emotional face." : "Wide cinematic composition (16:9), dramatic contrast, YouTube thumbnail style."}
        8. fileName: SEO-optimized hyphenated file name (e.g., how-to-rank-youtube-videos.mp4).

        Return strictly valid JSON.
      `;

      const { text, modelUsed } = await generateContentWithFailover(ai, {
        contents: prompt,
        preferredModel: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              titles: { type: Type.ARRAY, items: { type: Type.STRING } },
              descriptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              thumbnailText: { type: Type.STRING },
              thumbnailPrompt: { type: Type.STRING },
              fileName: { type: Type.STRING },
            },
            required: ["titles", "descriptions", "tags", "thumbnailText", "thumbnailPrompt", "fileName"],
          },
        },
      });

      const parsedData = cleanAndParseJSON(text);

      // Ensure hashtags are seamlessly attached to descriptions if not already there
      if (parsedData.hashtags && Array.isArray(parsedData.hashtags) && parsedData.descriptions) {
        const hashtagsString = parsedData.hashtags
          .map((h: string) => (h.startsWith("#") ? h : `#${h}`))
          .join(" ");

        parsedData.descriptions = parsedData.descriptions.map((desc: string) => {
          if (!desc.includes("#")) {
            return `${desc.trim()}\n\n${hashtagsString}`;
          }
          return desc;
        });
      }

      parsedData.category = parsedData.category || category;
      parsedData._modelUsed = modelUsed;
      parsedData.isGrounded = Boolean(liveSearchContext);
      parsedData.groundingSources = searchSources;

      return res.json(parsedData);
    } catch (error: any) {
      console.error("Error in /api/seo/generate:", error);
      const message = error?.message || "Failed to generate SEO content. Please try again.";
      return res.status(500).json({ error: message });
    }
  });

  // Real-time trending research endpoint powered by Google Search Grounding
  app.post("/api/seo/trends", async (req, res) => {
    try {
      const { category = "All Categories", query = "" } = req.body;
      const prompt = `Search Google for currently trending YouTube topics, viral content ideas, and high-growth search queries in "${category}" ${query ? `related to "${query}"` : ""}.
      Provide:
      1. Top 5 viral trending video ideas
      2. 10 high-growth search keywords
      3. Why these topics are trending right now.`;

      const searchResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const sources: Array<{ title: string; uri: string }> = [];
      const metadata = searchResponse.candidates?.[0]?.groundingMetadata;
      if (metadata?.groundingChunks) {
        for (const chunk of metadata.groundingChunks) {
          if (chunk.web?.uri) {
            sources.push({
              title: chunk.web.title || "Google Search Trend",
              uri: chunk.web.uri,
            });
          }
        }
      }

      return res.json({
        trends: searchResponse.text || "No trend data found.",
        sources,
      });
    } catch (err: any) {
      console.error("Error in /api/seo/trends:", err);
      return res.status(500).json({ error: err.message || "Failed to fetch trend data" });
    }
  });

  // Social Media Content Generation Endpoint
  app.post("/api/social/generate", async (req, res) => {
    try {
      const input = req.body;
      if (!input || !input.topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured in server environment.",
        });
      }

      const isInstagram = input.platform === "Instagram (Reels & Posts)";
      let prompt = "";
      let schema: any = {};

      if (isInstagram) {
        prompt = `
          Act as a Viral Social Media Manager. Create Instagram content for the topic: "${input.topic}".
          Tone: ${input.tone || "Viral"}.
          Keywords/Context: "${input.keywords || ""}".

          Requirements:
          1. Caption: Engaging hook, emojis, clean line breaks.
          2. Hashtags: 15-20 trending hashtags (each prefixed with #).
          3. Story Content: A short, punchy script or sticker idea for an Instagram Story.
          4. Thumbnail Prompt: A detailed AI prompt to generate a high-contrast Instagram Reel cover (9:16 aspect ratio).
        `;
        schema = {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING },
            caption: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            storyContent: { type: Type.STRING },
            thumbnailPrompt: { type: Type.STRING },
          },
          required: ["caption", "hashtags", "storyContent", "thumbnailPrompt"],
        };
      } else {
        // Blog
        prompt = `
          Act as an SEO Specialist and Content Writer. Write an SEO-optimized blog outline and metadata for the topic: "${input.topic}".
          Tone: ${input.tone || "Professional"}.
          Keywords: "${input.keywords || ""}".

          Requirements:
          1. Blog Title: Catchy, includes main keyword (H1).
          2. Meta Description: Under 160 chars, enticing click-through.
          3. Blog Content: Comprehensive markdown structure including Intro, 3-4 H2 Headings with points, and Conclusion.
        `;
        schema = {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING },
            blogTitle: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            blogContent: { type: Type.STRING },
          },
          required: ["blogTitle", "metaDescription", "blogContent"],
        };
      }

      const { text, modelUsed } = await generateContentWithFailover(ai, {
        contents: prompt,
        preferredModel: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      const parsed = cleanAndParseJSON(text);
      return res.json({ ...parsed, platform: input.platform, _modelUsed: modelUsed });
    } catch (error: any) {
      console.error("Error in /api/social/generate:", error);
      const message = error?.message || "Failed to generate Social content. Please try again.";
      return res.status(500).json({ error: message });
    }
  });

  // Thumbnail Generation Endpoint with graceful fallback
  app.post("/api/thumbnails/generate", async (req, res) => {
    try {
      const { prompt, aspectRatio = "16:9" } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const cleanAspect = aspectRatio === "9:16" ? "9:16" : "16:9";

      // Attempt AI image generation via Gemini image model
      let aiImages: string[] = [];
      if (apiKey) {
        try {
          const variations = [
            "Hyper-realistic, high contrast, vivid colors, YouTube clickbait style",
            "Bold 3D render style, dynamic lighting, dramatic angle",
          ];

          const promises = variations.map(async (style) => {
            const fullPrompt = `${prompt}. Style: ${style}. Aspect Ratio ${cleanAspect}. 4k resolution.`;
            const response = await ai.models.generateContent({
              model: "gemini-3.1-flash-lite-image",
              contents: { parts: [{ text: fullPrompt }] },
              config: {
                imageConfig: {
                  aspectRatio: cleanAspect as "16:9" | "9:16",
                },
              },
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
              if (part.inlineData && part.inlineData.data) {
                const mimeType = part.inlineData.mimeType || "image/png";
                return `data:${mimeType};base64,${part.inlineData.data}`;
              }
            }
            throw new Error("No image data");
          });

          const settled = await Promise.allSettled(promises);
          aiImages = settled
            .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
            .map((r) => r.value);
        } catch (imgErr) {
          console.warn("[Thumbnail] Gemini image model quota or rate limit, switching to styled graphics:", imgErr);
        }
      }

      // If AI image generation was successful, return it
      if (aiImages.length > 0) {
        return res.json({ images: aiImages });
      }

      // High-CTR styled SVG preview thumbnails fallback (guarantees zero crashes/errors)
      console.log("[Thumbnail] Generating high-CTR graphics variations");
      const generatedThumbnails = [0, 1, 2, 3].map((index) =>
        generateFallbackSvgThumbnail(prompt, cleanAspect as "16:9" | "9:16", index)
      );

      return res.json({ images: generatedThumbnails });
    } catch (error: any) {
      console.error("Error in /api/thumbnails/generate:", error);
      const message = error?.message || "Failed to generate thumbnails";
      return res.status(500).json({ error: message });
    }
  });

  // Vite middleware in development vs static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
