import { useState, useEffect } from 'react'

export default function ChatBubble({ message, sender, timestamp, isTyping = false }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (sender === 'bot' && !isComplete && isTyping) {
      let index = 0
      const text = message || ''
      
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1))
          index++
        } else {
          setIsComplete(true)
          clearInterval(interval)
        }
      }, 20) // 20ms per character for smooth typing effect

      return () => clearInterval(interval)
    } else {
      setDisplayedText(message)
      setIsComplete(true)
    }
  }, [message, sender, isTyping, isComplete])

  // Format text with markdown-like syntax
  const formatText = (text) => {
    if (!text) return null

    // Split by lines
    const lines = text.split('\n')
    
    return lines.map((line, idx) => {
      // Handle headings (# Heading)
      if (line.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-xl font-bold mb-3 mt-2">
            {line.substring(2)}
          </h2>
        )
      }

      // Handle bold text (**text**)
      const parts = line.split(/(\*\*.*?\*\*)/)
      const formatted = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
        }
        return part
      })

      // Handle horizontal rules (---)
      if (line.trim() === '---') {
        return <hr key={idx} className="my-3 border-gray-300 dark:border-gray-600" />
      }

      // Handle links [text](url)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
      let linkFormatted = formatted
      if (typeof formatted === 'string' || (Array.isArray(formatted) && formatted.every(f => typeof f === 'string'))) {
        const lineText = Array.isArray(formatted) ? formatted.join('') : formatted
        if (linkRegex.test(lineText)) {
          linkFormatted = lineText.split(linkRegex).map((part, i) => {
            if (i % 3 === 1) {
              // Link text
              return <a key={i} href={lineText.match(linkRegex)?.[Math.floor(i/3)]?.match(/\(([^)]+)\)/)?.[1]} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{part}</a>
            } else if (i % 3 === 2) {
              // Link URL (skip, already handled)
              return null
            }
            return part
          })
        }
      }

      // Regular paragraph
      if (line.trim()) {
        return (
          <p key={idx} className="mb-2">
            {linkFormatted}
          </p>
        )
      }

      // Empty line
      return <br key={idx} />
    })
  }

  const isUser = sender === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}>
      <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-primary text-white rounded-br-none'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
          } shadow-md`}
        >
          <div className="text-sm md:text-base break-words">
            {sender === 'bot' ? formatText(displayedText) : displayedText}
            {sender === 'bot' && !isComplete && (
              <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse"></span>
            )}
          </div>
        </div>
        {timestamp && (
          <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}
