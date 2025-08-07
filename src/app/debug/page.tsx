'use client';
import React, { useState, useEffect } from 'react';
import { getCurrentDebateState } from '../agentConfigs/debateModerator/debateAnalyzer';
import { TranscriptProvider } from '../contexts/TranscriptContext';

function DebugContent() {
  const [debateState, setDebateState] = useState<any>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const state = getCurrentDebateState();
      setDebateState(state);
      setRefreshCount(prev => prev + 1);
      console.log('🔍 调试刷新 #', refreshCount, '状态:', state);
    }, 2000);

    return () => clearInterval(interval);
  }, [refreshCount]);

  const forceRefresh = () => {
    const state = getCurrentDebateState();
    setDebateState(state);
    console.log('🔧 手动刷新状态:', state);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🔍 辩论系统调试面板</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">📊 辩论状态</h2>
          <button 
            onClick={forceRefresh}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-4"
          >
            🔄 手动刷新状态
          </button>
          <div className="text-sm font-mono bg-gray-900 p-4 rounded overflow-auto">
            <div><strong>刷新次数:</strong> {refreshCount}</div>
            <div><strong>状态存在:</strong> {debateState ? '✅' : '❌'}</div>
            {debateState && (
              <>
                <div><strong>主题:</strong> {debateState.topic || '未设置'}</div>
                <div><strong>正方胜率:</strong> {debateState.winRate?.positive || 'N/A'}%</div>
                <div><strong>反方胜率:</strong> {debateState.winRate?.negative || 'N/A'}%</div>
                <div><strong>正方发言数:</strong> {debateState.participants?.positive?.speechCount || 0}</div>
                <div><strong>反方发言数:</strong> {debateState.participants?.negative?.speechCount || 0}</div>
                <div><strong>正方关键点:</strong> {debateState.participants?.positive?.keyPoints?.length || 0}</div>
                <div><strong>反方关键点:</strong> {debateState.participants?.negative?.keyPoints?.length || 0}</div>
                <div><strong>正方标签:</strong> {debateState.keywords?.positive?.length || 0}</div>
                <div><strong>反方标签:</strong> {debateState.keywords?.negative?.length || 0}</div>
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">🎯 问题分析</h2>
          <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-700 p-4 rounded">
              <h3 className="font-bold text-yellow-400">🚨 发现的问题</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• 需要在TranscriptProvider内使用转写功能</li>
                <li>• LLM分析正在运行但UI可能没有正确更新</li>
                <li>• 可能存在状态同步问题</li>
              </ul>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-700 p-4 rounded">
              <h3 className="font-bold text-blue-400">💡 建议解决方案</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• 确保组件在正确的Provider内</li>
                <li>• 检查状态更新机制</li>
                <li>• 验证数据流向</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gray-800 p-6 rounded-xl">
        <h2 className="text-xl font-bold mb-4">🎯 原始状态 JSON</h2>
        <pre className="text-xs bg-gray-900 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(debateState, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default function DebugPage() {
  return (
    <TranscriptProvider>
      <DebugContent />
    </TranscriptProvider>
  );
}
