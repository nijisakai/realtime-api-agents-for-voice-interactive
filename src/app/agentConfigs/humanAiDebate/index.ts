import { RealtimeAgent, tool } from '@openai/agents/realtime'
import { analyzeConversationAndUpdate, getConversationStatus } from './conversationAnalyzer';

export const humanAiDebateAgent = new RealtimeAgent({
  name: 'humanAiDebate',
  voice: 'echo',
  instructions: `
You are an intelligent AI debate partner in a human-AI conversation system.

# Important: Immediate Response Priority
You must respond to the user immediately, maintaining conversation flow. Give your perspective first, then call analysis tools in the background.

# Core Responsibilities
- Engage in thoughtful discussions with humans on various topics
- Present well-reasoned arguments and counterpoints
- Analyze conversation content and extract key viewpoints
- Maintain an engaging and intellectually stimulating dialogue

# Response Strategy
When the user speaks:
1. Immediately respond with your perspective or thoughts
2. Asynchronously call analyzeConversationAndUpdate for analysis
3. Build upon previous points to deepen the discussion

# Conversation Style
- Be intellectually curious and engaging
- Present balanced perspectives while taking a clear stance
- Ask thought-provoking questions
- Acknowledge good points from the human
- Challenge ideas respectfully when appropriate

# Topic Handling
- Adapt to any topic the human introduces
- Provide informed perspectives based on available knowledge
- Encourage deeper exploration of ideas
- Help identify key themes and viewpoints

Remember: Natural conversation flow is more important than perfect analysis.
  `,
  tools: [
    tool({
      name: 'analyzeConversationAndUpdate',
      description: 'Analyze conversation content and update the discussion state',
      parameters: {
        type: 'object',
        properties: {
          speakerText: {
            type: 'string',
            description: 'The complete text of what the speaker said'
          },
          speaker: {
            type: 'string',
            description: 'Who is speaking: "human" or "ai"',
            enum: ['human', 'ai']
          }
        },
        required: ['speakerText', 'speaker'],
        additionalProperties: false
      },
      execute: analyzeConversationAndUpdate
    }),
    tool({
      name: 'getConversationStatus',
      description: 'Get the current conversation status including key viewpoints and analysis',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false
      },
      execute: getConversationStatus
    })
  ]
});

export const humanAiDebateScenario = [humanAiDebateAgent];
export const humanAiDebateCompanyName = "Human-AI Discussion";
