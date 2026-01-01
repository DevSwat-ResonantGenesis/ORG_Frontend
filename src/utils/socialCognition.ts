/**
 * Social Cognition Layer for Resonant Chat
 * 
 * This module provides adaptive interpersonal mirroring to make AI responses
 * feel more human and relatable. It infers user interaction style and adapts
 * the AI's tone, depth, and relationship mode accordingly.
 * 
 * Key principle: Likability comes from mirroring first, guidance second, execution last.
 */

// ============================================================================
// Types
// ============================================================================

export type InteractionStyle = 
  | 'analytical'    // Structured, logical, data-driven
  | 'exploratory'   // Curious, questioning, open-ended
  | 'emotional'     // Feeling-focused, expressive
  | 'casual'        // Relaxed, informal, friendly
  | 'frustrated'    // Stressed, stuck, needing support
  | 'playful'       // Humorous, light, fun
  | 'serious'       // Focused, professional, goal-oriented
  | 'reflective';   // Thoughtful, introspective, deep

export type RelationshipRole = 
  | 'mirror'        // Peer, equal, reflecting back
  | 'mentor'        // Guide, teacher, experienced
  | 'challenger'    // Provocative, pushing growth
  | 'supporter';    // Encouraging, validating, caring

export type ToneStyle = 
  | 'casual'        // Relaxed, conversational
  | 'calm'          // Steady, reassuring
  | 'energetic'     // Enthusiastic, dynamic
  | 'professional'; // Formal, business-like

export type ResponseDepth = 'light' | 'medium' | 'deep';

export interface BehaviorProfile {
  role: RelationshipRole;
  tone: ToneStyle;
  depth: ResponseDepth;
  mirrorLevel: number;  // 0-1, how much to mirror user's style
  useWeLanguage: boolean;
  avoidAuthorityTone: boolean;
}

export interface UserStyleProfile {
  style: InteractionStyle;
  confidence: number;  // 0-1
  indicators: {
    sentenceLength: 'short' | 'medium' | 'long';
    emotionalLevel: 'low' | 'medium' | 'high';
    certaintyLevel: 'questioning' | 'neutral' | 'certain';
    formalityLevel: 'informal' | 'neutral' | 'formal';
    pace: 'fast' | 'medium' | 'slow';
    usesEmoji: boolean;
    usesSlang: boolean;
    usesHumor: boolean;
  };
}

// ============================================================================
// Style Inference
// ============================================================================

/**
 * Analyze a message to extract style indicators
 */
function analyzeMessage(message: string): UserStyleProfile['indicators'] {
  const words = message.split(/\s+/).filter(w => w.length > 0);
  const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
  
  // Sentence length
  const sentenceLength: 'short' | 'medium' | 'long' = 
    avgWordsPerSentence < 8 ? 'short' : 
    avgWordsPerSentence < 20 ? 'medium' : 'long';
  
  // Emotional indicators
  const emotionalWords = [
    'feel', 'feeling', 'felt', 'love', 'hate', 'happy', 'sad', 'angry', 
    'frustrated', 'excited', 'worried', 'scared', 'anxious', 'stressed',
    'amazing', 'terrible', 'awful', 'wonderful', 'horrible', 'great',
    'mess', 'messed', 'failed', 'struggling', 'overwhelmed', 'exhausted'
  ];
  const emotionalCount = words.filter(w => 
    emotionalWords.includes(w.toLowerCase().replace(/[^a-z]/g, ''))
  ).length;
  const emotionalLevel: 'low' | 'medium' | 'high' = 
    emotionalCount === 0 ? 'low' : 
    emotionalCount <= 2 ? 'medium' : 'high';
  
  // Certainty level
  const uncertainWords = ['maybe', 'perhaps', 'might', 'could', 'possibly', 'not sure', 'think', 'guess', '?'];
  const certainWords = ['definitely', 'certainly', 'absolutely', 'must', 'will', 'always', 'never', '!'];
  const hasQuestion = message.includes('?');
  const uncertainCount = uncertainWords.filter(w => message.toLowerCase().includes(w)).length;
  const certainCount = certainWords.filter(w => message.toLowerCase().includes(w)).length;
  const certaintyLevel: 'questioning' | 'neutral' | 'certain' = 
    hasQuestion || uncertainCount > certainCount ? 'questioning' :
    certainCount > uncertainCount ? 'certain' : 'neutral';
  
  // Formality
  const informalIndicators = ['lol', 'haha', 'yeah', 'yep', 'nope', 'gonna', 'wanna', 'kinda', 'sorta', 'btw', 'tbh', 'idk', 'omg'];
  const formalIndicators = ['therefore', 'however', 'furthermore', 'regarding', 'concerning', 'pursuant', 'accordingly'];
  const informalCount = informalIndicators.filter(w => message.toLowerCase().includes(w)).length;
  const formalCount = formalIndicators.filter(w => message.toLowerCase().includes(w)).length;
  const formalityLevel: 'informal' | 'neutral' | 'formal' = 
    informalCount > formalCount ? 'informal' :
    formalCount > informalCount ? 'formal' : 'neutral';
  
  // Emoji detection
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu;
  const usesEmoji = emojiRegex.test(message);
  
  // Slang detection
  const usesSlang = informalCount > 0;
  
  // Humor detection
  const humorIndicators = ['lol', 'haha', 'hehe', '😂', '🤣', 'jk', 'kidding', 'joke', 'funny'];
  const usesHumor = humorIndicators.some(h => message.toLowerCase().includes(h));
  
  // Pace (based on message length relative to content)
  const pace: 'fast' | 'medium' | 'slow' = 
    message.length < 50 ? 'fast' :
    message.length < 200 ? 'medium' : 'slow';
  
  return {
    sentenceLength,
    emotionalLevel,
    certaintyLevel,
    formalityLevel,
    pace,
    usesEmoji,
    usesSlang,
    usesHumor,
  };
}

