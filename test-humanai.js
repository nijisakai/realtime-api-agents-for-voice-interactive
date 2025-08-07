// HumanAI讨论模式集成测试
console.log('🚀 测试HumanAI讨论模式');

// 模拟transcript数据
const mockTranscriptItems = [
  {
    type: 'MESSAGE',
    role: 'assistant', // AI
    status: 'DONE',
    data: 'Hello! I think artificial intelligence has great potential to help humanity solve complex problems.',
    timestamp: Date.now(),
    itemId: 'ai-1'
  },
  {
    type: 'MESSAGE', 
    role: 'user', // Human
    status: 'DONE',
    data: 'I agree, but I worry about job displacement. Many people could lose work to automation.',
    timestamp: Date.now() + 1000,
    itemId: 'human-1'
  },
  {
    type: 'MESSAGE',
    role: 'assistant', // AI
    status: 'DONE', 
    data: 'That\'s a valid concern. However, history shows that technology often creates new types of jobs even as it automates others. We should focus on retraining and education.',
    timestamp: Date.now() + 2000,
    itemId: 'ai-2'
  }
];

// 测试transcript analyzer
async function testHumanAiAnalysis() {
  try {
    // 导入分析函数
    const { updateConversationStateFromTranscript } = require('../src/app/agentConfigs/humanAiDebate/transcriptAnalyzer-new.ts');
    
    console.log('📝 开始分析模拟对话...');
    const result = await updateConversationStateFromTranscript(mockTranscriptItems);
    
    console.log('✅ 分析结果:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return null;
  }
}

// 执行测试
if (typeof window === 'undefined') {
  // Node.js 环境
  testHumanAiAnalysis();
} else {
  // 浏览器环境
  console.log('🌐 浏览器环境，HumanAI模式已准备就绪');
}
