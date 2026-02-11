# Chat System Architecture

## Complete System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                      (React Chat Component)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ User sends message
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CHAT INPUT COMPONENT                       │
│  - Captures user message                                        │
│  - Creates/selects chat                                         │
│  - Sends to backend                                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ POST /api/chat/message
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CHAT CONTROLLER                            │
│  - Validates request                                            │
│  - Saves user message to DB                                     │
│  - Calls askGPT()                                               │
│  - Saves bot response to DB                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ askGPT(message)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         GPT SERVICE                             │
│                    (Main Processing Logic)                      │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ├─── Is Conversational? (hi, bye, thanks)
                             │    │
                             │    └──► YES ──► Return instant response
                             │
                             └─── NO ──► Continue processing
                                         │
                                         ▼
                    ┌────────────────────────────────────┐
                    │    STEP 1: TOPIC EXTRACTION        │
                    │  - Call OpenRouter LLM             │
                    │  - Extract main topic (1-3 words)  │
                    │  - Example: "blockchain"           │
                    └────────────┬───────────────────────┘
                                 │
                                 │ Topic extracted
                                 ▼
                    ┌────────────────────────────────────┐
                    │   STEP 2: WIKIPEDIA RETRIEVAL      │
                    │  - Search Wikipedia API            │
                    │  - Get page title                  │
                    │  - Fetch content summary           │
                    │  - Limit to 2000 characters        │
                    └────────────┬───────────────────────┘
                                 │
                                 │ Wikipedia content
                                 ▼
                    ┌────────────────────────────────────┐
                    │   STEP 3: CONTENT REPHRASING       │
                    │  - Call OpenRouter LLM             │
                    │  - Rephrase Wikipedia content      │
                    │  - Add emojis and examples         │
                    │  - Include source URL              │
                    └────────────┬───────────────────────┘
                                 │
                                 │ Enhanced response
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RESPONSE DELIVERY                          │
│  - Return to Chat Controller                                    │
│  - Save to database                                             │
│  - Send to frontend                                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Response data
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CHAT BUBBLE COMPONENT                      │
│  - Display with typing effect                                   │
│  - Letter-by-letter animation                                   │
│  - Show timestamp                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Fallback Mechanisms

```
┌─────────────────────────────────────────────────────────────────┐
│                      FALLBACK FLOW                              │
└─────────────────────────────────────────────────────────────────┘

Topic Extraction Fails?
    │
    └──► Use Direct LLM Response (no Wikipedia)

Wikipedia Not Found?
    │
    └──► Use Direct LLM Response (no Wikipedia)

Content Rephrasing Fails?
    │
    └──► Use Direct LLM Response (no Wikipedia)

Primary Model Fails?
    │
    └──► Try Fallback Model (llama-3.2-1b)

All LLM Calls Fail?
    │
    └──► Return User-Friendly Error Message
```

## Component Breakdown

### Frontend Components

```
client/src/
├── pages/
│   └── Chat.jsx                 # Main chat page
├── components/
│   ├── ChatInput.jsx            # Message input with voice/file upload
│   ├── ChatBubble.jsx           # Message display with typing effect
│   └── Sidebar.jsx              # Chat history sidebar
├── context/
│   └── ChatContext.jsx          # Chat state management
└── services/
    └── chatService.js           # API calls to backend
```

### Backend Components

```
server/
├── controllers/
│   └── chatController.js        # Request handling
├── services/
│   ├── gptService.js            # Main AI logic (NEW)
│   ├── wikipediaService.js      # Wikipedia API (NEW)
│   └── sentimentService.js      # Sentiment analysis
├── models/
│   ├── Chat.js                  # Chat schema
│   └── Message.js               # Message schema
└── routes/
    └── chatRoutes.js            # API endpoints
```

## API Endpoints

### Chat Endpoints
```
POST   /api/chat/create          # Create new chat
POST   /api/chat/message         # Send message
GET    /api/chat/list            # Get user's chats
GET    /api/chat/:chatId         # Get chat messages
DELETE /api/chat/:chatId         # Delete chat
```

## External APIs

### OpenRouter API
```
Base URL: https://openrouter.ai/api/v1
Endpoint: /chat/completions

Models Used:
- meta-llama/llama-3.2-3b-instruct:free (Primary)
- meta-llama/llama-3.2-1b-instruct:free (Fallback)

Usage:
1. Topic Extraction: ~20 tokens
2. Content Rephrasing: ~800 tokens
3. Direct Response: ~600 tokens
```

