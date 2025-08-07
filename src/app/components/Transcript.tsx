"use-client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { TranscriptItem } from "@/app/types";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { DownloadIcon, ClipboardCopyIcon } from "@radix-ui/react-icons";
import { GuardrailChip } from "./GuardrailChip";

export interface TranscriptProps {
  downloadRecording: () => void;
}

function Transcript({
  downloadRecording,
}: TranscriptProps) {
  const { transcriptItems, toggleTranscriptItemExpand } = useTranscript();
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const [prevLogs, setPrevLogs] = useState<TranscriptItem[]>([]);
  const [justCopied, setJustCopied] = useState(false);

  function scrollToBottom() {
    if (!transcriptRef.current) return;
    
    const element = transcriptRef.current;
    
    // 方法1: 使用 scrollIntoView (更可靠)
    const lastChild = element.lastElementChild;
    if (lastChild) {
      lastChild.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end' 
      });
    }
    
    // 方法2: 备用scrollTop方式
    requestAnimationFrame(() => {
      if (transcriptRef.current) {
        transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
      }
    });
    
    // 方法3: 延迟确保（处理动态内容）
    setTimeout(() => {
      if (transcriptRef.current) {
        transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
      }
    }, 100);
  }

  useEffect(() => {
    const hasNewMessage = transcriptItems.length > prevLogs.length;
    const hasUpdatedMessage = transcriptItems.some((newItem, index) => {
      const oldItem = prevLogs[index];
      return (
        oldItem &&
        (newItem.title !== oldItem.title || newItem.data !== oldItem.data)
      );
    });

    console.log('📜 Transcript 状态检查:', {
      当前条数: transcriptItems.length,
      之前条数: prevLogs.length,
      有新消息: hasNewMessage,
      有更新消息: hasUpdatedMessage,
      需要滚动: hasNewMessage || hasUpdatedMessage
    });

    if (hasNewMessage || hasUpdatedMessage) {
      console.log('⬇️ 触发自动滚动');
      scrollToBottom();
    }

    setPrevLogs(transcriptItems);
  }, [transcriptItems]);

  // 初始化滚动
  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleCopyTranscript = async () => {
    if (!transcriptRef.current) return;
    try {
      await navigator.clipboard.writeText(transcriptRef.current.innerText);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy transcript:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 min-h-0 rounded-xl">
      <div className="flex flex-col h-full min-h-0">
        <div className="flex items-center justify-between px-6 py-3 sticky top-0 z-10 text-base border-b border-gray-600 bg-gray-700 rounded-t-xl flex-shrink-0">
          <span className="font-semibold text-gray-100">Transcript</span>
          <div className="flex gap-x-2">
            <button
              onClick={handleCopyTranscript}
              className="w-24 text-sm px-3 py-1 rounded-md bg-gray-600 hover:bg-gray-500 text-gray-100 flex items-center justify-center gap-x-1"
            >
              <ClipboardCopyIcon />
              {justCopied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={downloadRecording}
              className="w-40 text-sm px-3 py-1 rounded-md bg-gray-600 hover:bg-gray-500 text-gray-100 flex items-center justify-center gap-x-1"
            >
              <DownloadIcon />
              <span>Download Audio</span>
            </button>
          </div>
        </div>

        {/* Transcript Content */}
        <div
          ref={transcriptRef}
          className="overflow-y-auto overflow-x-hidden p-6 flex flex-col gap-y-3 flex-1 bg-gradient-to-b from-gray-800 to-gray-850 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
          style={{ 
            scrollBehavior: 'smooth',
            scrollbarWidth: 'thin',
            scrollbarColor: '#4B5563 #1F2937'
          }}
        >
          {[...transcriptItems]
            .sort((a, b) => a.createdAtMs - b.createdAtMs)
            .map((item) => {
              const {
                itemId,
                type,
                role,
                data,
                expanded,
                timestamp,
                title = "",
                isHidden,
                guardrailResult,
              } = item;

            if (isHidden) {
              return null;
            }

            if (type === "MESSAGE") {
              const isUser = role === "user";
              const isAssistant = role === "assistant";
              
              // 三种身份角色识别和颜色
              let roleLabel = "";
              let bubbleClasses = "";
              let roleColor = "";
              let alignment = "";
              
              if (isUser) {
                // 用户是参与辩论的一方，可以是正方或反方，暂时默认为正方
                roleLabel = "参与者";
                bubbleClasses = "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg";
                roleColor = "text-blue-400";
                alignment = "justify-end"; // 右对齐
              } else if (isAssistant) {
                // AI助手是辩论主持人，保持中立
                roleLabel = "AI主持人";
                bubbleClasses = "bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg";
                roleColor = "text-purple-400";
                alignment = "justify-center"; // 居中对齐
              } else {
                // 其他角色（如系统消息）
                roleLabel = "系统";
                bubbleClasses = "bg-gradient-to-br from-gray-600 to-gray-700 text-white shadow-lg";
                roleColor = "text-gray-400";
                alignment = "justify-start"; // 左对齐
              }

              const containerClasses = `flex ${alignment} mb-4`;
              
              const isBracketedMessage =
                title.startsWith("[") && title.endsWith("]");
              const messageStyle = isBracketedMessage
                ? 'italic text-gray-200'
                : '';
              const displayTitle = isBracketedMessage
                ? title.slice(1, -1)
                : title;

              return (
                <div key={itemId} className={containerClasses}>
                  <div className="max-w-lg group">
                    {/* 角色标签 */}
                    <div className={`text-xs ${roleColor} mb-1 ${
                      isUser ? "text-right" : isAssistant ? "text-center" : "text-left"
                    } font-medium`}>
                      {roleLabel} • {timestamp}
                    </div>
                    
                    {/* 消息气泡 */}
                    <div
                      className={`${bubbleClasses} px-4 py-3 rounded-2xl ${
                        isUser ? "rounded-br-md" : isAssistant ? "rounded-b-2xl" : "rounded-bl-md"
                      } transition-all duration-200 hover:shadow-xl ${
                        guardrailResult ? "rounded-b-2xl" : ""
                      }`}
                    >
                      <div className={`whitespace-pre-wrap leading-relaxed ${messageStyle}`}>
                        <ReactMarkdown>{displayTitle}</ReactMarkdown>
                      </div>
                    </div>
                    {guardrailResult && (
                      <div className="bg-gray-600 px-3 py-2 rounded-b-xl">
                        <GuardrailChip guardrailResult={guardrailResult} />
                      </div>
                    )}
                  </div>
                </div>
              );
            } else if (type === "BREADCRUMB") {
              return (
                <div
                  key={itemId}
                  className="flex flex-col justify-start items-start text-gray-400 text-sm"
                >
                  <span className="text-xs font-mono">{timestamp}</span>
                  <div
                    className={`whitespace-pre-wrap flex items-center font-mono text-sm text-gray-300 ${
                      data ? "cursor-pointer" : ""
                    }`}
                    onClick={() => data && toggleTranscriptItemExpand(itemId)}
                  >
                    {data && (
                      <span
                        className={`text-gray-500 mr-1 transform transition-transform duration-200 select-none font-mono ${
                          expanded ? "rotate-90" : "rotate-0"
                        }`}
                      >
                        ▶
                      </span>
                    )}
                    {title}
                  </div>
                  {expanded && data && (
                    <div className="text-gray-300 text-left">
                      <pre className="border-l-2 ml-1 border-gray-600 whitespace-pre-wrap break-words font-mono text-xs mb-2 mt-2 pl-2">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            } else {
              // Fallback if type is neither MESSAGE nor BREADCRUMB
              return (
                <div
                  key={itemId}
                  className="flex justify-center text-gray-400 text-sm italic font-mono"
                >
                  Unknown item type: {type}{" "}
                  <span className="ml-2 text-xs">{timestamp}</span>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}

export default Transcript;
