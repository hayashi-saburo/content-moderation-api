export interface SpamCheckResult {
  is_spam: boolean;
  spam_score: number;
  spam_indicators: string[];
  clean_content: string;
}

export class SpamDetector {
  private spam_patterns: Map<string, number>;
  private url_patterns: RegExp[];
  private excessive_patterns: Map<string, number>;

  constructor() {
    this.spam_patterns = new Map();
    this.url_patterns = [];
    this.excessive_patterns = new Map();
    this.initialize_patterns();
  }

  private initialize_patterns(): void {
    // Common spam phrases with confidence scores
    this.spam_patterns.set('buy now', 0.7);
    this.spam_patterns.set('limited time offer', 0.8);
    this.spam_patterns.set('act now', 0.7);
    this.spam_patterns.set('don\'t miss out', 0.6);
    this.spam_patterns.set('click here', 0.6);
    this.spam_patterns.set('free money', 0.9);
    this.spam_patterns.set('make money fast', 0.9);
    this.spam_patterns.set('work from home', 0.7);
    this.spam_patterns.set('earn money online', 0.8);
    this.spam_patterns.set('get rich quick', 0.9);
    this.spam_patterns.set('lose weight fast', 0.8);
    this.spam_patterns.set('miracle cure', 0.9);
    this.spam_patterns.set('100% guaranteed', 0.8);
    this.spam_patterns.set('no risk', 0.7);
    this.spam_patterns.set('limited supply', 0.7);
    this.spam_patterns.set('exclusive offer', 0.6);
    this.spam_patterns.set('secret method', 0.8);
    this.spam_patterns.set('government secret', 0.9);
    this.spam_patterns.set('bankruptcy', 0.7);
    this.spam_patterns.set('debt relief', 0.7);
    this.spam_patterns.set('credit repair', 0.7);
    this.spam_patterns.set('investment opportunity', 0.6);
    this.spam_patterns.set('hot singles', 0.9);
    this.spam_patterns.set('meet singles', 0.8);
    this.spam_patterns.set('enlarge your', 0.9);
    this.spam_patterns.set('viagra', 0.9);
    this.spam_patterns.set('cialis', 0.9);

    // URL patterns
    this.url_patterns = [
      /https?:\/\/[^\s]+/g,
      /www\.[^\s]+/g,
      /bit\.ly\/[^\s]+/g,
      /tinyurl\.com\/[^\s]+/g,
      /goo\.gl\/[^\s]+/g
    ];

    // Excessive patterns
    this.excessive_patterns.set('!', 0.3);
    this.excessive_patterns.set('?', 0.2);
    this.excessive_patterns.set('$', 0.4);
    this.excessive_patterns.set('FREE', 0.5);
    this.excessive_patterns.set('FREE', 0.5);
    this.excessive_patterns.set('URGENT', 0.6);
    this.excessive_patterns.set('IMPORTANT', 0.4);
  }

  async check(content: string): Promise<SpamCheckResult> {
    const lower_content = content.toLowerCase();
    let spam_score = 0;
    const spam_indicators: string[] = [];

    // Check for spam phrases
    for (const [pattern, confidence] of this.spam_patterns) {
      if (lower_content.includes(pattern)) {
        spam_score += confidence;
        spam_indicators.push(`Spam phrase: "${pattern}"`);
      }
    }

    // Check for excessive URLs
    const url_count = this.count_urls(content);
    if (url_count > 2) {
      spam_score += 0.5 * url_count;
      spam_indicators.push(`Multiple URLs detected: ${url_count}`);
    }

    // Check for excessive caps
    const caps_ratio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (caps_ratio > 0.5 && content.length > 20) {
      spam_score += 0.4;
      spam_indicators.push('Excessive capitalization');
    }

    // Check for excessive punctuation
    const exclamation_count = (content.match(/!/g) || []).length;
    const question_count = (content.match(/\?/g) || []).length;
    if (exclamation_count > 2 || question_count > 3) {
      spam_score += 0.3;
      spam_indicators.push('Excessive punctuation');
    }

    // Check for repetitive words
    const words = content.toLowerCase().split(/\s+/);
    const word_frequency = new Map<string, number>();
    for (const word of words) {
      if (word.length > 3) {
        word_frequency.set(word, (word_frequency.get(word) || 0) + 1);
      }
    }

    for (const [word, count] of word_frequency) {
      if (count > 3) {
        spam_score += 0.2;
        spam_indicators.push(`Repetitive word: "${word}" (${count} times)`);
      }
    }

    // Check for suspicious patterns
    if (this.has_suspicious_patterns(content)) {
      spam_score += 0.6;
      spam_indicators.push('Suspicious patterns detected');
    }

    // Normalize spam score
    spam_score = Math.min(spam_score, 1.0);

    return {
      is_spam: spam_score > 0.6,
      spam_score,
      spam_indicators,
      clean_content: this.clean_content(content)
    };
  }

  private count_urls(content: string): number {
    let url_count = 0;
    for (const pattern of this.url_patterns) {
      const matches = content.match(pattern);
      if (matches) {
        url_count += matches.length;
      }
    }
    return url_count;
  }

  private has_suspicious_patterns(content: string): boolean {
    const suspicious_patterns = [
      /\d{4}-\d{4}-\d{4}-\d{4}/, // Credit card pattern
      /\d{3}-\d{2}-\d{4}/, // SSN pattern
      /\d{10,}/, // Long number sequences
      /[A-Z]{5,}/, // All caps words
      /\$\d+/, // Dollar amounts
      /%\d+/, // Percentage
      /free\s+[a-z]+/i, // Free + word
      /limited\s+time/i, // Limited time
      /act\s+now/i, // Act now
      /click\s+here/i, // Click here
      /buy\s+now/i // Buy now
    ];

    return suspicious_patterns.some(pattern => pattern.test(content));
  }

  private clean_content(content: string): string {
    // Remove URLs
    let clean_content = content;
    for (const pattern of this.url_patterns) {
      clean_content = clean_content.replace(pattern, '[URL]');
    }

    // Remove excessive punctuation
    clean_content = clean_content.replace(/!{2,}/g, '!');
    clean_content = clean_content.replace(/\?{2,}/g, '?');

    return clean_content.trim();
  }

  add_spam_pattern(pattern: string, confidence: number): void {
    this.spam_patterns.set(pattern.toLowerCase(), confidence);
  }

  add_url_pattern(pattern: RegExp): void {
    this.url_patterns.push(pattern);
  }

  get_spam_threshold(): number {
    return 0.6;
  }

  set_spam_threshold(threshold: number): void {
    console.log(`Spam threshold set to: ${threshold}`);
  }
} 