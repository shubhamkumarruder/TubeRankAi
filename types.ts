
export enum YouTubeCategory {
  GENERAL = 'General / All Categories',
  ENTERTAINMENT = 'Entertainment',
  EDUCATION = 'Education',
  HOWTO = 'How-to & Style',
  TECH = 'Science & Technology',
  GAMING = 'Gaming',
  PEOPLE_BLOGS = 'People & Blogs',
  COMEDY = 'Comedy',
  MUSIC = 'Music',
  NEWS = 'News & Politics',
  SPORTS = 'Sports',
  TRAVEL = 'Travel & Events',
  FILM = 'Film & Animation',
  AUTOS = 'Autos & Vehicles',
}

export interface SeoInputData {
  topic: string;
  category?: string;
  mainKeyword: string;
  secondaryKeywords: string;
  language: string;
  tone: string;
  videoFormat: string;
  useSearchGrounding?: boolean;
}

export interface SeoOutputData {
  category?: string;
  titles: string[];
  descriptions: string[];
  tags: string[];
  hashtags?: string[];
  thumbnailText: string;
  thumbnailPrompt: string;
  fileName: string;
  isGrounded?: boolean;
  groundingSources?: Array<{ title: string; uri: string }>;
}

export interface SocialInputData {
  platform: SocialPlatform;
  topic: string;
  keywords?: string;
  tone: string;
}

export interface SocialOutputData {
  platform: SocialPlatform;
  // Blog specific
  blogTitle?: string;
  metaDescription?: string;
  blogContent?: string;
  // Instagram specific
  caption?: string;
  hashtags?: string[];
  storyContent?: string;
  thumbnailPrompt?: string;
}

export interface GeneratedImage {
  url: string;
  loading: boolean;
  error?: string;
}

export enum Tone {
  PROFESSIONAL = 'Professional',
  EMOTIONAL = 'Emotional',
  VIRAL = 'Viral',
  EDUCATIONAL = 'Educational',
}

export enum Language {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  HINGLISH = 'Hinglish',
}

export enum VideoFormat {
  LONG = 'Long Form',
  SHORT = 'YouTube Shorts',
}

export enum AppMode {
  YOUTUBE = 'youtube',
  SOCIAL = 'social',
  SAVED = 'saved',
}

export enum SocialPlatform {
  BLOG = 'SEO Blog Post',
  INSTAGRAM = 'Instagram (Reels & Posts)',
}