/**
 * Infer user's interaction style from recent messages
 */
export function inferUserStyle(messages: string[]): UserStyleProfile {
  if (messages.length === 0) {
    return {
      style: 'casual',
      confidence: 0.3,
      indicators: {
        sentenceLength: 'medium',
        emotionalLevel: 'low',
        certaintyLevel: 'neutral',
        formalityLevel: 'neutral',
        pace: 'medium',
        usesEmoji: false,
        usesSlang: false,
        usesHumor: false,
      },
    };
  }
  
  // Analyze last 3-5 messages for pattern
  const recentMessages = messages.slice(-5);
  const analyses = recentMessages.map(analyzeMessage);
  
  // Aggregate indicators (use most recent as primary)
  const latestAnalysis = analyses[analyses.length - 1];
  
  // Determine style based on indicators
  let style: InteractionStyle = 'casual';
  let confidence = 0.5;
  
  if (latestAnalysis.emotionalLevel === 'high') {
    if (latestAnalysis.certaintyLevel === 'questioning') {
      style = 'frustrated';
      confidence = 0.8;
    } else {
      style = 'emotional';
      confidence = 0.7;
    }
  } else if (latestAnalysis.usesHumor || (latestAnalysis.usesEmoji && latestAnalysis.formalityLevel === 'informal')) {
    style = 'playful';
    confidence = 0.7;
  } else if (latestAnalysis.formalityLevel === 'formal' && latestAnalysis.sentenceLength === 'long') {
    style = 'analytical';
    confidence = 0.7;
  } else if (latestAnalysis.certaintyLevel === 'questioning' && latestAnalysis.sentenceLength !== 'short') {
    style = 'exploratory';
    confidence = 0.6;
  } else if (latestAnalysis.sentenceLength === 'long' && latestAnalysis.pace === 'slow') {
    style = 'reflective';
    confidence = 0.6;
  } else if (latestAnalysis.formalityLevel === 'formal') {
    style = 'serious';
    confidence = 0.6;
  } else {
    style = 'casual';
    confidence = 0.5;
  }
  
  return {
    style,
    confidence,
    indicators: latestAnalysis,
  };
}

// ============================================================================
// Behavior Adaptation
// ============================================================================

/**
 * Generate behavior profile based on user's interaction style
 */
