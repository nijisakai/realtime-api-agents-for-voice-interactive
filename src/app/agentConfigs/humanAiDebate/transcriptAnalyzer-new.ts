// 基于LLM的HumanAI对话分析系统 - 简化直接版
import { TranscriptItem } from '../../types';
import { getCurrentConversationState } from './conversationAnalyzer';

// 从转写记录中提取所有发言内容
function extractAllSpeeches(transcriptItems: TranscriptItem[]): { speaker: string; text: string; timestamp: number; status?: string }[] {
  console.log('📝 提取所有对话内容:', transcriptItems.length, '项');
  
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
        const speaker = item.role === 'assistant' ? 'AI' : 'Human';
        
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

// 主要的对话分析函数 - 适配HumanAI模式
let aiSpeechCount = 0; // 追踪AI发言次数
let topicFixed = false; // Topic是否已固定

export async function updateConversationStateFromTranscript(transcriptItems: TranscriptItem[]) {
  console.log('🚀 updateConversationStateFromTranscript (HumanAI) 被调用，转录条数:', transcriptItems.length);
  
  const speeches = extractAllSpeeches(transcriptItems);
  
  if (speeches.length === 0) {
    console.log('📭 没有找到有效的发言');
    return getCurrentConversationState();
  }

  // 统计AI发言次数
  const aiSpeeches = speeches.filter(speech => speech.speaker === 'AI');
  aiSpeechCount = aiSpeeches.length;
  
  console.log(`📊 当前状态: AI发言${aiSpeechCount}次, Topic已固定: ${topicFixed}`);

  // 第一次AI发言时就固定Topic
  if (aiSpeechCount >= 1 && !topicFixed) {
    console.log('🎯 AI第一次发言，开始固定Topic');
    await fixTopicFromSpeeches(speeches);
    topicFixed = true;
  }

  // 提取参与者观点并实时更新
  const participantSpeeches = speeches.filter(speech => speech.speaker === 'Human');
  if (participantSpeeches.length > 0) {
    console.log('💬 检测到人类发言，开始提取对话观点');
    await updateConversationViewpointsAndTags(speeches); // 传入所有发言用于分析
  } else {
    console.log('👤 只有AI发言，不进行观点分析');
  }

  return getCurrentConversationState();
}

// 固定对话Topic的函数
async function fixTopicFromSpeeches(speeches: { speaker: string; text: string; timestamp: number; status?: string }[]) {
  try {
    console.log('🎯 正在分析并固定对话主题...');
    
    const topicPrompt = `
请根据以下人机对话内容，提取出明确的讨论主题。只返回一个简洁的主题描述：

对话内容：
${speeches.map(speech => `${speech.speaker}: ${speech.text}`).join('\n')}

请直接返回讨论主题，不要其他内容。例如："人工智能的未来发展"
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
      const topic = data.result || 'Unknown Topic';
      setConversationTopic(topic);
      console.log('✅ Topic已固定:', topic);
    } else {
      console.warn('⚠️ Topic提取失败，使用默认');
      setConversationTopic('Human-AI Discussion');
    }
  } catch (error) {
    console.error('❌ Topic固定过程出错:', error);
    setConversationTopic('Human-AI Discussion');
  }
}

// 更新对话观点和标签的函数
async function updateConversationViewpointsAndTags(allSpeeches: { speaker: string; text: string; timestamp: number; status?: string }[]) {
  try {
    console.log('💭 正在更新对话观点和标签...');
    
    const viewpointPrompt = `
请分析以下人机对话内容，提取人类和AI的主要观点和关键词：

对话内容：
${allSpeeches.map((speech, i) => `${i+1}. ${speech.speaker}: ${speech.text}`).join('\n')}

请返回JSON格式：
{
  "human": {
    "viewpoint": "人类的核心观点一句话总结",
    "tags": ["关键词1", "关键词2", "关键词3"]
  },
  "ai": {
    "viewpoint": "AI的核心观点一句话总结", 
    "tags": ["关键词1", "关键词2", "关键词3"]
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
      const currentState = getCurrentConversationState();
      
      if (result.human) {
        currentState.participants.human.keyPoints = [result.human.viewpoint || 'Analyzing...'];
        currentState.participants.human.smartTags = result.human.tags || [];
        currentState.participants.human.speechCount = allSpeeches.filter(s => s.speaker === 'Human').length;
      }
      
      if (result.ai) {
        currentState.participants.ai.keyPoints = [result.ai.viewpoint || 'Analyzing...'];
        currentState.participants.ai.smartTags = result.ai.tags || [];
        currentState.participants.ai.speechCount = allSpeeches.filter(s => s.speaker === 'AI').length;
      }
      
      console.log('✅ 对话观点和标签已更新');
      
      // 触发UI更新
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('conversationStateUpdated', { detail: currentState }));
      }
      
    } else {
      console.warn('⚠️ 观点分析失败');
    }
  } catch (error) {
    console.error('❌ 观点更新过程出错:', error);
  }
}

// 设置对话主题的函数（需要在conversationAnalyzer.ts中实现）
function setConversationTopic(topic: string) {
  const currentState = getCurrentConversationState();
  if (!currentState.topic && topic.trim()) {
    currentState.topic = topic;
    currentState.currentTopic = topic;
    console.log('🎯 设置对话主题:', topic);
  }
}
