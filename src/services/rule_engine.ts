import {
  ContentModerationRequest,
  ModerationFlag,
  ModerationRule,
  SeverityLevel,
  PlatformType
} from '../types/content_moderation';

export class RuleEngine {
  private rules: ModerationRule[];

  constructor(rules: ModerationRule[] = []) {
    this.rules = rules;
  }

  async check_rules(request: ContentModerationRequest): Promise<ModerationFlag[]> {
    const flags: ModerationFlag[] = [];

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      // Check if rule applies to this platform
      if (!rule.platforms.includes(request.platform)) continue;

      const rule_flags = this.check_single_rule(request, rule);
      flags.push(...rule_flags);
    }

    return flags;
  }

  private check_single_rule(request: ContentModerationRequest, rule: ModerationRule): ModerationFlag[] {
    const flags: ModerationFlag[] = [];
    const lower_content = request.content.toLowerCase();

    for (const pattern of rule.patterns) {
      // Check if pattern is a regex or simple string
      let is_match = false;
      let matched_text = '';

      if (pattern.startsWith('/') && pattern.endsWith('/')) {
        // Treat as regex
        try {
          const regex = new RegExp(pattern.slice(1, -1), 'gi');
          const matches = request.content.match(regex);
          if (matches) {
            is_match = true;
            matched_text = matches.join(', ');
          }
        } catch (error) {
          console.warn(`Invalid regex pattern: ${pattern}`);
          continue;
        }
      } else {
        // Treat as simple string
        if (lower_content.includes(pattern.toLowerCase())) {
          is_match = true;
          matched_text = pattern;
        }
      }

      if (is_match) {
        flags.push({
          type: `custom_rule_${rule.id}`,
          severity: rule.severity,
          confidence: 0.8, // Default confidence for custom rules
          description: rule.description,
          flagged_text: matched_text,
          suggestion: `Content matches rule: ${rule.name}`
        });
      }
    }

    return flags;
  }

  update_rules(new_rules: ModerationRule[]): void {
    this.rules = new_rules;
  }

  add_rule(rule: ModerationRule): void {
    this.rules.push(rule);
  }

  remove_rule(rule_id: string): boolean {
    const initial_length = this.rules.length;
    this.rules = this.rules.filter(rule => rule.id !== rule_id);
    return this.rules.length < initial_length;
  }

  get_rule(rule_id: string): ModerationRule | undefined {
    return this.rules.find(rule => rule.id === rule_id);
  }

  get_all_rules(): ModerationRule[] {
    return [...this.rules];
  }

  enable_rule(rule_id: string): boolean {
    const rule = this.get_rule(rule_id);
    if (rule) {
      rule.enabled = true;
      return true;
    }
    return false;
  }

  disable_rule(rule_id: string): boolean {
    const rule = this.get_rule(rule_id);
    if (rule) {
      rule.enabled = false;
      return true;
    }
    return false;
  }

  get_rules_for_platform(platform: PlatformType): ModerationRule[] {
    return this.rules.filter(rule => rule.platforms.includes(platform));
  }

  get_enabled_rules(): ModerationRule[] {
    return this.rules.filter(rule => rule.enabled);
  }
} 