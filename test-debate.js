// 辩论测试模拟器 - 验证三角色系统和LLM分析
const testDebate = {
  // 模拟转写数据
  transcriptItems: [
    {
      type: 'MESSAGE',
      role: 'user',
      data: '我认为人工智能对社会发展有积极作用',
      title: '我认为人工智能对社会发展有积极作用'
    },
    {
      type: 'MESSAGE', 
      role: 'assistant',
      data: '感谢您的观点。现在请反方阐述不同的看法。',
      title: '感谢您的观点。现在请反方阐述不同的看法。'
    },
    {
      type: 'MESSAGE',
      role: 'user', 
      data: '但是AI也可能带来就业问题和隐私风险',
      title: '但是AI也可能带来就业问题和隐私风险'
    },
    {
      type: 'MESSAGE',
      role: 'assistant',
      data: '双方观点都很有价值。让我们深入探讨这个话题。',
      title: '双方观点都很有价值。让我们深入探讨这个话题。'
    },
    {
      type: 'MESSAGE',
      role: 'user',
      data: 'AI可以提高生产效率，创造新的工作机会',
      title: 'AI可以提高生产效率，创造新的工作机会'
    }
  ]
};

// 期望的分析结果
const expectedAnalysis = {
  roles: {
    participants: '参与者 (蓝色, 右对齐)',
    moderator: 'AI主持人 (紫色, 居中)',
    system: '系统 (灰色, 左对齐)'
  },
  llmAnalysis: {
    topic: 'AI对社会的影响',
    positive: {
      speeches: ['我认为人工智能对社会发展有积极作用', 'AI可以提高生产效率，创造新的工作机会'],
      consolidatedViewpoint: 'AI促进社会发展',
      smartTags: ['社会发展', '生产效率']
    },
    negative: {
      speeches: ['但是AI也可能带来就业问题和隐私风险'],
      consolidatedViewpoint: 'AI存在风险',
      smartTags: ['就业问题', '隐私风险']
    }
  }
};

console.log('🎯 辩论测试数据准备完成');
console.log('📊 期望分析结果:', expectedAnalysis);
