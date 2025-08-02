import { ProfanityCheckResult } from '../types/content_moderation';

const BadWordsFilter = require('bad-words');

export class ProfanityDetector {
  private filter: any;

  constructor() {
    this.filter = new BadWordsFilter();
    this.setup_custom_words();
  }

  private setup_custom_words(): void {
    // Add custom words that might be flagged as profanity but are acceptable in certain contexts
    this.filter.removeWords('hell', 'damn', 'ass', 'bitch', 'piss', 'shit');

    // Add industry-specific terms that might be flagged
    this.filter.removeWords('analytics', 'analysis', 'assistant', 'class', 'function');
  }

  async check(content: string): Promise<ProfanityCheckResult> {
    const clean_content = this.filter.clean(content);
    const is_profane = clean_content !== content;

    // Extract profane words by comparing original and cleaned content
    const profane_words: string[] = [];
    if (is_profane) {
      // Simple approach: check for common profane words
      const common_profane = ['fuck', 'shit', 'bitch', 'ass', 'damn', 'hell'];
      for (const word of common_profane) {
        if (content.toLowerCase().includes(word)) {
          profane_words.push(word);
        }
      }
    }

    return {
      is_profane,
      profane_words,
      clean_text: clean_content
    };
  }

  add_words(words: string[]): void {
    this.filter.addWords(...words);
  }

  remove_words(words: string[]): void {
    this.filter.removeWords(...words);
  }

  get_filtered_words(): string[] {
    // Return empty array since we can't access the internal list
    return [];
  }
} 