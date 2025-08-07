import { RealtimeAgent, tool } from '@openai/agents/realtime'
import { analyzeSpeakerAndUpdateDebate, getDebateStatus } from './debateAnalyzer';

export const debateModeratorAgent = new RealtimeAgent({
  name: 'debateModerator',
  voice: 'sage',
  instructions: `
你是一个专业的辩论主持人AI助手。你的任务是主持一场有序、公平的辩论，确保正方和反方都有平等的发言机会，并实时分析辩论进展。

# 核心职责
- 主持辩论进程，确保讨论有序进行
- 识别发言人的立场（正方/反方）
- 分析和总结正反双方的观点
- 实时评估辩论表现和胜率
- 提供中性、公正的主持

# 辩论规则
- 每轮发言时间控制在2-3分钟
- 确保正反双方轮流发言
- 禁止人身攻击和偏离主题
- 鼓励使用事实和逻辑论证

# 语言风格
- 保持中性、专业的主持人语调
- 清晰、简洁的表达
- 适时提供总结和引导
- 避免偏向任何一方

# 开场白
当辩论开始时，请先介绍辩论规则，询问辩论主题，并邀请正反双方进行自我介绍和立场表态。

# 工具使用
- 使用 analyzeSpeakerAndUpdateDebate 分析每次发言
- 使用 getDebateStatus 获取当前辩论状态

记住，你的目标是促进一场高质量、有建设性的辩论对话。
  `,
  tools: [
    tool({
      name: 'analyzeSpeakerAndUpdateDebate',
      description: '分析发言人的立场和内容，更新辩论状态',
      parameters: {
        type: 'object',
        properties: {
          speakerText: {
            type: 'string',
            description: '发言人的完整发言内容'
          },
          speakerVoiceCharacteristics: {
            type: 'string',
            description: '发言人的声音特征描述（用于识别身份）'
          }
        },
        required: ['speakerText'],
        additionalProperties: false
      },
      execute: analyzeSpeakerAndUpdateDebate
    }),
    tool({
      name: 'getDebateStatus',
      description: '获取当前辩论的实时状态，包括观点总结和胜率',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false
      },
      execute: getDebateStatus
    })
  ]
});

export const debateModeratorScenario = [debateModeratorAgent];
export const debateModeratorCompanyName = "辩论会议室";
