'use client';
import React, { useEffect, useState } from 'react';
import { getCurrentDebateState } from '../agentConfigs/debateModerator/debateAnalyzer';
import { updateDebateStateFromTranscript } from '../agentConfigs/debateModerator/transcriptAnalyzer';
import { useTranscript } from '../contexts/TranscriptContext';

const DebateStatusPanelModern: React.FC = () => {
  const [debateState, setDebateState] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { transcriptItems } = useTranscript();

  // Initialize default state and ensure it stays visible
  useEffect(() => {
    console.log('🔧 DebateStatusPanelModern initialization started');
    const initialState = getCurrentDebateState();
    if (initialState) {
      setDebateState(initialState);
      setIsInitialized(true);
      console.log('🎯 Debate state initialization successful:', {
        topic: initialState.topic,
        positiveWinRate: initialState.winRate?.positive,
        negativeWinRate: initialState.winRate?.negative,
        positiveSpeeches: initialState.participants?.positive?.speechCount,
        negativeSpeeches: initialState.participants?.negative?.speechCount
      });
    } else {
      console.warn('⚠️ Unable to get initial debate state');
      // Provide a default state to ensure panel is always shown
      const defaultState = {
        topic: '',
        currentTopic: '',
        participants: {
          positive: { name: 'Pro', keyPoints: [], speechCount: 0, smartTags: [] },
          negative: { name: 'Con', keyPoints: [], speechCount: 0, smartTags: [] }
        },
        winRate: { positive: 50, negative: 50 },
        keywords: { positive: [], negative: [] },
        timeline: []
      };
      setDebateState(defaultState);
      setIsInitialized(true);
    }
  }, []);

  // 监听状态更新事件
  useEffect(() => {
    const handleStateUpdate = (event: CustomEvent) => {
      console.log('🔔 收到状态更新事件:', event.detail);
      setDebateState({ ...event.detail }); // 强制更新
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('debateStateUpdated', handleStateUpdate as EventListener);
      console.log('📡 已注册状态更新监听器');
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('debateStateUpdated', handleStateUpdate as EventListener);
      }
    };
  }, []);

  // LLM analysis of transcript content
  useEffect(() => {
    if (transcriptItems.length > 0 && isInitialized) {
      const analyzeAsync = async () => {
        try {
          console.log('🤖 Modern panel starting LLM analysis, transcript items:', transcriptItems.length);
          const updatedState = await updateDebateStateFromTranscript(transcriptItems);
          setDebateState(updatedState);
          console.log('✅ Modern panel LLM analysis completed');
        } catch (error) {
          console.error('❌ Modern panel LLM analysis failed:', error);
          // Fallback: use basic state but keep panel visible
          const fallbackState = getCurrentDebateState();
          if (fallbackState) {
            setDebateState(fallbackState);
          }
        }
      };
      
      analyzeAsync();
    }
  }, [transcriptItems, isInitialized]);

  // Periodic state refresh to keep data current
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      const latestState = getCurrentDebateState();
      if (latestState) {
        setDebateState({ ...latestState }); // Force new object reference
        console.log('🔄 Periodic state refresh');
      }
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [isInitialized]);

  // Always show the panel, even without content
  if (!debateState || !isInitialized) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Intelligent Debate Analysis
          </h2>
          <p className="text-gray-400">Initializing analysis system...</p>
        </div>
      </div>
    );
  }

  const { participants, winRate, currentTopic } = debateState;
  
  // Check if there's actual debate content
  const hasContent = participants?.positive?.keyPoints?.length > 0 || 
                    participants?.negative?.keyPoints?.length > 0;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden h-full">
      {/* Header area */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-gray-700/50">
        <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Intelligent Debate Analysis
        </h2>
        {currentTopic ? (
          <div className="bg-gray-800/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-600/50">
            <span className="text-blue-400 font-medium text-sm">Debate Topic:</span>
            <span className="text-gray-100 ml-2 font-medium">{currentTopic}</span>
          </div>
        ) : (
          <div className="bg-gray-800/50 px-4 py-3 rounded-xl border border-gray-600/30">
            <span className="text-gray-400 italic">Topic will be automatically identified from conversation...</span>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="p-6 flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-6 h-full">
          {/* Pro side area */}
          <div className="group h-full">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/30 border border-blue-700/50 rounded-xl p-5 transition-all duration-300 hover:border-blue-600/70 hover:shadow-lg hover:shadow-blue-500/10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full mr-3 shadow-lg shadow-blue-500/30"></div>
                  <h3 className="font-semibold text-blue-300 text-lg">Pro</h3>
                </div>
                <span className="text-blue-200 text-sm font-bold bg-blue-900/50 px-3 py-1 rounded-full">
                  {winRate?.positive || 50}%
                </span>
              </div>
              
              {/* Win rate progress bar */}
              <div className="bg-gray-800/60 rounded-full h-2 mb-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-700 ease-out shadow-lg"
                  style={{ width: `${winRate?.positive || 50}%` }}
                ></div>
              </div>
              
              {/* Key viewpoints */}
              <div className="mb-6 flex-1">
                <h4 className="text-blue-300 text-sm font-medium mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                  Key Viewpoints
                </h4>
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 flex-1 min-h-[120px] border border-blue-700/20 transition-all duration-300 group-hover:border-blue-600/30">
                  {hasContent && participants?.positive?.keyPoints?.length > 0 ? (
                    <p className="text-gray-100 text-sm leading-relaxed font-medium">
                      {participants.positive.keyPoints[0]}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm italic">Waiting for viewpoint input...</p>
                  )}
                </div>
              </div>
              
              {/* Key Tags */}
              <div className="flex-shrink-0">
                <h4 className="text-blue-300 text-sm font-medium mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                  Key Tags
                </h4>
                <div className="flex flex-wrap gap-2 min-h-[60px]">
                  {hasContent && participants?.positive?.smartTags?.length > 0 ? 
                    participants.positive.smartTags.slice(0, 3).map((tag: string, index: number) => (
                      <span 
                        key={index}
                        className="bg-gradient-to-r from-blue-600/60 to-blue-500/60 text-white px-4 py-2 rounded-lg text-sm font-medium border border-blue-400/30 backdrop-blur-sm transition-all duration-300 hover:from-blue-500/70 hover:to-blue-400/70 hover:scale-105 shadow-lg"
                      >
                        #{tag}
                      </span>
                    )) : (
                      <span className="text-gray-500 text-xs italic">Tags will appear...</span>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Con side area */}
          <div className="group h-full">
            <div className="bg-gradient-to-br from-red-900/40 to-red-800/30 border border-red-700/50 rounded-xl p-5 transition-all duration-300 hover:border-red-600/70 hover:shadow-lg hover:shadow-red-500/10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-400 rounded-full mr-3 shadow-lg shadow-red-500/30"></div>
                  <h3 className="font-semibold text-red-300 text-lg">Con</h3>
                </div>
                <span className="text-red-200 text-sm font-bold bg-red-900/50 px-3 py-1 rounded-full">
                  {winRate?.negative || 50}%
                </span>
              </div>
              
              {/* Win rate progress bar */}
              <div className="bg-gray-800/60 rounded-full h-2 mb-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-700 ease-out shadow-lg"
                  style={{ width: `${winRate?.negative || 50}%` }}
                ></div>
              </div>
              
              {/* Key viewpoints */}
              <div className="mb-6 flex-1">
                <h4 className="text-red-300 text-sm font-medium mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                  Key Viewpoints
                </h4>
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 flex-1 min-h-[120px] border border-red-700/20 transition-all duration-300 group-hover:border-red-600/30">
                  {hasContent && participants?.negative?.keyPoints?.length > 0 ? (
                    <p className="text-gray-100 text-sm leading-relaxed font-medium">
                      {participants.negative.keyPoints[0]}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm italic">Waiting for viewpoint input...</p>
                  )}
                </div>
              </div>
              
              {/* Key Tags */}
              <div className="flex-shrink-0">
                <h4 className="text-red-300 text-sm font-medium mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                  Key Tags
                </h4>
                <div className="flex flex-wrap gap-2 min-h-[60px]">
                  {hasContent && participants?.negative?.smartTags?.length > 0 ? 
                    participants.negative.smartTags.slice(0, 3).map((tag: string, index: number) => (
                      <span 
                        key={index}
                        className="bg-gradient-to-r from-red-600/60 to-red-500/60 text-white px-4 py-2 rounded-lg text-sm font-medium border border-red-400/30 backdrop-blur-sm transition-all duration-300 hover:from-red-500/70 hover:to-red-400/70 hover:scale-105 shadow-lg"
                      >
                        #{tag}
                      </span>
                    )) : (
                      <span className="text-gray-500 text-xs italic">Tags will appear...</span>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebateStatusPanelModern;
