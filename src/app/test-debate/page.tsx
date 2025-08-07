'use client';
import React, { useState } from 'react';
import { updateDebateStateFromTranscript } from '../agentConfigs/debateModerator/transcriptAnalyzer';
import { getCurrentDebateState } from '../agentConfigs/debateModerator/debateAnalyzer';

const testTranscriptItems = [
  {
    itemId: '1',
    type: 'MESSAGE' as const,
    role: 'user' as const,
    title: '我认为人工智能对社会发展有积极作用',
    data: { transcript: '我认为人工智能对社会发展有积极作用' },
    expanded: false,
    timestamp: new Date().toISOString(),
    createdAtMs: Date.now(),
    status: 'DONE' as const,
    isHidden: false
  },
  {
    itemId: '2',
    type: 'MESSAGE' as const,
    role: 'assistant' as const,
    title: '感谢您的观点。现在请反方阐述不同的看法。',
    data: { transcript: '感谢您的观点。现在请反方阐述不同的看法。' },
    expanded: false,
    timestamp: new Date().toISOString(),
    createdAtMs: Date.now(),
    status: 'DONE' as const,
    isHidden: false
  },
  {
    itemId: '3',
    type: 'MESSAGE' as const,
    role: 'user' as const,
    title: '但是AI也可能带来就业问题和隐私风险',
    data: { transcript: '但是AI也可能带来就业问题和隐私风险' },
    expanded: false,
    timestamp: new Date().toISOString(),
    createdAtMs: Date.now(),
    status: 'DONE' as const,
    isHidden: false
  },
  {
    itemId: '4',
    type: 'MESSAGE' as const,
    role: 'assistant' as const,
    title: '双方观点都很有价值。让我们深入探讨这个话题。',
    data: { transcript: '双方观点都很有价值。让我们深入探讨这个话题。' },
    expanded: false,
    timestamp: new Date().toISOString(),
    createdAtMs: Date.now(),
    status: 'DONE' as const,
    isHidden: false
  },
  {
    itemId: '5',
    type: 'MESSAGE' as const,
    role: 'user' as const,
    title: 'AI可以提高生产效率，创造新的工作机会',
    data: { transcript: 'AI可以提高生产效率，创造新的工作机会' },
    expanded: false,
    timestamp: new Date().toISOString(),
    createdAtMs: Date.now(),
    status: 'DONE' as const,
    isHidden: false
  }
];

export default function TestDebatePage() {
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 开始测试LLM分析...');
      const result = await updateDebateStateFromTranscript(testTranscriptItems);
      setAnalysisResult(result);
      console.log('✅ 测试分析完成:', result);
    } catch (error) {
      console.error('❌ 测试分析失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentState = () => {
    const state = getCurrentDebateState();
    console.log('📊 当前辩论状态:', state);
    setAnalysisResult(state);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🎯 辩论系统测试页面
        </h1>
        
        {/* 测试控制面板 */}
        <div className="bg-gray-800 p-6 rounded-xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">测试控制</h2>
          <div className="flex gap-4">
            <button
              onClick={runAnalysis}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
            >
              {isLoading ? '🔄 分析中...' : '🤖 运行LLM分析'}
            </button>
            
            <button
              onClick={getCurrentState}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
            >
              📊 获取当前状态
            </button>
          </div>
        </div>

        {/* 测试数据展示 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-4">📝 测试转写数据</h3>
            <div className="space-y-2">
              {testTranscriptItems.map((item, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  item.role === 'user' ? 'bg-blue-600/20 text-blue-300' : 'bg-purple-600/20 text-purple-300'
                }`}>
                  <div className="text-sm opacity-75">
                    {item.role === 'user' ? '👤 参与者' : '🤖 AI主持人'}
                  </div>
                  <div>{typeof item.data === 'object' && item.data?.transcript ? item.data.transcript : item.title}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-4">🎯 分析结果</h3>
            {analysisResult ? (
              <div className="space-y-4">
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <div className="text-green-300 font-bold">辩论主题</div>
                  <div className="text-white">{analysisResult.topic || '未识别'}</div>
                </div>
                
                <div className="bg-blue-600/20 p-3 rounded-lg">
                  <div className="text-blue-300 font-bold">正方数据</div>
                  <div className="text-white text-sm">
                    发言数: {analysisResult.participants?.positive?.speechCount || 0}<br/>
                    关键点: {analysisResult.participants?.positive?.keyPoints?.length || 0}<br/>
                    标签数: {analysisResult.keywords?.positive?.length || 0}
                  </div>
                </div>
                
                <div className="bg-red-600/20 p-3 rounded-lg">
                  <div className="text-red-300 font-bold">反方数据</div>
                  <div className="text-white text-sm">
                    发言数: {analysisResult.participants?.negative?.speechCount || 0}<br/>
                    关键点: {analysisResult.participants?.negative?.keyPoints?.length || 0}<br/>
                    标签数: {analysisResult.keywords?.negative?.length || 0}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">点击按钮开始分析...</div>
            )}
          </div>
        </div>

        {/* 现代面板测试 */}
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4">🎨 现代面板测试</h3>
          <div className="text-gray-400 mb-4">
            注意：此测试需要在主页面中进行，因为需要完整的转写上下文。
          </div>
          <button
            onClick={() => window.open('http://localhost:3000', '_blank')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
          >
            🔗 打开主页面测试
          </button>
        </div>
      </div>
    </div>
  );
}