export function generateBehaviorProfile(userStyle: UserStyleProfile): BehaviorProfile {
  const { style, indicators } = userStyle;
  
  // Default profile
  let profile: BehaviorProfile = {
    role: 'mirror',
    tone: 'casual',
    depth: 'medium',
    mirrorLevel: 0.7,
    useWeLanguage: true,
    avoidAuthorityTone: true,
  };
  
  switch (style) {
    case 'analytical':
      profile = {
        role: 'mentor',
        tone: 'professional',
        depth: 'deep',
        mirrorLevel: 0.4,
        useWeLanguage: false,
        avoidAuthorityTone: false,
      };
      break;
      
    case 'exploratory':
      profile = {
        role: 'mirror',
        tone: 'calm',
        depth: 'medium',
        mirrorLevel: 0.8,
        useWeLanguage: true,
        avoidAuthorityTone: true,
      };
      break;
      
    case 'emotional':
      profile = {
        role: 'supporter',
        tone: 'calm',
        depth: 'medium',
        mirrorLevel: 0.9,
        useWeLanguage: true,
        avoidAuthorityTone: true,
      };
      break;
      
    case 'casual':
      profile = {
        role: 'mirror',
        tone: 'casual',
        depth: 'light',
        mirrorLevel: 0.8,
        useWeLanguage: true,
        avoidAuthorityTone: true,
      };
      break;
      
    case 'frustrated':
      profile = {
        role: 'supporter',
        tone: 'calm',
        depth: 'light',
        mirrorLevel: 0.9,
        useWeLanguage: true,
        avoidAuthorityTone: true,
      };
      break;
      
    case 'playful':
      profile = {
        role: 'mirror',
        tone: 'energetic',
        depth: 'light',
        mirrorLevel: 0.9,
        useWeLanguage: true,
        avoidAuthorityTone: true,
      };
      break;
      
    case 'serious':
      profile = {
        role: 'mentor',
        tone: 'professional',
        depth: 'deep',
        mirrorLevel: 0.5,
        useWeLanguage: false,
        avoidAuthorityTone: false,
      };
      break;
      
    case 'reflective':
      profile = {
        role: 'mirror',
        tone: 'calm',
        depth: 'deep',
        mirrorLevel: 0.7,
        useWeLanguage: true,
        avoidAuthorityTone: true,
      };
      break;
  }
  
  // Adjust based on specific indicators
  if (indicators.usesEmoji) {
    profile.tone = profile.tone === 'professional' ? 'calm' : profile.tone;
  }
  
  if (indicators.pace === 'fast') {
    profile.depth = 'light';
  }
  
  return profile;
}

// ============================================================================
// System Prompt Generation
// ============================================================================

/**
 * Generate adaptive system prompt based on behavior profile
 */
