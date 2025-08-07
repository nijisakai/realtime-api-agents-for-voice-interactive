// 基于LLM的转写分析系统 - 简化直接版
import { TranscriptItem } from '../../types';
import { getCurrentDebateState, setDebateTopic } from './debateAnalyzer';

// 从转写记录中提取所有发言内容 - 包括AI主持人和参与者
function extractAllSpeeches(transcriptItems: TranscriptItem[]): { speaker: string; text: string; timestamp: number; status?: string }[] {
  console.log('📝 提取所有发言内容:', transcriptItems.length, '项');
  
  const speeches: { speaker: string; text: string; timestamp: number; status?: string }[] = [];
  
  transcriptItems.forEach((item, index) => {
    console.log(`📝 检查项目 ${index}:`, {
      type: item.type,
      role: item.role,
      title: item.title,
      status: item.status,
      hasData: !!item.data
    });
    
    // 只处理已完成的消息
    if (item.type === 'MESSAGE' && item.status === 'DONE') {
      let text = '';
      
      if (typeof item.data === 'string') {
        text = item.data;
      } else if (item.data && typeof item.data === 'object') {
        const dataObj = item.data as any;
        text = dataObj.transcript || 
               dataObj.text || 
               dataObj.content || 
               dataObj.message || 
               '';
      }
      
      // 备选：使用title作为fallback
      if (!text && item.title && item.title !== '[Transcribing...]') {
        text = item.title;
      }
      
      // 应用转写准确性改进
      text = text.trim();
      
      // 更严格的有效性检查
      if (text && text.length >= 3 && 
          text !== '[Transcribing...]' && 
          text !== '[inaudible]' &&
          !text.match(/^[。，！？\s]+$/)) {
        
        // 确定发言人身份
        const speaker = item.role === 'assistant' ? 'AI Moderator' : 'Participant';
        
        // 安全的时间戳处理
        let timestamp = Date.now();
        try {
          if (item.timestamp) {
            if (typeof item.timestamp === 'string') {
              const parsed = new Date(item.timestamp).getTime();
              if (!isNaN(parsed)) {
                timestamp = parsed;
              }
            } else if (typeof item.timestamp === 'number') {
              timestamp = item.timestamp;
            }
          }
        } catch (error) {
          console.warn('时间戳解析错误:', item.timestamp, error);
        }
        
        speeches.push({
          speaker: speaker,
          text: text,
          timestamp: timestamp,
          status: item.status
        });
        
        console.log(`✅ 提取发言 - ${speaker}: "${text.substring(0, 50)}..."`);
      }
    }
  });
  
  console.log(`📊 总共提取到 ${speeches.length} 条有效发言`);
  return speeches;
}

// 主要的LLM分析函数 - 简化版本，专注于核心需求
let moderatorSpeechCount = 0; // 追踪主持人发言次数
let topicFixed = false; // Topic是否已固定
let lastAnalyzedParticipantCount = 0; // 上次分析的参与者发言数量

export async function updateDebateStateFromTranscript(transcriptItems: TranscriptItem[]) {
  console.log('🚀 updateDebateStateFromTranscript 被调用，转录条数:', transcriptItems.length);
  
  const speeches = extractAllSpeeches(transcriptItems);
  
  if (speeches.length === 0) {
    console.log('📭 没有找到有效的发言');
    return getCurrentDebateState();
  }

  // 统计主持人和参与者发言次数
  const moderatorSpeeches = speeches.filter(speech => speech.speaker === 'AI Moderator');
  const participantSpeeches = speeches.filter(speech => speech.speaker === 'Participant');
  moderatorSpeechCount = moderatorSpeeches.length;
  
  console.log(`📊 当前状态: 主持人发言${moderatorSpeechCount}次, 参与者发言${participantSpeeches.length}次, Topic已固定: ${topicFixed}`);

  // 主持人第二次发言且至少有一次人类发言时固定Topic
  if (moderatorSpeechCount >= 2 && participantSpeeches.length > 0 && !topicFixed) {
    console.log('🎯 主持人第二次发言且有参与者发言，开始固定Topic');
    await fixTopicFromSpeeches(speeches);
    topicFixed = true;
  }

  // 提取参与者观点并实时更新（只有新的参与者发言时才更新）
  if (participantSpeeches.length > 0 && participantSpeeches.length > lastAnalyzedParticipantCount) {
    console.log(`💬 检测到新的参与者发言 (${participantSpeeches.length} vs ${lastAnalyzedParticipantCount})，开始提取观点`);
    await updateViewpointsAndTags(participantSpeeches);
    lastAnalyzedParticipantCount = participantSpeeches.length; // 更新计数器
  } else if (participantSpeeches.length === 0) {
    console.log('👥 没有参与者发言，不脑补观点');
  } else {
    console.log('🔄 参与者发言数量未变化，跳过观点分析');
  }

  return getCurrentDebateState();
}

