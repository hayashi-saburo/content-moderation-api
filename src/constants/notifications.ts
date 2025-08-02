export const NOTIFICATION_MESSAGES = {
  // API Response Messages
  CONTENT_FLAGGED: 'Content has been flagged for moderation',
  CONTENT_SAFE: 'Content appears to be safe for posting',
  INVALID_REQUEST: 'Invalid request format',
  SERVER_ERROR: 'Internal server error occurred',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded, please try again later',
  
  // Moderation Specific Messages
  PROFANITY_DETECTED: 'Profanity detected in content',
  TOXICITY_DETECTED: 'Toxic content detected',
  HATE_SPEECH_DETECTED: 'Hate speech content detected',
  VIOLENCE_DETECTED: 'Violent content detected',
  SEXUAL_CONTENT_DETECTED: 'Sexual content detected',
  PERSONAL_INFO_DETECTED: 'Personal information detected',
  SPAM_DETECTED: 'Spam-like content detected',
  NEGATIVE_SENTIMENT: 'Content has negative sentiment',
  
  // Recommendations
  RECOMMEND_REVIEW: 'Please review content before posting',
  RECOMMEND_EDIT: 'Consider editing content to remove flagged elements',
  RECOMMEND_REPLACE: 'Consider replacing flagged content',
  RECOMMEND_DELAY: 'Consider delaying post due to content concerns',
  
  // Platform Specific
  PLATFORM_VIOLATION: 'Content may violate platform guidelines',
  CHARACTER_LIMIT: 'Content exceeds character limit',
  HASHTAG_LIMIT: 'Too many hashtags detected',
  MENTION_LIMIT: 'Too many mentions detected',
  
  // Success Messages
  MODERATION_COMPLETE: 'Content moderation completed successfully',
  RULE_UPDATED: 'Moderation rule updated successfully',
  CONFIG_UPDATED: 'Configuration updated successfully',
  
  // Error Messages
  MODERATION_FAILED: 'Content moderation failed',
  RULE_NOT_FOUND: 'Moderation rule not found',
  CONFIG_INVALID: 'Invalid configuration provided',
  CONTENT_TOO_LONG: 'Content is too long for analysis',
  CONTENT_EMPTY: 'Content cannot be empty',
  
  // Validation Messages
  INVALID_CONTENT_TYPE: 'Invalid content type specified',
  INVALID_PLATFORM: 'Invalid platform specified',
  INVALID_SEVERITY: 'Invalid severity level specified',
  INVALID_CONFIDENCE: 'Invalid confidence score provided',
  
  // System Messages
  SERVICE_STARTED: 'Content moderation service started',
  SERVICE_STOPPED: 'Content moderation service stopped',
  HEALTH_CHECK: 'Service health check completed',
  MAINTENANCE_MODE: 'Service is in maintenance mode'
} as const;

export const ERROR_CODES = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  CONTENT_TOO_LONG: 'CONTENT_TOO_LONG',
  CONTENT_EMPTY: 'CONTENT_EMPTY',
  INVALID_CONTENT_TYPE: 'INVALID_CONTENT_TYPE',
  INVALID_PLATFORM: 'INVALID_PLATFORM',
  MODERATION_FAILED: 'MODERATION_FAILED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR: 'SERVER_ERROR',
  RULE_NOT_FOUND: 'RULE_NOT_FOUND',
  CONFIG_INVALID: 'CONFIG_INVALID'
} as const;

export const SUCCESS_CODES = {
  MODERATION_COMPLETE: 'MODERATION_COMPLETE',
  RULE_UPDATED: 'RULE_UPDATED',
  CONFIG_UPDATED: 'CONFIG_UPDATED',
  SERVICE_HEALTHY: 'SERVICE_HEALTHY'
} as const; 