import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import {
  ContentModerationRequest,
  ContentModerationResponse,
  ModerationConfig,
  ContentType,
  PlatformType,
  SeverityLevel
} from './types/content_moderation';
import { ModerationEngine } from './services/moderation_engine';
import { NOTIFICATION_MESSAGES, ERROR_CODES, SUCCESS_CODES } from './constants/notifications';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8005; // Using port 8005 as per user preference

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Default configuration
const default_config: ModerationConfig = {
  rules: [],
  sensitivity_threshold: 0.5,
  enable_sentiment_analysis: true,
  enable_profanity_detection: true,
  enable_toxicity_detection: true,
  enable_spam_detection: true,
  enable_hate_speech_detection: true,
  enable_violence_detection: true,
  enable_sexual_content_detection: true,
  enable_personal_info_detection: true
};

// Initialize moderation engine
const moderation_engine = new ModerationEngine(default_config);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: NOTIFICATION_MESSAGES.HEALTH_CHECK,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Main content moderation endpoint
app.post('/api/moderate', async (req, res) => {
  try {
    const request_body = req.body as ContentModerationRequest;

    // Validate required fields
    if (!request_body.content || !request_body.content_type || !request_body.platform) {
      return res.status(400).json({
        error: ERROR_CODES.INVALID_REQUEST,
        message: NOTIFICATION_MESSAGES.INVALID_REQUEST,
        details: 'Missing required fields: content, content_type, platform'
      });
    }

    // Perform content moderation
    const result = await moderation_engine.moderate_content(request_body);

    return res.json({
      success: true,
      code: SUCCESS_CODES.MODERATION_COMPLETE,
      message: result.is_flagged ? NOTIFICATION_MESSAGES.CONTENT_FLAGGED : NOTIFICATION_MESSAGES.CONTENT_SAFE,
      data: result
    });

  } catch (error) {
    console.error('Moderation error:', error);
    return res.status(500).json({
      error: ERROR_CODES.MODERATION_FAILED,
      message: NOTIFICATION_MESSAGES.MODERATION_FAILED,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get configuration endpoint
app.get('/api/config', (req, res) => {
  try {
    const config = moderation_engine.get_config();
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      error: ERROR_CODES.SERVER_ERROR,
      message: NOTIFICATION_MESSAGES.SERVER_ERROR
    });
  }
});

// Update configuration endpoint
app.put('/api/config', (req, res) => {
  try {
    const new_config = req.body as ModerationConfig;
    moderation_engine.update_config(new_config);

    res.json({
      success: true,
      code: SUCCESS_CODES.CONFIG_UPDATED,
      message: NOTIFICATION_MESSAGES.CONFIG_UPDATED
    });
  } catch (error) {
    res.status(400).json({
      error: ERROR_CODES.CONFIG_INVALID,
      message: NOTIFICATION_MESSAGES.CONFIG_INVALID
    });
  }
});

// Test endpoint with sample content
app.post('/api/test', async (req, res) => {
  try {
    const test_content = req.body.content || 'This is a test message for content moderation.';
    const platform = req.body.platform || PlatformType.TWITTER;

    const test_request: ContentModerationRequest = {
      content: test_content,
      content_type: ContentType.TEXT,
      platform: platform,
      user_id: 'test_user',
      metadata: { test: true }
    };

    const result = await moderation_engine.moderate_content(test_request);

    res.json({
      success: true,
      message: 'Test completed successfully',
      data: result
    });

  } catch (error) {
    res.status(500).json({
      error: ERROR_CODES.MODERATION_FAILED,
      message: NOTIFICATION_MESSAGES.MODERATION_FAILED,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get supported platforms endpoint
app.get('/api/platforms', (req, res) => {
  res.json({
    success: true,
    data: Object.values(PlatformType)
  });
});

// Get supported content types endpoint
app.get('/api/content-types', (req, res) => {
  res.json({
    success: true,
    data: Object.values(ContentType)
  });
});

// Get severity levels endpoint
app.get('/api/severity-levels', (req, res) => {
  res.json({
    success: true,
    data: Object.values(SeverityLevel)
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: ERROR_CODES.SERVER_ERROR,
    message: NOTIFICATION_MESSAGES.SERVER_ERROR
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`${NOTIFICATION_MESSAGES.SERVICE_STARTED} on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Web interface: http://localhost:${PORT}`);
  console.log(`API documentation: http://localhost:${PORT}/api`);
});

export default app; 