// 固定辩论Topic的函数
async function fixTopicFromSpeeches(speeches: { speaker: string; text: string; timestamp: number; status?: string }[]) {
  try {
    console.log('🎯 正在分析并固定辩论Topic...');
    
    // 构建简单的Topic提取提示
    const topicPrompt = `
请根据以下对话内容，提取出明确的辩论主题。只返回一个简洁的主题描述：

对话内容：
${speeches.map(speech => `${speech.speaker}: ${speech.text}`).join('\n')}

请直接返回辩论主题，不要其他内容。例如："人工智能是否应该替代人类工作"
`;

    const response = await fetch('/api/llm-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: topicPrompt,
        context: 'Extracting debate topic',
        maxTokens: 100
      })
    });

    if (response.ok) {
      const data = await response.json();
      const topic = data.result || 'Unknown Topic'; // 直接使用result，不要访问topic属性
      setDebateTopic(topic);
      console.log('✅ Topic已固定:', topic);
    } else {
      console.warn('⚠️ Topic提取失败，使用默认');
      setDebateTopic('Debate Topic');
    }
  } catch (error) {
    console.error('❌ Topic固定过程出错:', error);
    setDebateTopic('Debate Topic');
  }
}

// 更新观点和标签的函数
async function updateViewpointsAndTags(participantSpeeches: { speaker: string; text: string; timestamp: number; status?: string }[]) {
  try {
    console.log('💭 正在更新观点和标签...');
    
    // 构建观点分析提示
    const viewpointPrompt = `
请分析以下参与者发言，将它们分为正方和反方观点，并为每方提取3个关键标签：

发言内容：
${participantSpeeches.map((speech, i) => `${i+1}. ${speech.text}`).join('\n')}

请返回JSON格式：
{
  "positive": {
    "viewpoint": "正方核心观点一句话总结",
    "tags": ["标签1", "标签2", "标签3"]
  },
  "negative": {
    "viewpoint": "反方核心观点一句话总结", 
    "tags": ["标签1", "标签2", "标签3"]
  }
}
`;

    const response = await fetch('/api/llm-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: viewpointPrompt,
        context: 'Analyzing viewpoints and tags',
        maxTokens: 500
      })
    });

    if (response.ok) {
      const data = await response.json();
      const result = data.result;
      
      console.log('📊 LLM分析结果:', result);
      
      // 更新状态
      const currentState = getCurrentDebateState();
      
      if (result.positive) {
        currentState.participants.positive.keyPoints = [result.positive.viewpoint || 'Analyzing...'];
        currentState.keywords.positive = result.positive.tags || [];
        currentState.participants.positive.smartTags = result.positive.tags || []; // 同时更新smartTags
        currentState.participants.positive.speechCount = Math.ceil(participantSpeeches.length / 2);
      }
      
      if (result.negative) {
        currentState.participants.negative.keyPoints = [result.negative.viewpoint || 'Analyzing...'];
        currentState.keywords.negative = result.negative.tags || [];
        currentState.participants.negative.smartTags = result.negative.tags || []; // 同时更新smartTags
        currentState.participants.negative.speechCount = Math.floor(participantSpeeches.length / 2);
      }
      
      // 改进胜率计算：基于实际发言数量和质量，而不是简单的均分
      const positiveSpeeches = participantSpeeches.filter((_, i) => i % 2 === 0).length;
      const negativeSpeeches = participantSpeeches.filter((_, i) => i % 2 === 1).length;
      const totalSpeeches = positiveSpeeches + negativeSpeeches;
      
      if (totalSpeeches > 0) {
        // 基于发言频率和LLM分析的观点强度计算胜率
        const basePositiveRate = Math.round((positiveSpeeches / totalSpeeches) * 100);
        const baseNegativeRate = 100 - basePositiveRate;
        
        // 如果某方没有观点，降低其胜率
        const positiveAdjustment = result.positive?.viewpoint && result.positive.viewpoint !== 'Analyzing...' ? 0 : -20;
        const negativeAdjustment = result.negative?.viewpoint && result.negative.viewpoint !== 'Analyzing...' ? 0 : -20;
        
        currentState.winRate.positive = Math.max(0, Math.min(100, basePositiveRate + positiveAdjustment));
        currentState.winRate.negative = Math.max(0, Math.min(100, baseNegativeRate + negativeAdjustment));
        
        // 确保总和为100
        const total = currentState.winRate.positive + currentState.winRate.negative;
        if (total !== 100) {
          currentState.winRate.positive = Math.round((currentState.winRate.positive / total) * 100);
          currentState.winRate.negative = 100 - currentState.winRate.positive;
        }
      } else {
        currentState.winRate.positive = 50;
        currentState.winRate.negative = 50;
      }
      
      currentState.participants.positive.speechCount = positiveSpeeches;
      currentState.participants.negative.speechCount = negativeSpeeches;
      
      console.log('✅ 观点和标签已更新');
      
      // 触发UI更新
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('debateStateUpdated', { detail: currentState }));
      }
      
    } else {
      console.warn('⚠️ 观点分析失败');
    }
  } catch (error) {
    console.error('❌ 观点更新过程出错:', error);
  }
}

