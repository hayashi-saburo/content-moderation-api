export interface PersonalInfoCheckResult {
  has_personal_info: boolean;
  confidence: number;
  detected_info: string[];
  info_types: string[];
}

export class PersonalInfoDetector {
  private email_pattern!: RegExp;
  private phone_patterns!: RegExp[];
  private ssn_pattern!: RegExp;
  private credit_card_pattern!: RegExp;
  private address_patterns!: RegExp[];
  private name_patterns!: RegExp[];

  constructor() {
    this.initialize_patterns();
  }

  private initialize_patterns(): void {
    // Email pattern
    this.email_pattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

    // Phone number patterns
    this.phone_patterns = [
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // 123-456-7890 or 123.456.7890
      /\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b/g, // (123) 456-7890
      /\b\+\d{1,3}\s?\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // +1 123-456-7890
      /\b\d{10,11}\b/g // 10-11 digit numbers
    ];

    // Social Security Number pattern
    this.ssn_pattern = /\b\d{3}-\d{2}-\d{4}\b/g;

    // Credit card pattern
    this.credit_card_pattern = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g;

    // Address patterns
    this.address_patterns = [
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/gi,
      /\b[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\s+\d+\b/gi
    ];

    // Name patterns (basic)
    this.name_patterns = [
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, // First Last
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b/g // First Middle Last
    ];
  }

  async check(content: string): Promise<PersonalInfoCheckResult> {
    const detected_info: string[] = [];
    const info_types: string[] = [];
    let confidence = 0;

    // Check for emails
    const emails = content.match(this.email_pattern);
    if (emails) {
      detected_info.push(...emails);
      info_types.push('email');
      confidence = Math.max(confidence, 0.9);
    }

    // Check for phone numbers
    for (const pattern of this.phone_patterns) {
      const phones = content.match(pattern);
      if (phones) {
        detected_info.push(...phones);
        if (!info_types.includes('phone')) {
          info_types.push('phone');
        }
        confidence = Math.max(confidence, 0.8);
      }
    }

    // Check for SSN
    const ssns = content.match(this.ssn_pattern);
    if (ssns) {
      detected_info.push(...ssns);
      info_types.push('ssn');
      confidence = Math.max(confidence, 0.95);
    }

    // Check for credit cards
    const credit_cards = content.match(this.credit_card_pattern);
    if (credit_cards) {
      detected_info.push(...credit_cards);
      info_types.push('credit_card');
      confidence = Math.max(confidence, 0.9);
    }

    // Check for addresses
    for (const pattern of this.address_patterns) {
      const addresses = content.match(pattern);
      if (addresses) {
        detected_info.push(...addresses);
        if (!info_types.includes('address')) {
          info_types.push('address');
        }
        confidence = Math.max(confidence, 0.7);
      }
    }

    // Check for names (lower confidence as names are common)
    for (const pattern of this.name_patterns) {
      const names = content.match(pattern);
      if (names) {
        // Only flag if there are multiple names or other personal info
        if (names.length > 1 || detected_info.length > 0) {
          detected_info.push(...names);
          if (!info_types.includes('name')) {
            info_types.push('name');
          }
          confidence = Math.max(confidence, 0.6);
        }
      }
    }

    // Check for common personal info keywords
    const personal_keywords = [
      'password', 'pin', 'account number', 'routing number',
      'date of birth', 'birthday', 'ssn', 'social security',
      'driver license', 'passport', 'id number'
    ];

    for (const keyword of personal_keywords) {
      if (content.toLowerCase().includes(keyword)) {
        info_types.push('personal_keyword');
        confidence = Math.max(confidence, 0.5);
      }
    }

    return {
      has_personal_info: detected_info.length > 0,
      confidence,
      detected_info: [...new Set(detected_info)], // Remove duplicates
      info_types: [...new Set(info_types)]
    };
  }

  add_pattern(pattern: RegExp, type: string): void {
    switch (type) {
      case 'phone':
        this.phone_patterns.push(pattern);
        break;
      case 'address':
        this.address_patterns.push(pattern);
        break;
      case 'name':
        this.name_patterns.push(pattern);
        break;
    }
  }

  get_detection_threshold(): number {
    return 0.5;
  }

  set_detection_threshold(threshold: number): void {
    console.log(`Personal info detection threshold set to: ${threshold}`);
  }
} 