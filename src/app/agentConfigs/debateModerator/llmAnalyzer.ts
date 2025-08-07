interface Speech {
  speaker: string;
  text: string;
  timestamp: number;
  status?: string;
}

interface AnalysisResult {
  topic?: string;
  sentiment?: string;
  keyPoints?: string[];
  speakerViewpoints?: { [speaker: string]: string[] };
  emotionalTone?: string;
  persuasionTechniques?: string[];
  factualClaims?: string[];
  rhetoricalDevices?: string[];
  // 为了兼容 transcriptAnalyzer.ts，添加 positive 和 negative 结构
  positive?: {
    speeches: any[];
    consolidatedViewpoint?: string;
    smartTags?: string[];
  };
  negative?: {
    speeches: any[];
    consolidatedViewpoint?: string;
    smartTags?: string[];
  };
}

export async function analyzeSpeeches(speeches: Speech[]): Promise<AnalysisResult | null> {
  try {
    // 过滤完成的语音段落并增强提示
    const completedSpeeches = speeches.filter(speech => 
      speech.status === 'DONE' && 
      speech.text && 
      speech.text.length > 5 // 只分析有意义的文本
    );

    if (completedSpeeches.length === 0) {
      console.log('No completed speeches to analyze');
      return null;
    }

    // 构建详细的分析提示
    const analysisPrompt = `
As a professional debate analyst, analyze the following conversation content. Intelligently determine which statements are pro/con arguments:

Conversation Record:
${completedSpeeches.map(speech => {
  // 安全的时间戳处理
  let timeStr = 'Invalid time';
  try {
    if (speech.timestamp && typeof speech.timestamp === 'number') {
      const date = new Date(speech.timestamp);
      if (!isNaN(date.getTime())) {
        timeStr = date.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        });
      }
    } else if (speech.timestamp && typeof speech.timestamp === 'string') {
      const date = new Date(speech.timestamp);
      if (!isNaN(date.getTime())) {
        timeStr = date.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        });
      }
    }
  } catch (error) {
    console.warn('时间戳处理错误:', speech.timestamp, error);
    timeStr = 'Invalid time';
  }
  
  return `[${speech.speaker}] (${timeStr}): ${speech.text}`;
}).join('\n')}

CRITICAL INSTRUCTIONS:
1. ONLY extract viewpoints that are ACTUALLY EXPRESSED in the conversation above
2. DO NOT fabricate or invent any content not present in the transcript
3. If insufficient content exists, return empty arrays rather than making up viewpoints
4. Intelligently analyze ALL content (from both AI moderator and participants) to determine pro/con positions
5. Focus on extracting exactly 3 meaningful tags per side based on actual content

Please provide detailed JSON analysis:
{
  "topic": "Clear and concise debate topic in English",
  "sentiment": "overall emotional tendency (positive/negative/neutral)",
  "keyPoints": ["key argument 1", "key argument 2", "key argument 3"],
  "speakerViewpoints": {
    "Speaker A": ["viewpoint 1", "viewpoint 2"],
    "Speaker B": ["viewpoint 1", "viewpoint 2"]
  },
  "emotionalTone": "emotional tone description",
  "persuasionTechniques": ["pro argument tag 1", "pro argument tag 2", "pro argument tag 3"],
  "factualClaims": ["con argument tag 1", "con argument tag 2", "con argument tag 3"],
  "rhetoricalDevices": ["rhetorical device 1", "rhetorical device 2"]
}

Requirements:
1. Accurately extract the core debate topic
2. Intelligently assign pro/con positions based on content analysis
3. Extract exactly 3 meaningful tags per side
4. Return standard JSON format only
5. Base everything on real transcript content
`;

    const response = await fetch('/api/llm-analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: analysisPrompt,
        context: `Analyzing debate with ${completedSpeeches.length} speech segments`,
        maxTokens: 1500
      }),
    });

    if (!response.ok) {
      console.error('LLM API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('LLM analysis error:', data.error);
      return null;
    }

    // API现在返回已构建好的结构
    const analysisResult = data.result;
    
    console.log('✅ LLM Analysis successful:', {
      topic: analysisResult.topic,
      hasPositive: !!analysisResult.positive,
      hasNegative: !!analysisResult.negative,
      positiveSpeeches: analysisResult.positive?.speeches?.length || 0,
      negativeSpeeches: analysisResult.negative?.speeches?.length || 0
    });

    return analysisResult;

  } catch (error) {
    console.error('❌ Error in analyzeSpeeches:', error);
    return null;
  }
}