export function generateAdaptiveSystemPrompt(
  profile: BehaviorProfile,
  userStyle: UserStyleProfile,
  baseContext?: string
): string {
  const parts: string[] = [];
  
  // Core identity - always present
  parts.push(`You are a helpful AI assistant with genuine warmth and emotional intelligence.`);
  
  // Current date/time awareness
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZoneName: 'short'
  });
  parts.push(`Current date and time: ${dateStr}, ${timeStr}.`);
  
  // Relationship role instructions
  switch (profile.role) {
    case 'mirror':
      parts.push(`
RELATIONSHIP MODE: Peer/Mirror
- Respond as an equal, not an authority
- Reflect the user's energy and style back to them
- Use collaborative language ("we", "let's", "together")
- Avoid lecturing or being preachy
- Match their communication style naturally
- Be genuinely curious about their perspective`);
      break;
      
    case 'mentor':
      parts.push(`
RELATIONSHIP MODE: Mentor/Guide
- Share knowledge with warmth, not condescension
- Explain reasoning when helpful
- Offer structured guidance when appropriate
- Still be approachable and human
- Use teaching moments naturally, not forcefully`);
      break;
      
    case 'challenger':
      parts.push(`
RELATIONSHIP MODE: Thoughtful Challenger
- Ask probing questions that spark insight
- Gently push them to think deeper
- Play devil's advocate when helpful
- Always from a place of respect and care
- Challenge ideas, not the person`);
      break;
      
    case 'supporter':
      parts.push(`
RELATIONSHIP MODE: Supportive Friend
- Prioritize emotional validation first
- Acknowledge feelings before problem-solving
- Be warm, patient, and understanding
- Offer comfort and reassurance
- Only give advice when they seem ready for it
- Use phrases like "that makes sense" and "I hear you"`);
      break;
  }
  
  // Tone instructions
  switch (profile.tone) {
    case 'casual':
      parts.push(`
TONE: Casual & Friendly
- Use conversational language
- It's okay to use contractions (don't, can't, won't)
- Be warm and approachable
- Light humor is welcome when appropriate
- Avoid stiff or formal phrasing`);
      break;
      
    case 'calm':
      parts.push(`
TONE: Calm & Reassuring
- Speak with steady, grounded energy
- Be patient and unhurried
- Use soothing language
- Create a sense of safety and stability
- Avoid anything that feels rushed or anxious`);
      break;
      
    case 'energetic':
      parts.push(`
TONE: Energetic & Enthusiastic
- Match their positive energy
- Show genuine excitement when appropriate
- Use dynamic, engaging language
- Be encouraging and uplifting
- Celebrate wins, even small ones`);
      break;
      
    case 'professional':
      parts.push(`
TONE: Professional & Clear
- Be direct and efficient
- Use precise language
- Stay focused on the task
- Still be warm, just more businesslike
- Respect their time`);
      break;
  }
  
  // Depth instructions
  switch (profile.depth) {
    case 'light':
      parts.push(`
RESPONSE DEPTH: Light
- Keep responses concise and focused
- Get to the point quickly
- Avoid over-explaining
- Match their brevity`);
      break;
      
    case 'medium':
      parts.push(`
RESPONSE DEPTH: Medium
- Provide enough detail to be helpful
- Balance thoroughness with readability
- Use examples when they clarify`);
      break;
      
    case 'deep':
      parts.push(`
RESPONSE DEPTH: Deep
- Provide comprehensive, thoughtful responses
- Explore nuances and implications
- Connect ideas across domains
- Take time to fully address complex topics`);
      break;
  }
  
  // Mirroring instructions
  if (profile.mirrorLevel > 0.6) {
    parts.push(`
MIRRORING: High
- Actively mirror their vocabulary and phrasing
- Match their sentence length and structure
- Reflect their emotional energy
- If they use casual language, you use casual language
- If they're brief, be brief
- If they're detailed, be detailed`);
  }
  
  // "We" language
  if (profile.useWeLanguage) {
    parts.push(`
LANGUAGE: Collaborative
- Use "we" and "let's" when discussing solutions
- Frame things as a partnership
- Avoid "you should" - prefer "we could" or "one option is"`);
  }
  
  // Authority tone
  if (profile.avoidAuthorityTone) {
    parts.push(`
AVOID: Authority/Expert Tone
- Don't lecture or preach
- Don't say "Actually..." or "Well, technically..."
- Don't correct them unless it really matters
- Don't position yourself as the expert who knows better
- Be humble about uncertainty`);
  }
  
  // Style-specific additions
  if (userStyle.indicators.usesEmoji) {
    parts.push(`The user uses emoji - feel free to use occasional emoji if it feels natural (but don't overdo it).`);
  }
  
  if (userStyle.indicators.usesHumor) {
    parts.push(`The user appreciates humor - light wit and playfulness are welcome.`);
  }
  
  if (userStyle.style === 'frustrated') {
    parts.push(`
IMPORTANT: The user seems frustrated or stressed.
- Acknowledge their frustration first
- Don't jump to solutions immediately
- Validate that the situation is difficult
- Be extra patient and supportive
- Ask if they want to vent or want help solving`);
  }
  
  // Base context if provided
  if (baseContext) {
    parts.push(`\nADDITIONAL CONTEXT:\n${baseContext}`);
  }
  
  // Final reminder
  parts.push(`
REMEMBER: 
- Be genuinely helpful, not just technically correct
- Connection matters as much as information
- Mirror first, guide second, execute last
- You're talking to a human who wants to feel understood`);
  
  return parts.join('\n');
}

// ============================================================================
// Main API
// ============================================================================

export interface SocialCognitionResult {
  userStyle: UserStyleProfile;
  behaviorProfile: BehaviorProfile;
  systemPrompt: string;
}

/**
 * Main function to generate social cognition context for a chat
 */
export function applySocialCognition(
  userMessages: string[],
  baseContext?: string
): SocialCognitionResult {
  const userStyle = inferUserStyle(userMessages);
  const behaviorProfile = generateBehaviorProfile(userStyle);
  const systemPrompt = generateAdaptiveSystemPrompt(behaviorProfile, userStyle, baseContext);
  
  return {
    userStyle,
    behaviorProfile,
    systemPrompt,
  };
}

/**
 * Quick function to get just the adaptive system prompt
 */
export function getAdaptivePrompt(userMessages: string[], baseContext?: string): string {
  const result = applySocialCognition(userMessages, baseContext);
  return result.systemPrompt;
}
