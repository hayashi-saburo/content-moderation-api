import { ToxicityCheckResult } from '../types/content_moderation';

export class ToxicityDetector {
  private toxic_patterns: Map<string, number>;
  private hate_speech_patterns: string[];
  private violence_patterns: string[];
  private sexual_content_patterns: string[];

  constructor() {
    this.toxic_patterns = new Map();
    this.hate_speech_patterns = [];
    this.violence_patterns = [];
    this.sexual_content_patterns = [];
    this.initialize_patterns();
  }

  private initialize_patterns(): void {
    // Toxic words and phrases with confidence scores
    this.toxic_patterns.set('kill yourself', 0.9);
    this.toxic_patterns.set('you should die', 0.9);
    this.toxic_patterns.set('i hope you die', 0.9);
    this.toxic_patterns.set('go to hell', 0.7);
    this.toxic_patterns.set('fuck you', 0.8);
    this.toxic_patterns.set('you are stupid', 0.6);
    this.toxic_patterns.set('you are dumb', 0.6);
    this.toxic_patterns.set('you are an idiot', 0.7);
    this.toxic_patterns.set('shut up', 0.5);
    this.toxic_patterns.set('nobody cares', 0.5);
    this.toxic_patterns.set('you are worthless', 0.8);
    this.toxic_patterns.set('you are useless', 0.7);

    // Hate speech patterns
    this.hate_speech_patterns = [
      'all [a-z]+ are',
      'every [a-z]+ is',
      'typical [a-z]+',
      'you people',
      'those people',
      'go back to',
      'you don\'t belong',
      'you are not welcome'
    ];

    // Violence patterns
    this.violence_patterns = [
      'i will kill',
      'i want to kill',
      'i should kill',
      'punch you',
      'hit you',
      'beat you',
      'attack you',
      'hurt you',
      'destroy you',
      'burn you',
      'shoot you',
      'stab you'
    ];

    // Sexual content patterns
    this.sexual_content_patterns = [
      'nude',
      'naked',
      'porn',
      'sex',
      'sexual',
      'intimate',
      'explicit',
      'adult content',
      'mature content'
    ];
  }

  async check(content: string): Promise<ToxicityCheckResult> {
    const lower_content = content.toLowerCase();
    let max_toxicity_score = 0;
    const categories: Record<string, number> = {
      general_toxicity: 0,
      hate_speech: 0,
      violence: 0,
      sexual_content: 0
    };

    // Check general toxic patterns
    for (const [pattern, confidence] of this.toxic_patterns) {
      if (lower_content.includes(pattern)) {
        categories.general_toxicity = Math.max(categories.general_toxicity, confidence);
        max_toxicity_score = Math.max(max_toxicity_score, confidence);
      }
    }

    // Check hate speech patterns
    for (const pattern of this.hate_speech_patterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(content)) {
        categories.hate_speech = Math.max(categories.hate_speech, 0.8);
        max_toxicity_score = Math.max(max_toxicity_score, 0.8);
      }
    }

    // Check violence patterns
    for (const pattern of this.violence_patterns) {
      if (lower_content.includes(pattern)) {
        categories.violence = Math.max(categories.violence, 0.9);
        max_toxicity_score = Math.max(max_toxicity_score, 0.9);
      }
    }

    // Check sexual content patterns
    for (const pattern of this.sexual_content_patterns) {
      if (lower_content.includes(pattern)) {
        categories.sexual_content = Math.max(categories.sexual_content, 0.7);
        max_toxicity_score = Math.max(max_toxicity_score, 0.7);
      }
    }

    // Check for excessive caps (shouting)
    const caps_ratio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (caps_ratio > 0.7 && content.length > 10) {
      categories.general_toxicity = Math.max(categories.general_toxicity, 0.3);
      max_toxicity_score = Math.max(max_toxicity_score, 0.3);
    }

    // Check for excessive punctuation
    const exclamation_count = (content.match(/!/g) || []).length;
    const question_count = (content.match(/\?/g) || []).length;
    if (exclamation_count > 3 || question_count > 5) {
      categories.general_toxicity = Math.max(categories.general_toxicity, 0.2);
      max_toxicity_score = Math.max(max_toxicity_score, 0.2);
    }

    return {
      is_toxic: max_toxicity_score > 0.5,
      toxicity_score: max_toxicity_score,
      categories
    };
  }

  add_toxic_pattern(pattern: string, confidence: number): void {
    this.toxic_patterns.set(pattern.toLowerCase(), confidence);
  }

  add_hate_speech_pattern(pattern: string): void {
    this.hate_speech_patterns.push(pattern);
  }

  add_violence_pattern(pattern: string): void {
    this.violence_patterns.push(pattern);
  }

  add_sexual_content_pattern(pattern: string): void {
    this.sexual_content_patterns.push(pattern);
  }

  get_toxicity_threshold(): number {
    return 0.5;
  }

  set_toxicity_threshold(threshold: number): void {
    // This would be used to adjust sensitivity
    console.log(`Toxicity threshold set to: ${threshold}`);
  }
} 