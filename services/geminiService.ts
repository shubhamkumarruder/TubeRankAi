
import { GoogleGenAI, Type } from "@google/genai";
import { SeoInputData, SeoOutputData, VideoFormat, ChannelAuditData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSeoContent = async (input: SeoInputData): Promise<SeoOutputData> => {
  const isShorts = input.videoFormat === VideoFormat.SHORT;
  
  const prompt = `
    You are an elite YouTube SEO Strategist.
    
    STEP 1: ANALYZE
    Topic: "${input.topic}"
    Format: ${input.videoFormat} (Important: ${isShorts ? 'Optimize for Shorts Feed (Vertical, <60s)' : 'Optimize for Search/Browse (Horizontal)'})
    Keywords: "${input.mainKeyword}", "${input.secondaryKeywords}"
    Language: ${input.language}
    Tone: ${input.tone}

    STEP 2: GENERATE JSON
    Return a JSON object:

    1. titles: Array of 3 strings. Under 60 chars. High CTR.
    2. descriptions: Array of 2 strings.
       - Include 3-5 viral HASHTAGS at the end.
       - Format with line breaks and emojis.
    3. tags: Array of strings. Total length MUST be under 500 chars.
    4. thumbnailText: Short text overlay (max 5 words).
    5. thumbnailPrompt: Highly descriptive image prompt. ${isShorts ? 'Vertical composition (9:16), centered subject, big faces.' : 'Wide cinematic composition (16:9), high contrast.'}
    6. fileName: Hyphenated-seo-filename.

    Return ONLY raw JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titles: { type: Type.ARRAY, items: { type: Type.STRING } },
            descriptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            thumbnailText: { type: Type.STRING },
            thumbnailPrompt: { type: Type.STRING },
            fileName: { type: Type.STRING }
          },
          required: ["titles", "descriptions", "tags", "thumbnailText", "thumbnailPrompt", "fileName"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data returned from Gemini");
    
    return JSON.parse(text) as SeoOutputData;

  } catch (error) {
    console.error("Error generating SEO content:", error);
    throw error;
  }
};

export const auditChannel = async (channelUrl: string): Promise<ChannelAuditData> => {
    const prompt = `
      Audit this YouTube channel: "${channelUrl}".
      
      CRITICAL INSTRUCTION: Use Google Search to find the channel's subscriber count, total views, and video count.
      
      Calculate:
      - Average Views = Total Views / Video Count (Approximate).
      - Engagement Rate = Qualitatively assess based on comments/likes found in search snippets.
      
      Return JSON format matching the schema.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              channelName: { type: Type.STRING },
              subscribers: { type: Type.STRING },
              subscriberCountNumber: { type: Type.NUMBER },
              totalViews: { type: Type.STRING },
              videoCount: { type: Type.STRING },
              avgViewsPerVideo: { type: Type.NUMBER },
              engagementRate: { type: Type.STRING },
              estimatedEarnings: { type: Type.STRING },
              auditSummary: { type: Type.STRING },
              topPerformingContent: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["channelName", "subscribers", "subscriberCountNumber", "totalViews", "videoCount", "avgViewsPerVideo", "engagementRate", "estimatedEarnings", "auditSummary", "topPerformingContent"]
          }
        }
      });
  
      const text = response.text;
      if (!text) throw new Error("No data returned from Gemini Audit");
      return JSON.parse(text) as ChannelAuditData;
    } catch (error) {
      console.error("Error auditing channel:", error);
      throw error;
    }
};

export const generateThumbnailImages = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<string[]> => {
  // Using gemini-2.5-flash-image (Nano Banana)
  const generateOne = async (index: number): Promise<string> => {
    try {
      const variations = [
        "Hyper-realistic, intense expression, bright lighting",
        "Illustrated style, vibrant colors, vector art",
        "Close-up shot, high contrast, dramatic shadows",
        "Wide angle, detailed background, 4k cinematic"
      ];
      
      const specificStyle = variations[index % variations.length];
      const fullPrompt = `Create a YouTube Thumbnail. ${prompt}. Style: ${specificStyle}. Aspect Ratio ${aspectRatio}. High Quality, 4k resolution.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      
      throw new Error("No image data found in response");
    } catch (e) {
      console.error(`Image generation failed for index ${index}`, e);
      throw e;
    }
  };

  const promises = [0, 1, 2, 3].map(num => generateOne(num));
  const results = await Promise.allSettled(promises);

  const images = results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
    .map(r => r.value);

  if (images.length === 0) {
    throw new Error(`Failed to generate thumbnails.`);
  }

  return images;
};
