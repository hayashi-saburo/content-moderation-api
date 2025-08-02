import { SentimentAnalysisResult } from '../types/content_moderation';

const Sentiment = require('sentiment');

export class SentimentAnalyzer {
  private analyzer: any;

  constructor() {
    this.analyzer = new Sentiment();
    this.setup_custom_analysis();
  }

  private setup_custom_analysis(): void {
    // Add custom positive words for business context
    this.analyzer.registerLanguage('en', {
      labels: {
        'innovative': 2,
        'successful': 2,
        'growth': 2,
        'opportunity': 2,
        'solution': 1,
        'improve': 1,
        'excellent': 2,
        'amazing': 2,
        'great': 1,
        'good': 1,
        'positive': 1,
        'benefit': 1,
        'advantage': 1,
        'efficient': 1,
        'effective': 1,
        'reliable': 1,
        'secure': 1,
        'fast': 1,
        'easy': 1,
        'simple': 1
      }
    });
  }

  async analyze(content: string): Promise<SentimentAnalysisResult> {
    const result = this.analyzer.analyze(content);

    return {
      score: result.score,
      comparative: result.comparative,
      tokens: result.tokens,
      words: result.words,
      positive: result.positive,
      negative: result.negative
    };
  }

  get_sentiment_category(score: number): string {
    if (score > 2) return 'very_positive';
    if (score > 0) return 'positive';
    if (score === 0) return 'neutral';
    if (score > -2) return 'negative';
    return 'very_negative';
  }

  is_overly_negative(score: number): boolean {
    return score < -3;
  }

  is_overly_positive(score: number): boolean {
    return score > 5;
  }

  get_sentiment_confidence(score: number): number {
    // Higher confidence for more extreme scores
    return Math.min(Math.abs(score) / 10, 1.0);
  }
} 