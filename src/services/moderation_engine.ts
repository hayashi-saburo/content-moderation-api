import {
  ContentModerationRequest,
  ContentModerationResponse,
  ModerationFlag,
  SeverityLevel,
  ContentType,
  PlatformType,
  ModerationConfig,
  SentimentAnalysisResult,
  ProfanityCheckResult,
  ToxicityCheckResult
} from '../types/content_moderation';
import { NOTIFICATION_MESSAGES } from '../constants/notifications';
import { ProfanityDetector } from '../services/profanity_detector';
import { SentimentAnalyzer } from '../services/sentiment_analyzer';
import { ToxicityDetector } from '../services/toxicity_detector';
import { SpamDetector } from '../services/spam_detector';
import { PersonalInfoDetector } from '../services/personal_info_detector';
import { RuleEngine } from '../services/rule_engine';

export class ModerationEngine {
  private profanity_detector: ProfanityDetector;
  private sentiment_analyzer: SentimentAnalyzer;
  private toxicity_detector: ToxicityDetector;
  private spam_detector: SpamDetector;
  private personal_info_detector: PersonalInfoDetector;
  private rule_engine: RuleEngine;
  private config: ModerationConfig;

  constructor(config: ModerationConfig) {
    this.config = config;
    this.profanity_detector = new ProfanityDetector();
    this.sentiment_analyzer = new SentimentAnalyzer();
    this.toxicity_detector = new ToxicityDetector();
    this.spam_detector = new SpamDetector();
    this.personal_info_detector = new PersonalInfoDetector();
    this.rule_engine = new RuleEngine(config.rules);
  }

