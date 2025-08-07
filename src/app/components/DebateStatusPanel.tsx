"use client";

import React, { useEffect, useState } from 'react';
import { getCurrentDebateState, DebateState } from '@/app/agentConfigs/debateModerator/debateAnalyzer';
import { updateDebateStateFromTranscript } from '@/app/agentConfigs/debateModerator/transcriptAnalyzer';
import { useTranscript } from '@/app/contexts/TranscriptContext';

interface DebateStatusPanelProps {
  isVisible: boolean;
}

export default function DebateStatusPanel({ isVisible }: DebateStatusPanelProps) {
  const [debateState, setDebateState] = useState<DebateState | null>(null);
  const { transcriptItems } = useTranscript();

  // 实时分析转写内容 - 支持异步LLM分析
  useEffect(() => {
    if (isVisible && transcriptItems.length > 0) {
      const analyzeAsync = async () => {
        try {
          console.log('🤖 开始LLM分析转写内容...');
          const updatedState = await updateDebateStateFromTranscript(transcriptItems);
          setDebateState(updatedState);
          console.log('✅ LLM分析完成:', updatedState);
        } catch (error) {
          console.error('❌ LLM分析转写内容失败:', error);
        }
      };
      
      analyzeAsync();
    }
  }, [isVisible, transcriptItems]);

  // 兜底：定期获取基础状态
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        try {
          const currentState = getCurrentDebateState();
          setDebateState(currentState);
        } catch (error) {
          console.error('获取辩论状态失败:', error);
        }
      }, 3000); // 3秒更新一次

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const handleManualRefresh = async () => {
    if (transcriptItems.length > 0) {
      const updatedState = await updateDebateStateFromTranscript(transcriptItems);
      setDebateState(updatedState);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-xl border border-slate-200 flex flex-col h-full overflow-hidden">
      {/* 标题栏 */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold tracking-wide">辩论实时分析</h2>
          </div>
          <button 
            onClick={handleManualRefresh}
            className="px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
          >
            刷新数据
          </button>
        </div>
        {debateState?.topic && (
          <p className="text-blue-100 text-sm mt-2 font-medium">主题: {debateState.topic}</p>
        )}
        <div className="text-xs text-blue-100 mt-1 opacity-80">
          转写条目: {transcriptItems.length} • 最后更新: {new Date().toLocaleTimeString()}
          {debateState && (
            <span className="ml-2">
              • 正方: {debateState.participants?.positive?.speechCount || 0}发言 
              • 反方: {debateState.participants?.negative?.speechCount || 0}发言
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 胜率对比 - 大型显示 */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            实时胜率对比
          </h3>
          <div className="space-y-4">
            {/* 正方胜率 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                  <span className="text-lg font-bold text-emerald-700">正方</span>
                </div>
                <span className="text-2xl font-bold text-emerald-600">
                  {debateState?.winRate?.positive || 50}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${debateState?.winRate?.positive || 50}%` }}
                ></div>
              </div>
            </div>

            {/* 反方胜率 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-rose-500 rounded-full"></div>
                  <span className="text-lg font-bold text-rose-700">反方</span>
                </div>
                <span className="text-2xl font-bold text-rose-600">
                  {debateState?.winRate?.negative || 50}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-rose-400 to-rose-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${debateState?.winRate?.negative || 50}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 发言统计 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border-l-4 border-emerald-500">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">
                {debateState?.participants?.positive?.speechCount || 0}
              </div>
              <div className="text-sm text-emerald-700 font-medium">正方发言次数</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border-l-4 border-rose-500">
            <div className="text-center">
              <div className="text-3xl font-bold text-rose-600 mb-1">
                {debateState?.participants?.negative?.speechCount || 0}
              </div>
              <div className="text-sm text-rose-700 font-medium">反方发言次数</div>
            </div>
          </div>
        </div>

        {/* 正方观点 */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-lg border border-emerald-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-white">
            <h3 className="text-lg font-bold flex items-center">
              <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse"></div>
              正方观点
            </h3>
          </div>
          <div className="p-4">
            {debateState?.participants?.positive?.keyPoints && debateState.participants.positive.keyPoints.length > 0 ? (
              <div className="space-y-3">
                {debateState.participants.positive.keyPoints.slice(-4).map((point, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border-l-4 border-emerald-400 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-slate-700 font-medium">{point}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <div className="w-6 h-6 border-2 border-emerald-500 rounded-full border-dashed"></div>
                </div>
                <p className="text-emerald-600 font-medium">等待正方发言...</p>
              </div>
            )}
            
            {/* 正方关键词 */}
            {debateState?.keywords?.positive && debateState.keywords.positive.length > 0 && (
              <div className="mt-4 pt-4 border-t border-emerald-200">
                <div className="text-sm text-emerald-700 font-medium mb-2">关键词标签:</div>
                <div className="flex flex-wrap gap-2">
                  {debateState.keywords.positive.slice(0, 8).map((keyword, index) => (
                    <span key={index} className="px-3 py-1.5 bg-emerald-200 text-emerald-800 rounded-full text-sm font-medium hover:bg-emerald-300 transition-colors">
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 反方观点 */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl shadow-lg border border-rose-200 overflow-hidden">
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-3 text-white">
            <h3 className="text-lg font-bold flex items-center">
              <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse"></div>
              反方观点
            </h3>
          </div>
          <div className="p-4">
            {debateState?.participants?.negative?.keyPoints && debateState.participants.negative.keyPoints.length > 0 ? (
              <div className="space-y-3">
                {debateState.participants.negative.keyPoints.slice(-4).map((point, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border-l-4 border-rose-400 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-slate-700 font-medium">{point}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-rose-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <div className="w-6 h-6 border-2 border-rose-500 rounded-full border-dashed"></div>
                </div>
                <p className="text-rose-600 font-medium">等待反方发言...</p>
              </div>
            )}
            
            {/* 反方关键词 */}
            {debateState?.keywords?.negative && debateState.keywords.negative.length > 0 && (
              <div className="mt-4 pt-4 border-t border-rose-200">
                <div className="text-sm text-rose-700 font-medium mb-2">关键词标签:</div>
                <div className="flex flex-wrap gap-2">
                  {debateState.keywords.negative.slice(0, 8).map((keyword, index) => (
                    <span key={index} className="px-3 py-1.5 bg-rose-200 text-rose-800 rounded-full text-sm font-medium hover:bg-rose-300 transition-colors">
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 转写质量提示 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <h4 className="text-amber-800 font-semibold">转写质量优化建议</h4>
          </div>
          <div className="text-sm text-amber-700 space-y-1">
            <p>• 说话时保持清晰、适中的语速</p>
            <p>• 避免背景噪音干扰</p>
            <p>• 使用标准普通话发音</p>
            <p>• 重要观点可以重复表达</p>
            <p>• 明确表态：&ldquo;我是正方/反方&rdquo;或&ldquo;我支持/反对&rdquo;</p>
          </div>
        </div>

        {/* 调试：原始转写文本 */}
        {transcriptItems.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              <h4 className="text-slate-800 font-semibold">最近转写内容</h4>
            </div>
            <div className="text-xs text-slate-600 space-y-1 max-h-32 overflow-y-auto">
              {transcriptItems.slice(-5).map((item, index) => (
                <div key={index} className="bg-white rounded p-2 border">
                  <div className="font-medium text-slate-700">
                    {item.role === 'user' ? '👤 用户' : '🤖 AI'}: 
                  </div>
                  <div className="text-slate-600 mt-1">
                    {typeof item.data === 'string' ? item.data : 
                     item.data?.transcript || item.data?.text || item.title || '无内容'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 底部状态栏 */}
      <div className="px-6 py-3 bg-slate-100 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>基于语音转写实时分析</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>正在监听...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
