
export interface SeoInputData {
  topic: string;
  mainKeyword: string;
  secondaryKeywords: string;
  language: string;
  tone: string;
  videoFormat: string;
}

export interface SeoOutputData {
  titles: string[];
  descriptions: string[];
  tags: string[];
  thumbnailText: string;
  thumbnailPrompt: string;
  fileName: string;
}

export interface ChannelAuditData {
  channelName: string;
  subscribers: string;
  totalViews: string;
  videoCount: string;
  engagementRate: string;
  estimatedEarnings: string;
  // For "Watched vs Not Watched" visualization
  avgViewsPerVideo: number;
  subscriberCountNumber: number; 
  auditSummary: string;
  topPerformingContent: string[];
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
}

export enum VideoFormat {
  LONG = 'Long Form',
  SHORT = 'YouTube Shorts',
}

export enum AppMode {
  GENERATOR = 'generator',
  AUDIT = 'audit',
}
