'use client';
import React, { useEffect, useState } from 'react';
import { getCurrentDebateState } from '../agentConfigs/debateModerator/debateAnalyzer';
import { updateDebateStateFromTranscript } from '../agentConfigs/debateModerator/transcriptAnalyzer';
import { useTranscript } from '../contexts/TranscriptContext';

const DebateStatusPanelDark: React.FC = () => {
  const [debateState, setDebateState] = useState<any>(null);
  const { transcriptItems } = useTranscript();

  // LLM analysis of transcript content
  useEffect(() => {
    if (transcriptItems.length > 0) {
      const analyzeAsync = async () => {
        try {
          console.log('🤖 Dark panel starting LLM analysis, transcript items:', transcriptItems.length);
          const updatedState = await updateDebateStateFromTranscript(transcriptItems);
          setDebateState(updatedState);
          console.log('✅ Dark panel LLM analysis completed');
        } catch (error) {
          console.error('❌ Dark panel LLM analysis failed:', error);
          // Fallback: use basic state
          setDebateState(getCurrentDebateState());
        }
      };
      
      analyzeAsync();
    }
  }, [transcriptItems]);

  // Fallback: periodically get state
  useEffect(() => {
    const interval = setInterval(() => {
      if (!transcriptItems.length) {
        const state = getCurrentDebateState();
        if (state) {
          setDebateState(state);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [transcriptItems.length]);

  if (!debateState) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Intelligent Debate Analysis
          </h2>
          <p className="text-gray-400">Waiting for debate content...</p>
        </div>
      </div>
    );
  }

  const { participants, winRate, currentTopic } = debateState;
  
  // Check if there's actual debate content
  const hasContent = participants?.positive?.keyPoints?.length > 0 || 
                    participants?.negative?.keyPoints?.length > 0;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
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
      <div className="p-6">
        {!hasContent ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">💭</span>
            </div>
            <p className="text-gray-400">Viewpoint analysis will appear after debate content is detected</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {/* Pro side area */}
            <div className="group">
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/30 border border-blue-700/50 rounded-xl p-5 transition-all duration-300 hover:border-blue-600/70 hover:shadow-lg hover:shadow-blue-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full mr-3 shadow-lg shadow-blue-500/30"></div>
                    <h3 className="font-semibold text-blue-300 text-lg">Pro</h3>
                  </div>
                  <span className="text-blue-200 text-sm font-bold bg-blue-900/50 px-3 py-1 rounded-full">
                    {winRate?.positive || 0}%
                  </span>
                </div>
                
                {/* Win rate progress bar */}
                <div className="bg-gray-800/60 rounded-full h-2 mb-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-700 ease-out shadow-lg"
                    style={{ width: `${winRate?.positive || 0}%` }}
                  ></div>
                </div>
                
                {/* Key viewpoints */}
                <div className="mb-4">
                  <h4 className="text-blue-300 text-sm font-medium mb-3 flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                    Key Viewpoints
                  </h4>
                  <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 min-h-[80px] border border-blue-700/20 transition-all duration-300 group-hover:border-blue-600/30">
                    {participants?.positive?.keyPoints?.length > 0 ? (
                      <p className="text-gray-100 text-sm leading-relaxed font-medium">
                        {participants.positive.keyPoints[0]}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm italic">Waiting for viewpoint input...</p>
                    )}
                  </div>
                </div>
                
                {/* Key Tags */}
                <div>
                  <h4 className="text-blue-300 text-sm font-medium mb-3 flex items-center">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                    Key Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {participants?.positive?.smartTags?.length > 0 ? 
                      participants.positive.smartTags.slice(0, 4).map((tag: string, index: number) => (
                        <span 
                          key={index}
                          className="bg-blue-700/40 text-blue-200 px-3 py-1 rounded-full text-xs border border-blue-600/50 backdrop-blur-sm transition-all duration-200 hover:bg-blue-600/50"
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

            {/* Con side area */}
            <div className="group">
              <div className="bg-gradient-to-br from-red-900/40 to-red-800/30 border border-red-700/50 rounded-xl p-5 transition-all duration-300 hover:border-red-600/70 hover:shadow-lg hover:shadow-red-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-400 rounded-full mr-3 shadow-lg shadow-red-500/30"></div>
                    <h3 className="font-semibold text-red-300 text-lg">Con</h3>
                  </div>
                  <span className="text-red-200 text-sm font-bold bg-red-900/50 px-3 py-1 rounded-full">
                    {winRate?.negative || 0}%
                  </span>
                </div>
                
                {/* Win rate progress bar */}
                <div className="bg-gray-800/60 rounded-full h-2 mb-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-700 ease-out shadow-lg"
                    style={{ width: `${winRate?.negative || 0}%` }}
                  ></div>
                </div>
                
                {/* Key viewpoints */}
                <div className="mb-4">
                  <h4 className="text-red-300 text-sm font-medium mb-3 flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                    Key Viewpoints
                  </h4>
                  <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-4 min-h-[80px] border border-red-700/20 transition-all duration-300 group-hover:border-red-600/30">
                    {participants?.negative?.keyPoints?.length > 0 ? (
                      <p className="text-gray-100 text-sm leading-relaxed font-medium">
                        {participants.negative.keyPoints[0]}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm italic">Waiting for viewpoint input...</p>
                    )}
                  </div>
                </div>
                
                {/* Key Tags */}
                <div>
                  <h4 className="text-red-300 text-sm font-medium mb-3 flex items-center">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                    Key Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {participants?.negative?.smartTags?.length > 0 ? 
                      participants.negative.smartTags.slice(0, 4).map((tag: string, index: number) => (
                        <span 
                          key={index}
                          className="bg-red-700/40 text-red-200 px-3 py-1 rounded-full text-xs border border-red-600/50 backdrop-blur-sm transition-all duration-200 hover:bg-red-600/50"
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
        )}

        {/* Bottom statistics */}
        {hasContent && (
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                <div className="text-2xl font-bold text-blue-400">
                  {participants?.positive?.speechCount || 0}
                </div>
                <div className="text-xs text-gray-400">Pro Speeches</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                <div className="text-2xl font-bold text-purple-400">
                  {(participants?.positive?.speechCount || 0) + (participants?.negative?.speechCount || 0)}
                </div>
                <div className="text-xs text-gray-400">Total Speeches</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/30">
                <div className="text-2xl font-bold text-red-400">
                  {participants?.negative?.speechCount || 0}
                </div>
                <div className="text-xs text-gray-400">Con Speeches</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebateStatusPanelDark;
