/**
 * Deterministic response generator for Piddu assistant.
 * No network calls, no LLM usage - purely pattern-based responses.
 */

interface ResponsePattern {
  keywords: string[];
  responses: string[];
}

const responsePatterns: ResponsePattern[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
    responses: [
      "Hello there! 👋 It's wonderful to chat with you! How can I help you today?",
      "Hi! 🌟 I'm so glad you're here! What would you like to talk about?",
      "Hey! 😊 Great to see you! What's on your mind?",
      "Greetings! ✨ I'm here and ready to help. What can I do for you?",
    ],
  },
  {
    keywords: ['memory', 'memories', 'remember', 'remembering', 'recall'],
    responses: [
      "Memories are such precious treasures! 💎 They help us hold onto the moments that matter most. What memory would you like to share or explore?",
      "Ah, memories! They're like little time capsules of joy. 🎁 This memory book is the perfect place to preserve them forever.",
      "Remembering is one of the most beautiful things we can do. 🌸 Each memory tells a story worth keeping.",
      "Memories connect us to our past and shape who we are. ✨ What special moment are you thinking about?",
    ],
  },
  {
    keywords: ['rapunzel', 'princess', 'hair', 'tower'],
    responses: [
      "Rapunzel's story is truly magical! 🏰 Her courage and kindness inspire so many. What aspect of her story speaks to you?",
      "Ah yes, Rapunzel! 💫 From her tower to her adventures, she's shown us the power of hope and determination.",
      "Rapunzel's journey is remarkable! 🌟 Whether it's her long golden hair or her brave heart, there's so much to admire.",
      "The tale of Rapunzel reminds us that even in difficult times, we can find our own light. ✨",
    ],
  },
  {
    keywords: ['help', 'assist', 'support', 'question'],
    responses: [
      "I'm here to help! 🤝 Feel free to ask me anything about memories, creativity, or just chat with me.",
      "Of course! I'd be happy to assist you. 💡 What do you need help with?",
      "That's what I'm here for! 😊 Ask away, and I'll do my best to provide helpful insights.",
      "I'm always ready to support you! 🌟 What question is on your mind?",
    ],
  },
  {
    keywords: ['thank', 'thanks', 'appreciate', 'grateful'],
    responses: [
      "You're very welcome! 😊 It's my pleasure to help you.",
      "Happy to help! 🌟 Feel free to reach out anytime you need assistance.",
      "No problem at all! 💫 I'm here whenever you need me.",
      "My pleasure! ✨ Your gratitude means a lot!",
    ],
  },
  {
    keywords: ['create', 'creative', 'creativity', 'imagine', 'imagination', 'idea', 'ideas'],
    responses: [
      "Creativity is the spark that brings ideas to life! 🎨 What are you imagining today?",
      "I love creative thinking! 💡 Every great memory starts with a creative moment. What's your idea?",
      "Imagination is limitless! ✨ Let your creativity flow and see where it takes you.",
      "Creative ideas are the seeds of wonderful memories! 🌱 What would you like to create?",
    ],
  },
  {
    keywords: ['happy', 'joy', 'joyful', 'excited', 'wonderful', 'amazing', 'great'],
    responses: [
      "That's wonderful to hear! 😄 Happiness is contagious, and I'm glad you're feeling great!",
      "How amazing! 🌟 Moments of joy are what make life beautiful.",
      "That's fantastic! ✨ Keep that positive energy flowing!",
      "I'm so happy for you! 💫 May your joy continue to grow!",
    ],
  },
  {
    keywords: ['sad', 'unhappy', 'down', 'upset', 'difficult', 'hard'],
    responses: [
      "I'm sorry you're feeling this way. 💙 Remember, even difficult moments can lead to growth and understanding.",
      "It's okay to feel down sometimes. 🌈 Every storm passes, and brighter days are ahead.",
      "I hear you. 💫 Be gentle with yourself, and know that you're not alone.",
      "Tough times don't last forever. 🌟 You're stronger than you know.",
    ],
  },
  {
    keywords: ['who are you', 'what are you', 'tell me about yourself', 'introduce'],
    responses: [
      "I'm Piddu, your friendly assistant! 🤖 I'm here to chat, help with questions, and make your experience more enjoyable.",
      "Great question! I'm Piddu - think of me as your helpful companion. 🌟 I love talking about memories, creativity, and all sorts of interesting topics!",
      "I'm Piddu! 💫 I'm designed to be a friendly, helpful presence here. I enjoy conversations and helping people explore their thoughts and memories.",
    ],
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'farewell'],
    responses: [
      "Goodbye! 👋 It was lovely chatting with you. Come back anytime!",
      "See you later! 🌟 Take care and have a wonderful day!",
      "Farewell for now! ✨ I'll be here whenever you want to chat again.",
      "Until next time! 💫 Wishing you all the best!",
    ],
  },
];

const fallbackResponses = [
  "That's an interesting thought! 🤔 Tell me more about what you're thinking.",
  "I appreciate you sharing that with me! 💭 What else would you like to explore?",
  "Hmm, that's something to ponder! 🌟 How does that relate to your memories or experiences?",
  "I'm listening! 👂 Feel free to elaborate on that idea.",
  "Interesting perspective! ✨ What made you think of that?",
  "I see what you mean! 💡 Would you like to dive deeper into that topic?",
  "That's a great point! 🎯 What are your thoughts on it?",
  "I'm here to chat about anything! 😊 What else is on your mind?",
];

export function generatePidduResponse(userInput: string): string {
  const normalizedInput = userInput.toLowerCase().trim();

  // Check for pattern matches
  for (const pattern of responsePatterns) {
    for (const keyword of pattern.keywords) {
      if (normalizedInput.includes(keyword)) {
        // Return a random response from the matching pattern
        const randomIndex = Math.floor(Math.random() * pattern.responses.length);
        return pattern.responses[randomIndex];
      }
    }
  }

  // If no pattern matches, return a fallback response
  const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
  return fallbackResponses[randomIndex];
}
