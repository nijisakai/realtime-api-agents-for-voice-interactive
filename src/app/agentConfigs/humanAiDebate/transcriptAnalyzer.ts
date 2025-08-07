import { getCurrentConversationState } from './conversationAnalyzer';

// Update conversation state from transcript items
export async function updateConversationStateFromTranscript(transcriptItems: any[]) {
  console.log('🤖 Human-AI updateConversationStateFromTranscript called with items:', transcriptItems.length);
  
  if (!transcriptItems || transcriptItems.length === 0) {
    console.log('⚠️ No transcript items to analyze');
    return getCurrentConversationState();
  }

  try {
    // Combine all transcript text for analysis
    const allSpeeches = transcriptItems
      .filter(item => item.text && item.text.trim().length > 0)
      .map(item => ({
        text: item.text.trim(),
        speaker: item.speaker || 'unknown',
        timestamp: item.timestamp || new Date().toISOString()
      }));

    if (allSpeeches.length === 0) {
      console.log('⚠️ No valid speeches found in transcript');
      return getCurrentConversationState();
    }

    console.log('📝 Processing speeches:', allSpeeches.length);

    // Create comprehensive analysis prompt
    const analysisPrompt = `
You are a professional conversation analyst for human-AI discussions. Please analyze the following conversation transcript:

CONVERSATION TRANSCRIPT:
${allSpeeches.map((speech, index) => 
  `${index + 1}. Speaker: ${speech.speaker}\n   Content: "${speech.text}"\n`
).join('\n')}

Please provide a comprehensive analysis in the following JSON format:
{
  "currentTopic": "main topic being discussed",
  "conversationSummary": "brief summary of the entire conversation",
  "participants": {
    "human": {
      "keyPoints": ["human viewpoint 1", "human viewpoint 2", "human viewpoint 3"],
      "smartTags": ["tag1", "tag2", "tag3", "tag4"],
      "speechCount": 0,
      "mainPosition": "human's main stance or position"
    },
    "ai": {
      "keyPoints": ["ai viewpoint 1", "ai viewpoint 2", "ai viewpoint 3"],
      "smartTags": ["tag1", "tag2", "tag3", "tag4"],
      "speechCount": 0,
      "mainPosition": "ai's main stance or position"
    }
  },
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "conversationFlow": "description of how the conversation developed",
  "insights": "key insights or observations about the discussion"
}

Analysis Requirements:
1. Identify the main topic being discussed
2. Extract key viewpoints for both human and AI participants
3. Generate key tags that categorize the discussion themes
4. Count the number of speeches for each participant
5. Extract overall conversation keywords
6. Describe the flow and development of the conversation
7. Provide insights about the interaction

Focus on distinguishing between human and AI perspectives while maintaining objectivity.
Return only the JSON response, no additional text.
`;

    console.log('🤖 Sending comprehensive analysis request...');
    
    const response = await fetch('/api/llm-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: analysisPrompt,
        speeches: allSpeeches.map(s => s.text)
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM analysis failed: ${response.statusText}`);
    }

    const analysisResult = await response.json();
    console.log('✅ Comprehensive LLM analysis result:', analysisResult);

    // Structure the result to match our conversation state format
    const structuredState = {
      topic: analysisResult.currentTopic || '',
      currentTopic: analysisResult.currentTopic || '',
      participants: {
        human: {
          name: 'Human',
          keyPoints: analysisResult.participants?.human?.keyPoints || [],
          speechCount: analysisResult.participants?.human?.speechCount || 
                      allSpeeches.filter(s => s.speaker === 'human' || s.speaker === 'user').length,
          smartTags: analysisResult.participants?.human?.smartTags || []
        },
        ai: {
          name: 'AI',
          keyPoints: analysisResult.participants?.ai?.keyPoints || [],
          speechCount: analysisResult.participants?.ai?.speechCount || 
                      allSpeeches.filter(s => s.speaker === 'ai' || s.speaker === 'assistant').length,
          smartTags: analysisResult.participants?.ai?.smartTags || []
        }
      },
      keywords: analysisResult.keywords || [],
      timeline: allSpeeches.map(speech => ({
        timestamp: speech.timestamp,
        speaker: speech.speaker === 'user' ? 'human' : (speech.speaker === 'assistant' ? 'ai' : speech.speaker),
        content: speech.text,
        keyPoints: []
      }))
    };

    console.log('✅ Human-AI conversation analysis completed successfully');
    return structuredState;
    
  } catch (error) {
    console.error('❌ Human-AI transcript analysis failed:', error);
    
    // Fallback analysis
    const fallbackState = getCurrentConversationState();
    
    // Simple fallback processing
    const humanSpeeches = transcriptItems.filter(item => 
      item.speaker === 'human' || item.speaker === 'user'
    );
    const aiSpeeches = transcriptItems.filter(item => 
      item.speaker === 'ai' || item.speaker === 'assistant'
    );
    
    fallbackState.participants.human.speechCount = humanSpeeches.length;
    fallbackState.participants.ai.speechCount = aiSpeeches.length;
    
    if (humanSpeeches.length > 0) {
      fallbackState.participants.human.keyPoints = [
        humanSpeeches[humanSpeeches.length - 1]?.text?.substring(0, 100) + '...' || 'Recent human input'
      ];
    }
    
    if (aiSpeeches.length > 0) {
      fallbackState.participants.ai.keyPoints = [
        aiSpeeches[aiSpeeches.length - 1]?.text?.substring(0, 100) + '...' || 'Recent AI response'
      ];
    }
    
    console.log('📝 Using fallback analysis for Human-AI conversation');
    return fallbackState;
  }
}
