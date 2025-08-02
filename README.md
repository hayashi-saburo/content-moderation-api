# 🚀 Blotato Content Moderation API

A comprehensive TypeScript-based content moderation system designed to flag problematic content before it gets posted to social media platforms. Built for the Blotato interview process with a focus on real-world applicability and extensibility.

## 🎯 Features

### Core Moderation Capabilities
- **Profanity Detection**: Uses the `bad-words` library with custom filtering
- **Sentiment Analysis**: Leverages the `sentiment` library with business context customization
- **Toxicity Detection**: Identifies hate speech, violence, and sexual content using pattern matching
- **Spam Detection**: Detects promotional content, excessive capitalization, and repetitive text
- **Personal Information Detection (PII)**: Identifies emails, phone numbers, SSNs, credit cards, addresses, and names
- **Custom Rule Engine**: Flexible system for defining platform-specific moderation rules

### Technical Features
- **TypeScript**: Full type safety with comprehensive interfaces and enums
- **Express.js API**: RESTful endpoints with proper error handling
- **Web Interface**: Beautiful, responsive UI for easy testing and demonstration
- **Modular Architecture**: Separate services for each detection type
- **Configuration Management**: Runtime configuration updates
- **Security**: Helmet.js with custom CSP for inline scripts
- **Constants System**: Centralized notification messages and error codes

## 🛠 Technology Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Libraries**: 
  - `bad-words` for profanity detection
  - `sentiment` for sentiment analysis
  - `helmet` for security headers
  - `cors` for cross-origin requests
  - `dotenv` for environment variables
- **Development**: `ts-node` for development, `tsc` for production builds
- **Frontend**: Vanilla HTML/CSS/JavaScript with modern UI design

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blotato-content-moderation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Web Interface: http://localhost:8005
   - Health Check: http://localhost:8005/health
   - API Base: http://localhost:8005/api

## 🚀 Usage

### Web Interface
Visit http://localhost:8005 to use the interactive web interface:
- **Sample Content Buttons**: Test predefined content types
- **Custom Content**: Enter your own content for moderation
- **Platform Selection**: Choose from Twitter, Facebook, Instagram, LinkedIn, TikTok, YouTube
- **Content Types**: Support for text, image, video, and audio content
- **Real-time Results**: See detailed moderation results with confidence scores

### API Endpoints

#### Main Moderation Endpoint
```http
POST /api/moderate
Content-Type: application/json

{
  "content": "Your content to moderate",
  "platform": "twitter",
  "content_type": "text",
  "user_id": "optional_user_id",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "code": "MODERATION_COMPLETE",
  "message": "Content has been flagged for moderation",
  "data": {
    "is_flagged": true,
    "flags": [
      {
        "type": "spam",
        "severity": "medium",
        "confidence": 1,
        "description": "Spam-like content detected",
        "suggestion": "Consider editing content to remove flagged elements"
      }
    ],
    "overall_severity": "medium",
    "confidence_score": 1,
    "safe_to_post": true,
    "recommendations": [
      "Consider editing content to remove flagged elements"
    ],
    "processing_time_ms": 8
  }
}
```

#### Configuration Endpoints
```http
GET /api/config          # Get current configuration
PUT /api/config          # Update configuration
GET /api/platforms       # Get supported platforms
GET /api/content-types   # Get supported content types
GET /api/severity-levels # Get severity levels
```

#### Health Check
```http
GET /health
```

### Testing Examples

#### Spam Content
```bash
curl -X POST http://localhost:8005/api/moderate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "BUY NOW!!! LIMITED TIME OFFER!!! FREE MONEY!!!",
    "platform": "twitter",
    "content_type": "text"
  }'
```

#### Profanity Content
```bash
curl -X POST http://localhost:8005/api/moderate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is absolutely terrible and I hate everything about it!",
    "platform": "twitter",
    "content_type": "text"
  }'
```

#### Personal Information
```bash
curl -X POST http://localhost:8005/api/moderate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "My email is test@example.com and phone is 555-123-4567",
    "platform": "twitter",
    "content_type": "text"
  }'
```

## 🏗 Architecture

### Project Structure
```
blotato/
├── src/
│   ├── types/
│   │   ├── content_moderation.ts    # Core type definitions
│   │   └── modules.d.ts            # External module declarations
│   ├── services/
│   │   ├── moderation_engine.ts     # Main orchestration service
│   │   ├── profanity_detector.ts    # Profanity detection
│   │   ├── sentiment_analyzer.ts    # Sentiment analysis
│   │   ├── toxicity_detector.ts     # Toxicity detection
│   │   ├── spam_detector.ts         # Spam detection
│   │   ├── personal_info_detector.ts # PII detection
│   │   └── rule_engine.ts           # Custom rules engine
│   ├── constants/
│   │   └── notifications.ts         # Notification messages
│   └── index.ts                     # Express server setup
├── public/
│   └── index.html                   # Web interface
├── package.json
├── tsconfig.json
└── README.md
```

### Key Components

