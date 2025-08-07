// 快速测试辩论分析功能
console.log('🧪 开始辩论分析测试...');

// 测试API
fetch('/api/llm-analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    speeches: ['我支持人工智能发展', '但是AI会带来风险'],
    prompt: `分析以下发言的立场倾向：
1. "我支持人工智能发展"
2. "但是AI会带来风险"

返回JSON格式：
{
  "positive": {
    "speeches": ["正方发言"],
    "consolidatedViewpoint": "正方观点",
    "smartTags": ["标签1"]
  },
  "negative": {
    "speeches": ["反方发言"],
    "consolidatedViewpoint": "反方观点",
    "smartTags": ["标签1"]
  },
  "topic": "讨论话题"
}`
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ API测试成功:', data);
})
.catch(err => {
  console.error('❌ API测试失败:', err);
});

// 测试状态获取
setTimeout(() => {
  console.log('📊 辩论状态测试完成');
}, 3000);
