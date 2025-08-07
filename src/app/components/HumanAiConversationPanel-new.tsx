'use client';

import { useState, useEffect } from 'react';
import { ConversationState } from '../agentConfigs/humanAiDebate/conversationAnalyzer';
import { useTranscript } from '@/app/contexts/TranscriptContext';
import { updateConversationStateFromTranscript } from '../agentConfigs/humanAiDebate/transcriptAnalyzer-new';

interface HumanAiConversationPanelProps {
  isConnected: boolean;
}

const HumanAiConversationPanel: React.FC<HumanAiConversationPanelProps> = ({ isConnected }) => {
  const { transcriptItems } = useTranscript();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [conversationState, setConversationState] = useState<ConversationState>({
    topic: '',
    participants: {
      human: {
        name: 'Human',
        keyPoints: [],
        speechCount: 0,
        smartTags: []
      },
      ai: {
        name: 'AI',
        keyPoints: [],
        speechCount: 0,
        smartTags: []
      }
    },
    currentTopic: '',
    keywords: [],
    timeline: []
  });

  // 初始化效果
  useEffect(() => {
    console.log('🚀 HumanAI对话面板初始化');
    setIsInitialized(true);
  }, []);

  // 监听对话状态更新事件
  useEffect(() => {
    const handleConversationUpdate = (event: CustomEvent) => {
      console.log('🔄 对话状态更新事件接收:', event.detail);
      setConversationState(event.detail);
    };

    window.addEventListener('conversationStateUpdated', handleConversationUpdate as EventListener);

    return () => {
      window.removeEventListener('conversationStateUpdated', handleConversationUpdate as EventListener);
    };
  }, []);

  // 监听transcript变化并触发分析
  useEffect(() => {
    if (transcriptItems.length > 0 && isInitialized) {
      const analyzeConversation = async () => {
        try {
          console.log('🤖 HumanAI面板开始LLM分析, transcript项目数:', transcriptItems.length);
          const updatedState = await updateConversationStateFromTranscript(transcriptItems);
          if (updatedState) {
            setConversationState(updatedState);
          }
        } catch (error) {
          console.error('❌ HumanAI对话分析失败:', error);
        }
      };

      // 延迟执行分析，避免频繁调用
      const timeoutId = setTimeout(analyzeConversation, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [transcriptItems, isInitialized]);

  // 连接状态变化日志
  useEffect(() => {
    console.log('🔗 HumanAI连接状态变化:', isConnected);
  }, [isConnected]);

  // 渲染标签组件
  const renderTags = (tags: string[], colorClass: string) => {
    return tags.map((tag, index) => (
      <span
        key={index}
        className={`inline-block px-3 py-1 m-1 text-xs font-medium text-white 
                   bg-gradient-to-r ${colorClass} rounded-full shadow-lg
                   hover:shadow-xl hover:scale-105 transition-all duration-200`}
      >
        #{tag}
      </span>
    ));
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6 overflow-auto flex flex-col">
      {/* 顶部状态栏 */}
      <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Conversation Active' : 'Disconnected'}
            </span>
          </div>
          <div className="text-xs text-white/70">
            Human: {conversationState.participants.human.speechCount} | 
            AI: {conversationState.participants.ai.speechCount}
          </div>
        </div>
      </div>

      {/* 主题显示 */}
      {conversationState.currentTopic && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-400/30 flex-shrink-0">
          <h2 className="text-xl font-bold text-center mb-2">Discussion Topic</h2>
          <p className="text-lg text-center text-blue-200">{conversationState.currentTopic}</p>
        </div>
      )}

      {/* 参与者对比视图 - 占满剩余空间 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Human 参与者 */}
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg p-4 border border-green-400/30 flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="text-lg font-bold text-green-300">👤 Human</h3>
            <span className="text-sm text-green-200">
              {conversationState.participants.human.speechCount} speeches
            </span>
          </div>

          {/* 关键观点 */}
          <div className="mb-4 flex-1 min-h-0">
            <h4 className="text-sm font-semibold text-green-200 mb-2">Key Viewpoints</h4>
            <div className="space-y-2 overflow-auto max-h-full">
              {conversationState.participants.human.keyPoints.length > 0 ? (
                conversationState.participants.human.keyPoints.map((point, index) => (
                  <div key={index} className="text-sm text-white/90 bg-green-600/20 p-2 rounded">
                    • {point}
                  </div>
                ))
              ) : (
                <div className="text-sm text-white/60 italic">Waiting for input...</div>
              )}
            </div>
          </div>

          {/* 智能标签 */}
          <div className="flex-shrink-0">
            <h4 className="text-sm font-semibold text-green-200 mb-2">Key Tags</h4>
            <div className="flex flex-wrap">
              {conversationState.participants.human.smartTags.length > 0 ? 
                renderTags(conversationState.participants.human.smartTags, 'from-green-600/60 to-green-500/60') :
                <span className="text-xs text-white/60 italic">No tags yet</span>
              }
            </div>
          </div>
        </div>

        {/* AI 参与者 */}
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg p-4 border border-blue-400/30 flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="text-lg font-bold text-blue-300">🤖 AI</h3>
            <span className="text-sm text-blue-200">
              {conversationState.participants.ai.speechCount} speeches
            </span>
          </div>

          {/* 关键观点 */}
          <div className="mb-4 flex-1 min-h-0">
            <h4 className="text-sm font-semibold text-blue-200 mb-2">Key Viewpoints</h4>
            <div className="space-y-2 overflow-auto max-h-full">
              {conversationState.participants.ai.keyPoints.length > 0 ? (
                conversationState.participants.ai.keyPoints.map((point, index) => (
                  <div key={index} className="text-sm text-white/90 bg-blue-600/20 p-2 rounded">
                    • {point}
                  </div>
                ))
              ) : (
                <div className="text-sm text-white/60 italic">Waiting for input...</div>
              )}
            </div>
          </div>

          {/* 智能标签 */}
          <div className="flex-shrink-0">
            <h4 className="text-sm font-semibold text-blue-200 mb-2">Key Tags</h4>
            <div className="flex flex-wrap">
              {conversationState.participants.ai.smartTags.length > 0 ? 
                renderTags(conversationState.participants.ai.smartTags, 'from-blue-600/60 to-blue-500/60') :
                <span className="text-xs text-white/60 italic">No tags yet</span>
              }
            </div>
          </div>
        </div>
      </div>

      {/* 全局关键词云 */}
      {conversationState.keywords.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-400/30 flex-shrink-0">
          <h4 className="text-sm font-semibold text-purple-200 mb-3">Global Keywords</h4>
          <div className="flex flex-wrap">
            {renderTags(conversationState.keywords, 'from-purple-600/60 to-pink-600/60')}
          </div>
        </div>
      )}
    </div>
  );
};

export default HumanAiConversationPanel;