  async moderate_content(request: ContentModerationRequest): Promise<ContentModerationResponse> {
    const start_time = Date.now();

    try {
      // Validate request
      this.validate_request(request);

      const flags: ModerationFlag[] = [];

      // Run all enabled moderation checks
      if (this.config.enable_profanity_detection) {
        const profanity_result = await this.profanity_detector.check(request.content);
        if (profanity_result.is_profane) {
          flags.push({
            type: 'profanity',
            severity: SeverityLevel.MEDIUM,
            confidence: 0.9,
            description: NOTIFICATION_MESSAGES.PROFANITY_DETECTED,
            flagged_text: profanity_result.profane_words.join(', '),
            suggestion: NOTIFICATION_MESSAGES.RECOMMEND_EDIT
          });
        }
      }

      if (this.config.enable_sentiment_analysis) {
        const sentiment_result = await this.sentiment_analyzer.analyze(request.content);
        if (sentiment_result.comparative < -0.3) {
          flags.push({
            type: 'negative_sentiment',
            severity: SeverityLevel.LOW,
            confidence: Math.abs(sentiment_result.comparative),
            description: NOTIFICATION_MESSAGES.NEGATIVE_SENTIMENT,
            suggestion: NOTIFICATION_MESSAGES.RECOMMEND_REVIEW
          });
        }
      }

      if (this.config.enable_toxicity_detection) {
        const toxicity_result = await this.toxicity_detector.check(request.content);
        if (toxicity_result.is_toxic) {
          flags.push({
            type: 'toxicity',
            severity: SeverityLevel.HIGH,
            confidence: toxicity_result.toxicity_score,
            description: NOTIFICATION_MESSAGES.TOXICITY_DETECTED,
            suggestion: NOTIFICATION_MESSAGES.RECOMMEND_REPLACE
          });
        }
      }

      if (this.config.enable_spam_detection) {
        const spam_result = await this.spam_detector.check(request.content);
        if (spam_result.is_spam) {
          flags.push({
            type: 'spam',
            severity: SeverityLevel.MEDIUM,
            confidence: spam_result.spam_score,
            description: NOTIFICATION_MESSAGES.SPAM_DETECTED,
            suggestion: NOTIFICATION_MESSAGES.RECOMMEND_EDIT
          });
        }
      }

      if (this.config.enable_personal_info_detection) {
        const personal_info_result = await this.personal_info_detector.check(request.content);
        if (personal_info_result.has_personal_info) {
          flags.push({
            type: 'personal_info',
            severity: SeverityLevel.HIGH,
            confidence: personal_info_result.confidence,
            description: NOTIFICATION_MESSAGES.PERSONAL_INFO_DETECTED,
            flagged_text: personal_info_result.detected_info.join(', '),
            suggestion: NOTIFICATION_MESSAGES.RECOMMEND_EDIT
          });
        }
      }

      // Run custom rules
      const rule_flags = await this.rule_engine.check_rules(request);
      flags.push(...rule_flags);

      // Check platform-specific rules
      const platform_flags = this.check_platform_rules(request);
      flags.push(...platform_flags);

      // Calculate overall severity and confidence
      const overall_severity = this.calculate_overall_severity(flags);
      const confidence_score = this.calculate_confidence_score(flags);
      const safe_to_post = this.determine_safe_to_post(flags, overall_severity);
      const recommendations = this.generate_recommendations(flags, request.platform);

      const processing_time_ms = Date.now() - start_time;

      return {
        is_flagged: flags.length > 0,
        flags,
        overall_severity,
        confidence_score,
        safe_to_post,
        recommendations,
        processing_time_ms
      };

    } catch (error) {
      throw new Error(`${NOTIFICATION_MESSAGES.MODERATION_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validate_request(request: ContentModerationRequest): void {
    if (!request.content || request.content.trim().length === 0) {
      throw new Error(NOTIFICATION_MESSAGES.CONTENT_EMPTY);
    }

    if (request.content.length > 10000) {
      throw new Error(NOTIFICATION_MESSAGES.CONTENT_TOO_LONG);
    }

    if (!Object.values(ContentType).includes(request.content_type)) {
      throw new Error(NOTIFICATION_MESSAGES.INVALID_CONTENT_TYPE);
    }

    if (!Object.values(PlatformType).includes(request.platform)) {
      throw new Error(NOTIFICATION_MESSAGES.INVALID_PLATFORM);
    }
  }

  private check_platform_rules(request: ContentModerationRequest): ModerationFlag[] {
    const flags: ModerationFlag[] = [];

    switch (request.platform) {
      case PlatformType.TWITTER:
        if (request.content.length > 280) {
          flags.push({
            type: 'character_limit',
            severity: SeverityLevel.LOW,
            confidence: 1.0,
            description: NOTIFICATION_MESSAGES.CHARACTER_LIMIT,
            suggestion: 'Consider shortening your post'
          });
        }
        break;

      case PlatformType.INSTAGRAM:
        const hashtag_count = (request.content.match(/#/g) || []).length;
        if (hashtag_count > 30) {
          flags.push({
            type: 'hashtag_limit',
            severity: SeverityLevel.LOW,
            confidence: 1.0,
            description: NOTIFICATION_MESSAGES.HASHTAG_LIMIT,
            suggestion: 'Reduce the number of hashtags'
          });
        }
        break;

      case PlatformType.LINKEDIN:
        const mention_count = (request.content.match(/@/g) || []).length;
        if (mention_count > 5) {
          flags.push({
            type: 'mention_limit',
            severity: SeverityLevel.LOW,
            confidence: 1.0,
            description: NOTIFICATION_MESSAGES.MENTION_LIMIT,
            suggestion: 'Reduce the number of mentions'
          });
        }
        break;
    }

    return flags;
  }

  private calculate_overall_severity(flags: ModerationFlag[]): SeverityLevel {
    if (flags.length === 0) return SeverityLevel.LOW;

    const severity_scores = {
      [SeverityLevel.LOW]: 1,
      [SeverityLevel.MEDIUM]: 2,
      [SeverityLevel.HIGH]: 3,
      [SeverityLevel.CRITICAL]: 4
    };

    const max_severity = flags.reduce((max, flag) => {
      return severity_scores[flag.severity] > severity_scores[max] ? flag.severity : max;
    }, SeverityLevel.LOW);

    return max_severity;
  }

  private calculate_confidence_score(flags: ModerationFlag[]): number {
    if (flags.length === 0) return 1.0;

    const total_confidence = flags.reduce((sum, flag) => sum + flag.confidence, 0);
    return total_confidence / flags.length;
  }

  private determine_safe_to_post(flags: ModerationFlag[], overall_severity: SeverityLevel): boolean {
    // Don't allow posting if there are critical or high severity flags
    if (overall_severity === SeverityLevel.CRITICAL || overall_severity === SeverityLevel.HIGH) {
      return false;
    }

    // Allow posting for low and medium severity flags (user should review)
    return true;
  }

  private generate_recommendations(flags: ModerationFlag[], platform: PlatformType): string[] {
    const recommendations: string[] = [];

    if (flags.length === 0) {
      recommendations.push(NOTIFICATION_MESSAGES.CONTENT_SAFE);
      return recommendations;
    }

    // Add general recommendations based on flags
    if (flags.some(f => f.severity === SeverityLevel.CRITICAL || f.severity === SeverityLevel.HIGH)) {
      recommendations.push(NOTIFICATION_MESSAGES.RECOMMEND_REPLACE);
    } else if (flags.some(f => f.severity === SeverityLevel.MEDIUM)) {
      recommendations.push(NOTIFICATION_MESSAGES.RECOMMEND_EDIT);
    } else {
      recommendations.push(NOTIFICATION_MESSAGES.RECOMMEND_REVIEW);
    }

    // Add platform-specific recommendations
    switch (platform) {
      case PlatformType.TWITTER:
        recommendations.push('Consider using Twitter\'s built-in content warnings for sensitive topics');
        break;
      case PlatformType.INSTAGRAM:
        recommendations.push('Use Instagram\'s content filters and moderation tools');
        break;
      case PlatformType.LINKEDIN:
        recommendations.push('Ensure content aligns with LinkedIn\'s professional community guidelines');
        break;
    }

    return recommendations;
  }

  update_config(new_config: ModerationConfig): void {
    this.config = new_config;
    this.rule_engine.update_rules(new_config.rules);
  }

  get_config(): ModerationConfig {
    return this.config;
  }
} 