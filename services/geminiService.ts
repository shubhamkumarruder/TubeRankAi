import { SeoInputData, SeoOutputData, SocialInputData, SocialOutputData } from "../types";

export const generateSeoContent = async (input: SeoInputData): Promise<SeoOutputData> => {
  try {
    const response = await fetch("/api/seo/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    return data as SeoOutputData;
  } catch (error: any) {
    console.error("Error generating SEO content:", error);
    throw error;
  }
};

export const generateSocialContent = async (input: SocialInputData): Promise<SocialOutputData> => {
  try {
    const response = await fetch("/api/social/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    return data as SocialOutputData;
  } catch (error: any) {
    console.error("Error generating Social content:", error);
    throw error;
  }
};

export const generateThumbnailImages = async (
  prompt: string,
  aspectRatio: "16:9" | "9:16"
): Promise<string[]> => {
  try {
    const response = await fetch("/api/thumbnails/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, aspectRatio }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
      throw new Error("No images were generated.");
    }

    return data.images as string[];
  } catch (error: any) {
    console.error("Error generating thumbnails:", error);
    throw error;
  }
};
