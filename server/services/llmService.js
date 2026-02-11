import Groq from 'groq-sdk'

/**
 * Initialize Groq client (FREE, unlimited Llama3 & Mistral)
 */
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY
  
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY not configured')
  }
  
  return new Groq({ apiKey })
}

/**
 * Call Groq API with Llama3 or Mistral
 */
async function callGroq(prompt, systemPrompt = '', maxTokens = 500) {
  try {
    const groq = getGroqClient()
    
    // Use Llama3.1 8B (current working model)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: systemPrompt || 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
      top_p: 1,
      stream: false
    })
    
    return completion.choices[0]?.message?.content?.trim() || null
  } catch (error) {
    console.error('Groq API error:', error.message)
    
    // Try fallback model (Mistral)
    try {
      const groq = getGroqClient()
      
      const completion = await groq.chat.completions.create({
        model: 'gemma2-9b-it',
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
        top_p: 1,
        stream: false
      })
      
      return completion.choices[0]?.message?.content?.trim() || null
    } catch (fallbackError) {
      console.error('Fallback model also failed:', fallbackError.message)
      return null
    }
  }
}

/**
 * Extract topic from user's question using LLM
 */
export async function extractTopic(userQuestion) {
  try {
    const systemPrompt = 'You are a topic extraction assistant. Extract the main topic from the question. Reply with ONLY 1-3 words, nothing else. Examples: "blockchain", "python programming", "bitcoin".'
    
    const topic = await callGroq(userQuestion, systemPrompt, 20)
    
    if (topic && topic.length > 0 && topic.length < 50) {
      console.log(`✅ Extracted topic: "${topic}"`)
      return topic
    }
    
    return null
  } catch (error) {
    console.error('Topic extraction error:', error.message)
    return null
  }
}

/**
 * Simplify and explain Wikipedia content using LLM with structured format
 * Produces Google/ChatGPT quality responses
 */
export async function simplifyContent(topic, wikipediaContent, userQuestion) {
  try {
    const systemPrompt = `You are an expert educational assistant like Google or ChatGPT. Provide comprehensive, accurate explanations in a structured format.

Always use this structure:
**Meaning**: Clear, concise definition
**Description**: Comprehensive explanation with key details
**Example**: Practical, real-world examples
**Where it is used**: Applications, contexts, and relevance

Be thorough, accurate, and engaging. Use professional language with appropriate emojis.`
    
    const prompt = `Explain "${topic}" comprehensively based on this Wikipedia content.

Wikipedia Content:
${wikipediaContent.substring(0, 3500)}

User Question: "${userQuestion}"

Provide a complete, accurate explanation using this structure:

**Meaning**: What is ${topic}? (Clear definition in 1-2 sentences)

**Description**: Provide a comprehensive explanation covering:
- Key characteristics and features
- How it works or what it involves
- Important aspects and components
- Historical context if relevant

**Example**: Give 2-3 concrete, real-world examples that illustrate the concept clearly.

**Where it is used**: Explain practical applications:
- Industries or fields where it's used
- Common scenarios and contexts
- Why it's important or relevant
- Current trends or developments

Make it informative, accurate, and easy to understand. Be thorough like Google or ChatGPT.`
    
    const simplified = await callGroq(prompt, systemPrompt, 1500)
    
    if (simplified) {
      console.log('✅ Content simplified successfully')
      return simplified
    }
    
    return null
  } catch (error) {
    console.error('Content simplification error:', error.message)
    return null
  }
}

/**
 * Generate direct response without Wikipedia (for any topic)
 * Produces Google/ChatGPT quality responses
 */
export async function generateDirectResponse(userQuestion) {
  try {
    const systemPrompt = `You are an expert knowledge assistant like Google or ChatGPT. Provide comprehensive, accurate answers to any question.

Always use this structure:
**Meaning**: Clear definition
**Description**: Detailed explanation
**Example**: Real-world examples
**Where it is used**: Applications and relevance

Be thorough, accurate, and professional. Cover all aspects of the topic.`
    
    const prompt = `Answer this question comprehensively: "${userQuestion}"

Provide a complete, accurate response using this structure:

**Meaning**: What is it? (Clear definition)

**Description**: Provide a thorough explanation:
- Key characteristics and features
- How it works or what it means
- Important details and context
- Background information if relevant

**Example**: Give specific, concrete examples that make the concept clear and relatable.

**Where it is used**: Explain practical relevance:
- Where you encounter this
- Applications and use cases
- Why it matters
- Current relevance

Be comprehensive and accurate like Google or ChatGPT. Provide valuable, educational content.`
    
    const response = await callGroq(prompt, systemPrompt, 1500)
    
    if (response) {
      console.log('✅ Direct response generated')
      return response
    }
    
    return null
  } catch (error) {
    console.error('Direct response error:', error.message)
    return null
  }
}


/**
 * Generate a smart chat title from the first message
 */
export async function generateChatTitle(firstMessage) {
  try {
    const systemPrompt = 'You are a title generator. Create a short, descriptive title (3-5 words) for a chat based on the first message. Reply with ONLY the title, nothing else. Examples: "Blockchain Basics", "Python Programming Guide", "Bitcoin Investment Tips".'
    
    const title = await callGroq(firstMessage, systemPrompt, 30)
    
    if (title && title.length > 0 && title.length < 60) {
      console.log(`✅ Generated chat title: "${title}"`)
      return title
    }
    
    // Fallback: Use first 50 characters of message
    return firstMessage.substring(0, 50)
  } catch (error) {
    console.error('Chat title generation error:', error.message)
    return firstMessage.substring(0, 50)
  }
}
