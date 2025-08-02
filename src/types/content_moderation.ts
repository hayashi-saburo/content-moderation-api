export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio'
}

export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum PlatformType {
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  LINKEDIN = 'linkedin',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube'
}

export interface ContentModerationRequest {
  content: string;
  content_type: ContentType;
  platform: PlatformType;
  user_id?: string;
  metadata?: Record<string, any>;
}

export interface ModerationFlag {
  type: string;
  severity: SeverityLevel;
  confidence: number;
  description: string;
  flagged_text?: string;
  suggestion?: string;
}

export interface ContentModerationResponse {
  is_flagged: boolean;
  flags: ModerationFlag[];
  overall_severity: SeverityLevel;
  confidence_score: number;
  safe_to_post: boolean;
  recommendations: string[];
  processing_time_ms: number;
}

export interface ModerationRule {
  id: string;
  name: string;
  description: string;
  patterns: string[];
  severity: SeverityLevel;
  enabled: boolean;
  platforms: PlatformType[];
}

export interface ModerationConfig {
  rules: ModerationRule[];
  sensitivity_threshold: number;
  enable_sentiment_analysis: boolean;
  enable_profanity_detection: boolean;
  enable_toxicity_detection: boolean;
  enable_spam_detection: boolean;
  enable_hate_speech_detection: boolean;
  enable_violence_detection: boolean;
  enable_sexual_content_detection: boolean;
  enable_personal_info_detection: boolean;
}

export interface SentimentAnalysisResult {
  score: number;
  comparative: number;
  tokens: string[];
  words: string[];
  positive: string[];
  negative: string[];
}

export interface ProfanityCheckResult {
  is_profane: boolean;
  profane_words: string[];
  clean_text: string;
}

export interface ToxicityCheckResult {
  is_toxic: boolean;
  toxicity_score: number;
  categories: Record<string, number>;
} 