### Wikipedia API
```
Base URL: https://en.wikipedia.org/w/api.php

Endpoints:
1. Search: action=query&list=search
2. Content: action=query&prop=extracts

Features:
- Free, no API key required
- Rate limit: ~200 requests/second
- Returns plain text summaries
```

## Data Flow

### Message Creation Flow
```
1. User types message
2. Frontend validates input
3. POST to /api/chat/message
4. Backend saves user message
5. Backend calls askGPT()
6. askGPT() processes (3 steps)
7. Backend saves bot response
8. Response sent to frontend
9. Frontend displays with typing effect
10. Message saved in chat history
```

### Chat Loading Flow
```
1. User opens chat page
2. Frontend loads chat list
3. User selects chat
4. Frontend fetches messages
5. Messages displayed in order
6. Auto-scroll to bottom
7. Ready for new messages
```

## State Management

### Chat Context State
```javascript
{
  currentChat: string,           // Current chat ID
  messages: Array,               // Current chat messages
  chatHistory: Array,            // List of all chats
  loading: boolean               // Loading state
}
```

### Message Object
```javascript
{
  message: string,               // Message text
  sender: 'user' | 'bot',       // Who sent it
  sentiment: string,             // Sentiment analysis
  timestamp: Date,               // When sent
  isTyping: boolean             // Typing animation
}
```

## Performance Optimization

### Caching Strategy
- Conversational responses: Instant (no API)
- Wikipedia content: Could be cached (future)
- LLM responses: Not cached (dynamic)

### Token Optimization
- Wikipedia content: Limited to 2000 chars
- LLM output: Limited to 800 tokens
- Topic extraction: Limited to 20 tokens

### Response Time Targets
- Conversational: < 100ms
- Wikipedia-enhanced: 2-5 seconds
- Direct LLM: 1-3 seconds
- Error handling: < 500ms

## Error Handling Strategy

### Error Types
1. **Authentication Errors** (401)
   - Check API key
   - User-friendly message

2. **Rate Limiting** (429)
   - Wait and retry
   - Inform user

3. **Network Errors**
   - Check connection
   - Retry mechanism

4. **Content Not Found**
   - Fallback to direct LLM
   - Seamless to user

5. **Model Failures**
   - Try fallback model
   - Graceful degradation

## Security Considerations

### API Key Protection
- Stored in .env file
- Never exposed to frontend
- Server-side only

### Input Validation
- Message length limits
- XSS prevention
- SQL injection prevention

### Rate Limiting
- Per-user limits
- API quota management
- Abuse prevention

## Monitoring & Logging

### Server Logs
```
=== Processing User Question ===
Question: [user input]
Extracted topic: [topic]
Found Wikipedia page: [title]
Retrieved Wikipedia content (X chars)
Content rephrased successfully!
=== Response Generated Successfully ===
```

### Error Logs
```
=== API Error Details ===
Message: [error message]
Status: [HTTP status]
Error code: [error code]
```

## Future Enhancements

### Planned Features
1. **Caching Layer**
   - Cache Wikipedia content
   - Cache common topics
   - Reduce API calls

2. **Multi-language Support**
   - Support multiple Wikipedia languages
   - Translate responses

3. **Image Integration**
   - Include Wikipedia images
   - Visual learning aids

4. **Related Topics**
   - Suggest related topics
   - Deep dive options

5. **Conversation Memory**
   - Remember context
   - Follow-up questions

6. **Analytics**
   - Track popular topics
   - User engagement metrics

## Deployment Considerations

### Environment Variables
```env
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=...
CLIENT_URL=http://localhost:5173
OPENROUTER_API_KEY=sk-or-v1-...
```

### Dependencies
```json
{
  "openai": "^6.18.0",
  "axios": "^1.13.5",
  "express": "^4.18.2",
  "mongoose": "^8.0.0"
}
```

### Scaling Strategy
- Horizontal scaling: Multiple server instances
- Load balancing: Distribute requests
- Database: MongoDB Atlas (cloud)
- Caching: Redis (future)

## Conclusion

This architecture provides:
- ✅ Accurate information from Wikipedia
- ✅ Engaging explanations from LLM
- ✅ Robust error handling
- ✅ Fast conversational responses
- ✅ Scalable design
- ✅ User-friendly experience