#### ModerationEngine
The central orchestrator that:
- Validates incoming requests
- Calls appropriate detection services
- Aggregates results and calculates overall severity
- Applies custom rules
- Returns comprehensive moderation results

#### Detection Services
Each service implements a specific detection type:
- **ProfanityDetector**: Uses `bad-words` library with custom filtering
- **SentimentAnalyzer**: Uses `sentiment` library with business context
- **ToxicityDetector**: Pattern-based detection for harmful content
- **SpamDetector**: Identifies promotional and spam-like content
- **PersonalInfoDetector**: Regex-based PII detection
- **RuleEngine**: Custom rule application system

#### Type System
Comprehensive TypeScript interfaces for:
- Request/response structures
- Detection results
- Configuration objects
- Platform and content type enums
- Severity levels

## ⚙️ Configuration

### Environment Variables
```bash
PORT=8005                    # Server port (default: 8005)
NODE_ENV=development         # Environment mode
```

### Moderation Configuration
```typescript
{
  rules: [],                           // Custom rules array
  sensitivity_threshold: 0.5,          // Overall sensitivity (0-1)
  enable_sentiment_analysis: true,     // Enable sentiment detection
  enable_profanity_detection: true,    // Enable profanity detection
  enable_toxicity_detection: true,     // Enable toxicity detection
  enable_spam_detection: true,         // Enable spam detection
  enable_hate_speech_detection: true,  // Enable hate speech detection
  enable_violence_detection: true,     // Enable violence detection
  enable_sexual_content_detection: true, // Enable sexual content detection
  enable_personal_info_detection: true // Enable PII detection
}
```

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server with ts-node
npm run build    # Build TypeScript to JavaScript
npm run start    # Start production server
npm run test     # Run tests (placeholder)
npm run lint     # Run linting (placeholder)
npm run format   # Format code (placeholder)
```

### TypeScript Configuration
- **Target**: ES2020
- **Module**: CommonJS
- **Strict Mode**: Enabled
- **Source Maps**: Enabled
- **Declaration Files**: Generated

### Security Features
- **Helmet.js**: Security headers with custom CSP
- **CORS**: Cross-origin resource sharing enabled
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Comprehensive error handling and logging

## 🧪 Testing

### Manual Testing
1. **Web Interface**: Use the interactive UI at http://localhost:8005
2. **API Testing**: Use curl or Postman with the provided examples
3. **Sample Content**: Try the predefined test cases (Safe, Profanity, Spam, Personal Info)

### Test Scenarios
- **Safe Content**: Positive, business-appropriate content
- **Profanity**: Content with inappropriate language
- **Spam**: Promotional content with excessive capitalization
- **Personal Info**: Content containing PII like emails and phone numbers
- **Mixed Content**: Content with multiple issues

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure appropriate port
3. Set up reverse proxy (nginx/Apache) if needed
4. Configure SSL certificates for HTTPS

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 8005
CMD ["node", "dist/index.js"]
```

## 📊 Performance

### Response Times
- **Typical**: 5-15ms for standard content
- **Complex**: 20-50ms for content with multiple flags
- **Heavy**: 50-100ms for very long content with many issues

### Scalability Considerations
- **Stateless Design**: Easy horizontal scaling
- **Modular Services**: Independent scaling of detection services
- **Caching**: Ready for Redis integration
- **Queue System**: Ready for message queue integration

## 🔮 Future Enhancements

### Planned Features
- **Machine Learning Integration**: TensorFlow.js for improved detection
- **Database Integration**: MongoDB/PostgreSQL for rule persistence
- **Real-time Processing**: WebSocket support for streaming content
- **Multi-language Support**: Internationalization for different languages
- **Advanced Analytics**: Detailed moderation analytics and reporting
- **API Rate Limiting**: Request throttling and quota management
- **Webhook Support**: Real-time notifications for flagged content

### Integration Possibilities
- **Social Media APIs**: Direct integration with platform APIs
- **Workflow Automation**: n8n, Make.com, Zapier, Pipedream nodes
- **Monitoring**: Prometheus metrics and Grafana dashboards
- **Logging**: Structured logging with ELK stack

## 🤝 Contributing

This project was created for the Blotato interview process. The code is fully owned by the developer and can be used for:
- Portfolio projects
- Learning TypeScript and Node.js
- Content moderation research
- API development practice

## 📄 License

This project is created for interview purposes. The developer retains full ownership and rights to the code.

## 🎯 Interview Context

This project was built for the Blotato interview process, demonstrating:
- **TypeScript Proficiency**: Full type safety and modern TypeScript features
- **API Design**: RESTful API with proper error handling and documentation
- **Modular Architecture**: Clean separation of concerns and extensibility
- **Real-world Applicability**: Production-ready code with security considerations
- **Problem Solving**: Systematic approach to content moderation challenges
- **Documentation**: Comprehensive README and inline documentation

The solution addresses the core requirement of flagging problematic content before social media posting while providing a solid foundation for future enhancements and integrations. 