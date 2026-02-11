# Testing the Wikipedia-Enhanced Chat System

## How to Test

### 1. Start the Server
```bash
cd server
npm start
```

### 2. Start the Client
```bash
cd client
npm run dev
```

### 3. Test Scenarios

#### Scenario 1: FinTech Topic (Blockchain)
**Input**: "Can you explain blockchain?"

**Expected Flow**:
1. System extracts topic: "blockchain"
2. Fetches Wikipedia: https://en.wikipedia.org/wiki/Blockchain
3. LLM rephrases content with emojis and examples
4. Response includes Wikipedia source

**Expected Response**: 2-3 paragraphs explaining blockchain with emojis, examples, and Wikipedia URL

---

#### Scenario 2: Cryptocurrency (Bitcoin)
**Input**: "What is bitcoin?"

**Expected Flow**:
1. System extracts topic: "bitcoin"
2. Fetches Wikipedia: https://en.wikipedia.org/wiki/Bitcoin
3. LLM rephrases content
4. Response includes source

**Expected Response**: Clear explanation of Bitcoin with source attribution

---

#### Scenario 3: DeFi
**Input**: "Explain DeFi to me"

**Expected Flow**:
1. System extracts topic: "DeFi" or "Decentralized Finance"
2. Fetches Wikipedia content
3. LLM creates engaging explanation
4. Response includes source

**Expected Response**: Comprehensive DeFi explanation with examples

---

#### Scenario 4: Conversational (No API Call)
**Input**: "Hi"

**Expected Flow**:
1. Instant conversational response
2. No API call
3. No Wikipedia lookup

**Expected Response**: "Hello! 👋 I'm your FinTech learning assistant..."

---

#### Scenario 5: Complex Question
**Input**: "How does blockchain technology work in cryptocurrency?"

**Expected Flow**:
1. System extracts main topic: "blockchain" or "cryptocurrency"
2. Fetches relevant Wikipedia content
3. LLM rephrases to answer the specific question
4. Response includes source

**Expected Response**: Detailed explanation focusing on blockchain in crypto context

---

## What to Look For

### ✅ Success Indicators
- Response appears within 2-5 seconds
- Content is comprehensive (2-3 paragraphs)
- Includes emojis and examples
- Wikipedia URL is included
- Information is accurate and factual
- Language is clear and engaging

### ❌ Error Indicators
- "Authentication error" → Check API key
- "Rate limit exceeded" → Wait and retry
- "Network error" → Check internet connection
- Generic error message → Check server logs

## Server Logs to Monitor

When you send a message, you should see:
```
=== Processing User Question ===
Question: [your question]
Extracting topic from user question...
Extracted topic: [topic]
Searching Wikipedia for: [topic]
Found Wikipedia page: [page title]
Retrieved Wikipedia content (X characters)
Rephrasing Wikipedia content with LLM...
Content rephrased successfully!
=== Response Generated Successfully ===
```

## Testing Checklist

- [ ] Server starts without errors
- [ ] Client connects to server
- [ ] Can send messages in chat
- [ ] Greetings work instantly (hi, hello, bye)
- [ ] FinTech topics return Wikipedia-enhanced responses
- [ ] Responses include source URLs
- [ ] Typing effect works (letter by letter)
- [ ] Messages are saved to database
- [ ] Old chats load correctly
- [ ] Error handling works gracefully

## Common Test Topics

### FinTech Topics (Should use Wikipedia)
- Blockchain
- Bitcoin
- Cryptocurrency
- Ethereum
- DeFi (Decentralized Finance)
- NFT (Non-Fungible Token)
- Smart Contract
- Digital Wallet
- Mining (Cryptocurrency)
- Stablecoin

### Conversational (Instant Response)
- Hi / Hello / Hey
- Bye / Goodbye
- Thanks / Thank you
- How are you

### Complex Questions (Should use Wikipedia)
- "How does blockchain work?"
- "What's the difference between Bitcoin and Ethereum?"
- "Explain smart contracts"
- "What are the benefits of DeFi?"

## Performance Benchmarks

### Expected Response Times
- Conversational: < 100ms
- Wikipedia-enhanced: 2-5 seconds
- Direct LLM fallback: 1-3 seconds

### Expected Quality
- Accuracy: High (Wikipedia source)
- Comprehensiveness: 2-3 paragraphs
- Readability: Easy to understand
- Engagement: Emojis and examples included

## Troubleshooting

### If responses are slow (>10 seconds)
- Check internet connection
- Check OpenRouter API status
- Check server logs for errors

### If responses are inaccurate
- Verify Wikipedia content is being fetched
- Check server logs for "No Wikipedia results found"
- System should fallback to direct LLM if Wikipedia fails

### If getting error messages
- Check .env file has OPENROUTER_API_KEY
- Verify API key is valid
- Check OpenRouter account has credits
- Review server logs for detailed error info

## Success Criteria

The system is working correctly if:
1. ✅ Conversational responses are instant
2. ✅ Topic-based questions return comprehensive answers
3. ✅ Responses include Wikipedia sources
4. ✅ Content is accurate and well-explained
5. ✅ Error handling is graceful
6. ✅ Typing effect works smoothly
7. ✅ Messages persist in database
8. ✅ Chat history loads correctly

## Next Steps After Testing

If everything works:
1. Test with various FinTech topics
2. Verify source attribution
3. Check response quality
4. Test error scenarios
5. Verify database persistence

If issues occur:
1. Check server logs
2. Verify API key
3. Test internet connection
4. Review error messages
5. Check console for detailed errors
