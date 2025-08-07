'use client';
import React, { useEffect, useState } from 'react';
import { getCurrentConversationState } from '../agentConfigs/humanAiDebate/conversationAnalyzer';
import { updateConversationStateFromTranscript } from '../agentConfigs/humanAiDebate/transcriptAnalyzer';
import { useTranscript } from '../contexts/TranscriptContext';

const HumanAiConversationPanel: React.FC = () => {
  const [conversationState, setConversationState] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { transcriptItems } = useTranscript();

  // Initialize default state and ensure it stays visible
  useEffect(() => {
    console.log('🔧 HumanAiConversationPanel initialization started');
    const initialState = getCurrentConversationState();
    if (initialState) {
      setConversationState(initialState);
      setIsInitialized(true);
      console.log('🎯 Conversation state initialization successful:', {
        topic: initialState.topic,
        humanKeyPoints: initialState.participants?.human?.keyPoints?.length,
        aiKeyPoints: initialState.participants?.ai?.keyPoints?.length
      });
    } else {
      console.warn('⚠️ Unable to get initial conversation state');
      // Provide a default state to ensure panel is always shown
      const defaultState = {
        topic: '',
        currentTopic: '',
        participants: {
          human: { name: 'Human', keyPoints: [], speechCount: 0, smartTags: [] },
          ai: { name: 'AI', keyPoints: [], speechCount: 0, smartTags: [] }
        },
        keywords: [],
        timeline: []
      };
      setConversationState(defaultState);
      setIsInitialized(true);
    }
  }, []);

  // LLM analysis of transcript content
  useEffect(() => {
    if (transcriptItems.length > 0 && isInitialized) {
      const analyzeAsync = async () => {
        try {
          console.log('🤖 Human-AI panel starting LLM analysis, transcript items:', transcriptItems.length);
          const updatedState = await updateConversationStateFromTranscript(transcriptItems);
          setConversationState(updatedState);
          console.log('✅ Human-AI panel LLM analysis completed');
        } catch (error) {
          console.error('❌ Human-AI panel LLM analysis failed:', error);
          // Fallback: use basic state but keep panel visible
          const fallbackState = getCurrentConversationState();
          if (fallbackState) {
            setConversationState(fallbackState);
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
      const latestState = getCurrentConversationState();
      if (latestState) {
        setConversationState({ ...latestState }); // Force new object reference
        console.log('🔄 Human-AI periodic state refresh');
      }
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [isInitialized]);

  // Always show the panel, even without content
  if (!conversationState || !isInitialized) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Human-AI Conversation Analysis
          </h2>
          <p className="text-gray-400">Initializing analysis system...</p>
        </div>
      </div>
    );
  }

  const { participants, currentTopic } = conversationState;
  
  // Check if there's actual conversation content
  const hasContent = participants?.human?.keyPoints?.length > 0 || 
                    participants?.ai?.keyPoints?.length > 0;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-6 border-b border-gray-700/50">
        <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          Human-AI Conversation Analysis
        </h2>
        {currentTopic ? (
          <div className="bg-gray-800/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-600/50">
            <span className="text-green-400 font-medium text-sm">Topic:</span>
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
          {/* Human section */}
          <div className="group h-full">
            <div className="bg-gradient-to-br from-green-900/40 to-green-800/30 border border-green-700/50 rounded-xl p-5 transition-all duration-300 hover:border-green-600/70 hover:shadow-lg hover:shadow-green-500/10 h-full flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-400 rounded-full mr-3 shadow-lg shadow-green-500/30"></div>
                <h3 className="font-semibold text-green-300 text-lg">Human</h3>
              </div>
              
              {/* Key viewpoints */}
              <div className="mb-6 flex-1">
                <h4 className="text-green-300 text-sm font-medium mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                  Key Viewpoints
                </h4>
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 flex-1 min-h-[120px] border border-green-700/20 transition-all duration-300 group-hover:border-green-600/30">
                  {hasContent && participants?.human?.keyPoints?.length > 0 ? (
                    <p className="text-gray-100 text-sm leading-relaxed font-medium">
                      {participants.human.keyPoints[0]}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm italic">Waiting for viewpoints...</p>
                  )}
                </div>
              </div>
              
              {/* Key Tags */}
              <div className="flex-shrink-0">
                <h4 className="text-green-300 text-sm font-medium mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                  Key Tags
                </h4>
                <div className="flex flex-wrap gap-2 min-h-[60px]">
                  {hasContent && participants?.human?.smartTags?.length > 0 ? 
                    participants.human.smartTags.slice(0, 6).map((tag: string, index: number) => (
                      <span 
                        key={index}
                        className="bg-green-700/40 text-green-200 px-3 py-2 rounded-full text-xs border border-green-600/50 backdrop-blur-sm transition-all duration-200 hover:bg-green-600/50"
                      >
                        {tag}
                      </span>
                    )) : (
                      <span className="text-gray-500 text-xs italic">Tags generating...</span>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* AI section */}
          <div className="group h-full">
            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/30 border border-blue-700/50 rounded-xl p-5 transition-all duration-300 hover:border-blue-600/70 hover:shadow-lg hover:shadow-blue-500/10 h-full flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full mr-3 shadow-lg shadow-blue-500/30"></div>
                <h3 className="font-semibold text-blue-300 text-lg">AI</h3>
              </div>
              
              {/* Key viewpoints */}
              <div className="mb-6 flex-1">
                <h4 className="text-blue-300 text-sm font-medium mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                  Key Viewpoints
                </h4>
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 flex-1 min-h-[120px] border border-blue-700/20 transition-all duration-300 group-hover:border-blue-600/30">
                  {hasContent && participants?.ai?.keyPoints?.length > 0 ? (
                    <p className="text-gray-100 text-sm leading-relaxed font-medium">
                      {participants.ai.keyPoints[0]}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm italic">Waiting for viewpoints...</p>
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
                  {hasContent && participants?.ai?.smartTags?.length > 0 ? 
                    participants.ai.smartTags.slice(0, 6).map((tag: string, index: number) => (
                      <span 
                        key={index}
                        className="bg-blue-700/40 text-blue-200 px-3 py-2 rounded-full text-xs border border-blue-600/50 backdrop-blur-sm transition-all duration-200 hover:bg-blue-600/50"
                      >
                        {tag}
                      </span>
                    )) : (
                      <span className="text-gray-500 text-xs italic">Tags generating...</span>
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

export default HumanAiConversationPanel;