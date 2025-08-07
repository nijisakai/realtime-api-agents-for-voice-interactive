// Conversation state interface for human-AI discussions
export interface ConversationState {
  topic: string;
  participants: {
    human: {
      name: string;
      keyPoints: string[];
      speechCount: number;
      smartTags: string[];
    };
    ai: {
      name: string;
      keyPoints: string[];
      speechCount: number;
      smartTags: string[];
    };
  };
  currentTopic: string;
  keywords: string[];
  timeline: Array<{
    timestamp: string;
    speaker: 'human' | 'ai';
    content: string;
    keyPoints: string[];
  }>;
}

// Global conversation state
let currentConversationState: ConversationState = {
  topic: '',
  participants: {
    human: {
      name: 'Human',
      keyPoints: [],
      speechCount: 0,
      smartTags: []
    },
    ai: {
      name: 'AI',
      keyPoints: [],
      speechCount: 0,
      smartTags: []
    }
  },
  currentTopic: '',
  keywords: [],
  timeline: []
};

// Extract key viewpoints from conversation text
function extractKeyPoints(text: string): string[] {
  const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 10);
  return sentences.slice(0, 3).map(s => s.trim()); // Take the first 3 key sentences
}

// Extract keywords from text
function extractKeywords(text: string): string[] {
  // Simple keyword extraction (in real applications, more sophisticated NLP could be used)
  const words = text.match(/[\u4e00-\u9fa5]{2,}|\b[a-zA-Z]{3,}\b/g) || [];
  const wordFreq: Record<string, number> = {};
  
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

// Generate key tags based on conversation content
function generateSmartTags(keyPoints: string[]): string[] {
  const allText = keyPoints.join(' ');
  const tags: string[] = [];
  
  // Topic-based tags
  if (allText.includes('education') || allText.includes('learning')) tags.push('Education');
  if (allText.includes('technology') || allText.includes('AI')) tags.push('Technology');
  if (allText.includes('environment') || allText.includes('climate')) tags.push('Environment');
  if (allText.includes('economy') || allText.includes('business')) tags.push('Economy');
  if (allText.includes('health') || allText.includes('medical')) tags.push('Health');
  if (allText.includes('politics') || allText.includes('government')) tags.push('Politics');
  
  // Sentiment-based tags
  if (allText.includes('positive') || allText.includes('good') || allText.includes('benefit')) tags.push('Positive');
  if (allText.includes('negative') || allText.includes('problem') || allText.includes('issue')) tags.push('Critical');
  if (allText.includes('analysis') || allText.includes('research')) tags.push('Analytical');
  if (allText.includes('creative') || allText.includes('innovative')) tags.push('Creative');
  
  return tags.slice(0, 4); // Return up to 4 tags
}

// Analyze conversation and update state - enhanced with LLM
export async function analyzeConversationAndUpdate(args: any) {
  console.log('🤖 analyzeConversationAndUpdate called (LLM version):', args);
  
  const { speakerText, speaker } = args;
  
  if (!speakerText || !speaker) {
    console.log('⚠️ Missing speaker text or speaker identity');
    return { error: 'Speaker text and speaker identity are required' };
  }

  if (speaker !== 'human' && speaker !== 'ai') {
    console.log('⚠️ Invalid speaker:', speaker);
    return { error: 'Speaker must be either "human" or "ai"' };
  }

  try {
    // Use LLM to analyze the conversation content
    const analysisPrompt = `
You are a professional conversation analyst. Please analyze the following speech:

Speaker: ${speaker}
Content: "${speakerText}"

Please return analysis in JSON format:
{
  "keyPoints": ["key point 1", "key point 2"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "topic": "identified topic or theme",
  "smartTags": ["tag1", "tag2"],
  "summary": "brief summary of the main ideas"
}

Analysis requirements:
1. Extract up to 3 key viewpoints or arguments
2. Extract up to 5 meaningful keywords
3. Identify the main topic or theme being discussed
4. Generate up to 4 key tags that categorize the content
5. Provide a brief summary

Return only JSON, no other text.
`;

    console.log('🤖 Starting LLM analysis...');
    
    const response = await fetch('/api/llm-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: analysisPrompt,
        speeches: [speakerText] 
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM analysis failed: ${response.statusText}`);
    }

    const analysisResult = await response.json();
    console.log('✅ LLM analysis result:', analysisResult);

    const { keyPoints, keywords, topic, smartTags, summary } = analysisResult;
    
    // Update the participant's data
    const participant = currentConversationState.participants[speaker as 'human' | 'ai'];
    participant.keyPoints = [...participant.keyPoints, ...(keyPoints || [])];
    participant.speechCount++;
    participant.smartTags = [
      ...new Set([...participant.smartTags, ...(smartTags || [])])
    ].slice(0, 8); // Keep max 8 tags
    
    // Update global keywords
    currentConversationState.keywords = [
      ...new Set([...currentConversationState.keywords, ...(keywords || [])])
    ].slice(0, 10); // Keep max 10 keywords
    
    // Update topic if it's more specific than current
    if (topic && (!currentConversationState.currentTopic || topic.length > currentConversationState.currentTopic.length)) {
      currentConversationState.currentTopic = topic;
    }
    
    // Add to timeline
    currentConversationState.timeline.push({
      timestamp: new Date().toISOString(),
      speaker: speaker,
      content: speakerText,
      keyPoints: keyPoints || []
    });
    
    console.log('✅ Conversation state updated (LLM enhanced):', {
      speaker: speaker,
      keyPoints: keyPoints,
      keywords: keywords,
      topic: topic,
      smartTags: smartTags
    });
    
    return {
      message: `Analyzed ${speaker} speech successfully. ${summary || 'Key points extracted.'}`,
      speaker,
      keyPoints,
      keywords,
      topic,
      smartTags,
      currentState: currentConversationState
    };
    
  } catch (error) {
    console.error('❌ LLM analysis failed, using fallback:', error);
    
    // Fallback analysis
    const keyPoints = extractKeyPoints(speakerText);
    const keywords = extractKeywords(speakerText);
    const smartTags = generateSmartTags(keyPoints);
    
    // Update state (fallback method)
    const participant = currentConversationState.participants[speaker as 'human' | 'ai'];
    participant.keyPoints = [...participant.keyPoints, ...keyPoints];
    participant.speechCount++;
    participant.smartTags = [
      ...new Set([...participant.smartTags, ...smartTags])
    ].slice(0, 8);
    
    currentConversationState.keywords = [
      ...new Set([...currentConversationState.keywords, ...keywords])
    ].slice(0, 10);
    
    currentConversationState.timeline.push({
      timestamp: new Date().toISOString(),
      speaker: speaker,
      content: speakerText,
      keyPoints
    });
    
    return {
      message: `Analysis completed (fallback method) for ${speaker}`,
      speaker,
      keyPoints,
      keywords,
      smartTags,
      currentState: currentConversationState
    };
  }
}

// Get conversation status
export async function getConversationStatus() {
  console.log('getConversationStatus called, current state:', currentConversationState);
  return {
    message: 'Current conversation status',
    conversationState: currentConversationState,
    summary: {
      totalSpeeches: currentConversationState.timeline.length,
      humanSpeeches: currentConversationState.participants.human.speechCount,
      aiSpeeches: currentConversationState.participants.ai.speechCount,
      currentTopic: currentConversationState.currentTopic || 'Topic being identified...'
    }
  };
}

// Reset conversation state
export function resetConversationState(topic: string = '') {
  currentConversationState = {
    topic,
    participants: {
      human: {
        name: 'Human',
        keyPoints: [],
        speechCount: 0,
        smartTags: []
      },
      ai: {
        name: 'AI',
        keyPoints: [],
        speechCount: 0,
        smartTags: []
      }
    },
    currentTopic: '',
    keywords: [],
    timeline: []
  };
}

// Set conversation topic - 允许覆盖设置
export function setConversationTopic(topic: string) {
  if (topic.trim()) {
    currentConversationState.topic = topic;
    currentConversationState.currentTopic = topic;
    console.log('🎯 设置对话主题:', topic);
    
    // 触发UI更新
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('conversationStateUpdated', { 
        detail: currentConversationState 
      }));
    }
  }
}

// Get current conversation state (for UI display)
export function getCurrentConversationState(): ConversationState {
  return { ...currentConversationState };
}
