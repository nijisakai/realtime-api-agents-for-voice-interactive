// Debate state interface
export interface DebateState {
  topic: string;
  participants: {
    positive: {
      name: string;
      voiceCharacteristics?: string;
      keyPoints: string[];
      speechCount: number;
      smartTags?: string[];
    };
    negative: {
      name: string;
      voiceCharacteristics?: string;
      keyPoints: string[];
      speechCount: number;
      smartTags?: string[];
    };
  };
  currentRound: number;
  winRate: {
    positive: number;
    negative: number;
  };
  keywords: {
    positive: string[];
    negative: string[];
  };
  currentTopic?: string;
  timeline: Array<{
    timestamp: string;
    speaker: 'positive' | 'negative';
    content: string;
    keyPoints: string[];
  }>;
}

// Global debate state
let currentDebateState: DebateState = {
  topic: '',
  participants: {
    positive: {
      name: 'Pro',
      keyPoints: [],
      speechCount: 0,
      smartTags: []
    },
    negative: {
      name: 'Con', 
      keyPoints: [],
      speechCount: 0,
      smartTags: []
    }
  },
  currentRound: 1,
  winRate: {
    positive: 50,
    negative: 50
  },
  keywords: {
    positive: [],
    negative: []
  },
  timeline: []
};

// 分析发言人立场的函数
function identifySpeakerStance(text: string): 'positive' | 'negative' | 'unclear' {
  const positiveIndicators = [
    '我支持', '我赞成', '我认为这是对的', '正方观点', '我们这边认为',
    '这个观点是正确的', '我同意', '支持这个观点', '赞同', '正确的是'
  ];
  
  const negativeIndicators = [
    '我反对', '我不赞成', '我认为这是错的', '反方观点', '我们反对',
    '这个观点是错误的', '我不同意', '反对这个观点', '不赞同', '错误的是'
  ];
  
  const lowerText = text.toLowerCase();
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveIndicators.forEach(indicator => {
    if (lowerText.includes(indicator)) positiveScore++;
  });
  
  negativeIndicators.forEach(indicator => {
    if (lowerText.includes(indicator)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'unclear';
}

// 提取关键观点
function extractKeyPoints(text: string): string[] {
  const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 10);
  return sentences.slice(0, 3).map(s => s.trim()); // 取前3个关键句子
}

// 提取关键词
function extractKeywords(text: string): string[] {
  // 简单的关键词提取（实际应用中可以使用更复杂的NLP算法）
  const words = text.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  const wordFreq: Record<string, number> = {};
  
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

// 计算胜率（基于发言质量、逻辑性等因素）
function calculateWinRate(positivePoints: string[], negativePoints: string[]): { positive: number; negative: number } {
  // 简化的胜率计算，基于观点数量和质量
  const positiveQuality = positivePoints.reduce((acc, point) => acc + point.length, 0);
  const negativeQuality = negativePoints.reduce((acc, point) => acc + point.length, 0);
  
  const total = positiveQuality + negativeQuality;
  if (total === 0) return { positive: 50, negative: 50 };
  
  const positiveRate = Math.round((positiveQuality / total) * 100);
  const negativeRate = 100 - positiveRate;
  
  return { positive: positiveRate, negative: negativeRate };
}

// 分析发言并更新辩论状态 - 使用LLM增强版
export async function analyzeSpeakerAndUpdateDebate(args: any) {
  console.log('🤖 analyzeSpeakerAndUpdateDebate 被调用 (LLM版):', args);
  
  const { speakerText, speakerVoiceCharacteristics } = args;
  
  if (!speakerText) {
    console.log('⚠️ 发言内容为空');
    return { error: '发言内容不能为空' };
  }

  try {
    // 使用LLM分析单条发言
    const analysisPrompt = `
你是一个专业的辩论分析专家。请分析以下发言：

发言内容："${speakerText}"

请判断并返回JSON格式：
{
  "stance": "positive/negative/unclear",
  "confidence": 0.8,
  "keyPoints": ["核心观点1", "核心观点2"],
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "reasoning": "判断理由"
}

分析要求：
1. 根据发言内容判断是支持方(positive)还是反对方(negative)
2. 如果无法确定立场，返回unclear
3. 提取最多3个核心观点
4. 提取最多5个有意义的关键词
5. 说明判断的理由

请只返回JSON，不要其他文字。
`;

    console.log('🤖 正在进行LLM分析...');
    
    const response = await fetch('/api/llm-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: analysisPrompt,
        speeches: [speakerText] 
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM分析失败: ${response.statusText}`);
    }

    const analysisResult = await response.json();
    console.log('✅ LLM分析结果:', analysisResult);

    const { stance, keyPoints, keywords, reasoning } = analysisResult;
    
    if (stance === 'unclear') {
      console.log('❓ LLM判断立场不明确:', reasoning);
      return {
        message: `立场不够明确：${reasoning}。请明确表达支持或反对的观点。`,
        currentState: currentDebateState
      };
    }
    
    // 确保stance是正确的类型
    const validStance = stance as 'positive' | 'negative';
    
    // 更新对应立场的数据
    const participant = currentDebateState.participants[validStance];
    participant.keyPoints = [...participant.keyPoints, ...(keyPoints || [])];
    participant.speechCount++;
    
    if (speakerVoiceCharacteristics && !participant.voiceCharacteristics) {
      participant.voiceCharacteristics = speakerVoiceCharacteristics;
    }
    
    // 更新关键词
    currentDebateState.keywords[validStance] = [
      ...new Set([...currentDebateState.keywords[validStance], ...(keywords || [])])
    ].slice(0, 8); // 保持最多8个关键词
    
    // 添加到时间线
    currentDebateState.timeline.push({
      timestamp: new Date().toISOString(),
      speaker: validStance,
      content: speakerText,
      keyPoints: keyPoints || []
    });
    
    // 重新计算胜率
    currentDebateState.winRate = calculateWinRate(
      currentDebateState.participants.positive.keyPoints,
      currentDebateState.participants.negative.keyPoints
    );
    
    console.log('✅ 辩论状态已更新 (LLM增强):', {
      立场: validStance,
      观点: keyPoints,
      关键词: keywords,
      推理: reasoning,
      当前胜率: currentDebateState.winRate
    });
    
    return {
      message: `已分析发言立场为${validStance === 'positive' ? '正方' : '反方'}。${reasoning}`,
      stance: validStance,
      keyPoints,
      keywords,
      currentState: currentDebateState
    };
    
  } catch (error) {
    console.error('❌ LLM分析失败，使用备用方案:', error);
    
    // 备用分析方案
    const stance = identifySpeakerStance(speakerText);
    const keyPoints = extractKeyPoints(speakerText);
    const keywords = extractKeywords(speakerText);
    
    if (stance === 'unclear') {
      return {
        message: '无法明确识别发言立场，请明确表达支持或反对的观点',
        currentState: currentDebateState
      };
    }
    
    // 更新状态（备用方案）
    const participant = currentDebateState.participants[stance];
    participant.keyPoints = [...participant.keyPoints, ...keyPoints];
    participant.speechCount++;
    
    currentDebateState.keywords[stance] = [
      ...new Set([...currentDebateState.keywords[stance], ...keywords])
    ].slice(0, 8);
    
    currentDebateState.timeline.push({
      timestamp: new Date().toISOString(),
      speaker: stance,
      content: speakerText,
      keyPoints
    });
    
    currentDebateState.winRate = calculateWinRate(
      currentDebateState.participants.positive.keyPoints,
      currentDebateState.participants.negative.keyPoints
    );
    
    return {
      message: `分析完成（备用方案），识别立场为${stance === 'positive' ? '正方' : '反方'}`,
      stance,
      keyPoints,
      keywords,
      currentState: currentDebateState
    };
  }
}

// 获取辩论状态
export async function getDebateStatus() {
  console.log('getDebateStatus 被调用，当前状态:', currentDebateState);
  return {
    message: '当前辩论状态',
    debateState: currentDebateState,
    summary: {
      totalSpeeches: currentDebateState.timeline.length,
      positiveSpeeches: currentDebateState.participants.positive.speechCount,
      negativeSpeeches: currentDebateState.participants.negative.speechCount,
      currentWinner: currentDebateState.winRate.positive > currentDebateState.winRate.negative ? '正方' : '反方'
    }
  };
}

// 重置辩论状态
export function resetDebateState(topic: string = '') {
  currentDebateState = {
    topic,
    participants: {
      positive: {
        name: '正方',
        keyPoints: [],
        speechCount: 0
      },
      negative: {
        name: '反方',
        keyPoints: [],
        speechCount: 0
      }
    },
    currentRound: 1,
    winRate: {
      positive: 50,
      negative: 50
    },
    keywords: {
      positive: [],
      negative: []
    },
    timeline: []
  };
}

// 设置辩论主题（只在主题为空时设置）
export function setDebateTopic(topic: string) {
  if (!currentDebateState.topic && topic.trim()) {
    currentDebateState.topic = topic;
    currentDebateState.currentTopic = topic; // 同时设置currentTopic供UI使用
    console.log('🎯 设置辩论主题:', topic);
  } else if (currentDebateState.topic) {
    console.log('⚠️ 辩论主题已存在，不再更改:', currentDebateState.topic);
  }
}

// 获取当前辩论状态（用于UI显示）
export function getCurrentDebateState(): DebateState {
  return { ...currentDebateState };
}
