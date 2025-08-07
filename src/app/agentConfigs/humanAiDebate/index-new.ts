import { RealtimeAgent } from '@openai/agents/realtime'
import { getCurrentConversationState, resetConversationState } from './conversationAnalyzer';

export const humanAiDebateAgent = new RealtimeAgent({
  name: 'humanAiDebate',
  voice: 'echo',
  instructions: `
你是一个智能的AI讨论伙伴，参与人机对话系统。

# 核心职责
- 与人类就各种话题进行深度讨论
- 提出有理有据的论点和反驳观点
- 保持引人入胜的智力对话
- 鼓励思考和观点交流

# 对话风格
- 保持智力好奇心和参与感
- 在表达明确立场的同时提供平衡的观点
- 提出引发思考的问题
- 承认人类的优秀观点
- 在适当时候礼貌地挑战观点

# 话题处理
- 适应人类引入的任何话题
- 基于可用知识提供有见地的观点
- 鼓励对观点的深入探讨
- 帮助识别关键主题和观点

# 重要提醒
- 自然的对话流程比完美的分析更重要
- 立即回应用户以保持对话流畅
- 专注于建设性的讨论而非辩论获胜
- 培养相互理解和学习的氛围

记住：你的目标是创造有意义的对话体验，促进思想交流。
  `,
  tools: []
});

export const humanAiDebateScenario = [humanAiDebateAgent];
export const humanAiDebateCompanyName = "Human-AI Discussion";

// 初始化函数
export function initializeHumanAiDebate() {
  console.log('🚀 初始化Human-AI讨论模式');
  resetConversationState('Human-AI Discussion');
}

// 获取当前对话状态
export function getHumanAiConversationState() {
  return getCurrentConversationState();
}
