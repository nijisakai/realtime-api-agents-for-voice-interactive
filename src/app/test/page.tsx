'use client';
import React, { useState } from 'react';
import { getCurrentDebateState } from '../agentConfigs/debateModerator/debateAnalyzer';
import { updateDebateStateFromTranscript } from '../agentConfigs/debateModerator/transcriptAnalyzer';
import { TranscriptProvider } from '../contexts/TranscriptContext';

const testTranscript = [
  {
    itemId: '1',
    type: 'MESSAGE' as const,
    role: 'user' as const,
    title: '我觉得人工智能对社会发展是有积极作用的',
    data: { transcript: '我觉得人工智能对社会发展是有积极作用的' },
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
    title: '感谢您的观点，请反方发表不同意见',
    data: { transcript: '感谢您的观点，请反方发表不同意见' },
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
    title: '但是AI发展会导致很多人失业，这是个严重问题',
    data: { transcript: '但是AI发展会导致很多人失业，这是个严重问题' },
    expanded: false,
    timestamp: new Date().toISOString(),
    createdAtMs: Date.now(),
    status: 'DONE' as const,
    isHidden: false
  }
];

function TestContent() {
  const [debateState, setDebateState] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisLog, setAnalysisLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setAnalysisLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const runFullTest = async () => {
    setIsAnalyzing(true);
    addLog('🔬 开始完整测试流程');
    
    try {
      // 1. 获取初始状态
      const initialState = getCurrentDebateState();
      addLog(`📊 初始状态: 正方${initialState.winRate.positive}% vs 反方${initialState.winRate.negative}%`);
      setDebateState(initialState);
      
      // 2. 运行LLM分析
      addLog('🤖 开始LLM分析...');
      const updatedState = await updateDebateStateFromTranscript(testTranscript);
      
      // 3. 显示结果
      addLog(`✅ LLM分析完成`);
      addLog(`📈 更新后状态: 正方${updatedState.winRate.positive}% vs 反方${updatedState.winRate.negative}%`);
      addLog(`🎯 主题: ${updatedState.topic || '未识别'}`);
      addLog(`💬 正方发言: ${updatedState.participants.positive.speechCount}条`);
      addLog(`💬 反方发言: ${updatedState.participants.negative.speechCount}条`);
      
      setDebateState(updatedState);
      
    } catch (error) {
      addLog(`❌ 测试失败: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetState = () => {
    setDebateState(null);
    setAnalysisLog([]);
    addLog('🔄 状态已重置');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🧪 辩论功能测试实验室</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">🎮 测试控制台</h2>
          <div className="space-y-4">
            <button 
              onClick={runFullTest}
              disabled={isAnalyzing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-3 rounded text-white font-bold"
            >
              {isAnalyzing ? '🔄 分析中...' : '🚀 运行完整测试'}
            </button>
            
            <button 
              onClick={resetState}
              className="w-full bg-red-600 hover:bg-red-700 px-4 py-3 rounded text-white font-bold"
            >
              🔄 重置状态
            </button>
          </div>
          
          <div className="mt-6">
            <h3 className="font-bold mb-2">📝 测试数据预览</h3>
            <div className="bg-gray-900 p-4 rounded text-sm max-h-40 overflow-auto">
              {testTranscript.map((item, index) => (
                <div key={index} className="mb-1">
                  <span className={item.role === 'user' ? 'text-blue-400' : 'text-purple-400'}>
                    {item.role === 'user' ? '👤' : '🤖'}
                  </span>
                  {' '}{item.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">📊 实时结果</h2>
          
          {debateState ? (
            <div className="space-y-4">
              <div className="bg-green-900/20 border border-green-700 p-4 rounded">
                <h3 className="font-bold text-green-400 mb-2">✅ 当前状态</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-blue-400 font-bold">正方 ({debateState.winRate?.positive || 0}%)</div>
                    <div>发言: {debateState.participants?.positive?.speechCount || 0}</div>
                    <div>观点: {debateState.participants?.positive?.keyPoints?.length || 0}</div>
                  </div>
                  <div>
                    <div className="text-red-400 font-bold">反方 ({debateState.winRate?.negative || 0}%)</div>
                    <div>发言: {debateState.participants?.negative?.speechCount || 0}</div>
                    <div>观点: {debateState.participants?.negative?.keyPoints?.length || 0}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-yellow-400 font-bold">主题</div>
                  <div>{debateState.topic || '未识别'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-700 p-4 rounded text-center text-gray-400">
              点击&ldquo;运行完整测试&rdquo;开始
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-gray-800 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">📋 分析日志</h2>
        <div className="bg-gray-900 p-4 rounded font-mono text-sm max-h-96 overflow-auto">
          {analysisLog.length > 0 ? (
            analysisLog.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          ) : (
            <div className="text-gray-500">等待测试运行...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TestPage() {
  return (
    <TranscriptProvider>
      <TestContent />
    </TranscriptProvider>
  );
}
