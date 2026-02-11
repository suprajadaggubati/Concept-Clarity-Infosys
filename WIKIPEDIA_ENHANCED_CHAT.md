# Wikipedia-Enhanced Chat System

## Overview
The chat system now uses a sophisticated 3-step process to provide comprehensive, accurate answers:

1. **Topic Extraction**: LLM identifies the main topic from user's question
2. **Wikipedia Retrieval**: Fetches accurate, factual content from Wikipedia
3. **Content Rephrasing**: LLM rephrases Wikipedia content in an engaging, easy-to-understand way

## Architecture

### Flow Diagram
```
User Question
    ↓
Topic Extraction (LLM)
    ↓
Wikipedia API Search
    ↓
Content Retrieval
    ↓
LLM Rephrasing
    ↓
Enhanced Response
```

## Implementation Details

### 1. Topic Extraction (`extractTopic`)
- Uses OpenRouter's `meta-llama/llama-3.2-3b-instruct:free` model
- Extracts 1-3 word topic from user's question
- Example: "What is blockchain?" → "blockchain"

### 2. Wikipedia Service (`wikipediaService.js`)
- **Search**: Finds the most relevant Wikipedia page
- **Content Retrieval**: Gets the introduction/summary section
- **Limits**: Content limited to 2000 characters to avoid token limits
- **Returns**: Title, content, and Wikipedia URL

### 3. Content Rephrasing (`rephraseContent`)
- Takes Wikipedia content and user's original question
- Uses LLM to create engaging, educational explanation
- Adds emojis and examples for better understanding
- Includes source attribution (Wikipedia URL)
- Focuses on FinTech aspects when applicable

### 4. Fallback Mechanism
If any step fails, the system falls back to:
- Direct LLM response without Wikipedia
- Conversational responses for greetings/farewells
- Helpful error messages

## API Configuration

### OpenRouter Setup
```env
OPENROUTER_API_KEY=sk-or-v1-...
CLIENT_URL=http://localhost:5173
```

### Models Used
- **Primary**: `meta-llama/llama-3.2-3b-instruct:free`
- **Fallback**: `meta-llama/llama-3.2-1b-instruct:free`

## Features

### ✅ Accurate Information
- Wikipedia provides factual, verified content
- Reduces hallucinations and inaccuracies

### ✅ Comprehensive Understanding
- Full Wikipedia summaries (up to 2000 chars)
- Rephrased for clarity and engagement

### ✅ Source Attribution
- Every response includes Wikipedia URL
- Users can verify information

### ✅ Conversational
- Instant responses for greetings/farewells
- No API calls for simple interactions

### ✅ Error Handling
- Multiple fallback mechanisms
- Detailed error logging
- User-friendly error messages

## Example Interactions

### Example 1: Blockchain
**User**: "Can you explain blockchain?"

**Process**:
1. Extract topic: "blockchain"
2. Fetch Wikipedia: https://en.wikipedia.org/wiki/Blockchain
3. Rephrase with LLM

**Response**: Engaging explanation with emojis, examples, and Wikipedia source

### Example 2: Bitcoin
**User**: "What is bitcoin?"

**Process**:
1. Extract topic: "bitcoin"
2. Fetch Wikipedia: https://en.wikipedia.org/wiki/Bitcoin
3. Rephrase with LLM

**Response**: Clear explanation of Bitcoin with source attribution

## Error Handling

### API Errors
- **401**: Authentication error - check API key
- **429**: Rate limit - wait and retry
- **402**: Credits needed - add credits to OpenRouter
- **Network**: Connection issues

### Fallback Scenarios
1. Topic extraction fails → Direct LLM response
2. Wikipedia not found → Direct LLM response
3. Rephrasing fails → Direct LLM response
4. All fails → User-friendly error message

## Logging

Comprehensive console logging for debugging:
```
=== Processing User Question ===
Question: [user's question]
Extracted topic: [topic]
Found Wikipedia page: [page title]
Retrieved Wikipedia content (X characters)
Rephrasing Wikipedia content with LLM...
Content rephrased successfully!
=== Response Generated Successfully ===
```

## Dependencies

```json
{
  "openai": "^6.18.0",  // OpenRouter client
  "axios": "^1.13.5"     // Wikipedia API calls
}
```

## Files Modified/Created

### New Files
- `server/services/wikipediaService.js` - Wikipedia API integration
- `WIKIPEDIA_ENHANCED_CHAT.md` - This documentation

### Modified Files
- `server/services/gptService.js` - Complete rewrite with new workflow
- `server/package.json` - Added axios dependency

## Testing

### Test Cases
1. **FinTech Topics**: blockchain, bitcoin, cryptocurrency, DeFi, NFT
2. **Greetings**: hi, hello, bye, thanks
3. **Complex Questions**: "How does blockchain work?"
4. **Simple Questions**: "What is bitcoin?"
5. **Error Cases**: Invalid API key, network issues

### Expected Behavior
- Conversational responses: Instant (no API call)
- Topic-based questions: 2-5 seconds (Wikipedia + LLM)
- Errors: Graceful fallback with helpful messages

## Performance

### Response Times
- Conversational: < 100ms
- Wikipedia-enhanced: 2-5 seconds
- Direct LLM: 1-3 seconds

### Token Usage
- Topic extraction: ~20 tokens
- Content rephrasing: ~800 tokens
- Total per request: ~820 tokens

## Future Enhancements

### Potential Improvements
1. **Caching**: Cache Wikipedia content for common topics
2. **Multi-language**: Support multiple Wikipedia languages
3. **Images**: Include Wikipedia images in responses
4. **Related Topics**: Suggest related topics to explore
5. **Citations**: Add inline citations from Wikipedia
6. **Conversation Context**: Remember previous questions in chat

## Troubleshooting

### Common Issues

**Issue**: "Authentication error"
- **Solution**: Verify OPENROUTER_API_KEY in .env file

**Issue**: "No Wikipedia results found"
- **Solution**: System automatically falls back to direct LLM response

**Issue**: "Rate limit exceeded"
- **Solution**: Wait a moment and try again (free tier limits)

**Issue**: Responses are too long
- **Solution**: Wikipedia content is limited to 2000 chars, LLM output to 800 tokens

## Conclusion

This Wikipedia-enhanced chat system provides:
- ✅ Accurate, factual information from Wikipedia
- ✅ Engaging, easy-to-understand explanations from LLM
- ✅ Source attribution for verification
- ✅ Robust error handling and fallbacks
- ✅ Fast, conversational responses for common interactions

The system ensures users get comprehensive understanding of topics while maintaining accuracy and reliability.
