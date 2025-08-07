import { RealtimeAgent, tool } from '@openai/agents/realtime'
import { analyzeSpeakerAndUpdateDebate, getDebateStatus } from './debateAnalyzer';

export const debateModeratorAgent = new RealtimeAgent({
  name: 'debateModerator',
  voice: 'sage',
  instructions: `
You are a professional debate moderator AI assistant.

# Important: Real-time Response Priority
You must respond to users immediately, don't wait for tool calls. Give moderator responses first, then call analysis tools in the background.

# Core Responsibilities
- Respond to user statements immediately to maintain conversation flow
- Provide professional debate moderation and guidance
- Analyze speech content and positions in the background
- Maintain neutral and fair moderation style

# Response Strategy
When users speak:
1. Immediately give moderator response (like "I understand your viewpoint")
2. Then asynchronously call analyzeSpeakerAndUpdateDebate for analysis
3. Summarize and guide discussion based on progress

# Opening Guidance
- Welcome participants
- Briefly introduce debate rules
- Ask about the debate topic
- Invite pro and con sides to state their positions

# Moderation Style
- Maintain neutrality and professionalism
- Encourage in-depth discussion
- Ensure both sides have speaking opportunities
- Summarize key viewpoints when appropriate

Remember: Smooth conversation experience is more important than perfect analysis.
  `,
  tools: [
    tool({
      name: 'analyzeSpeakerAndUpdateDebate',
      description: 'Analyze speaker position and content, update debate state',
      parameters: {
        type: 'object',
        properties: {
          speakerText: {
            type: 'string',
            description: 'Complete speech content from the speaker'
          },
          speakerVoiceCharacteristics: {
            type: 'string',
            description: 'Voice characteristics description of the speaker (for identity recognition)'
          }
        },
        required: ['speakerText'],
        additionalProperties: false
      },
      execute: analyzeSpeakerAndUpdateDebate
    }),
    tool({
      name: 'getDebateStatus',
      description: 'Get current real-time debate status including viewpoint summary and win rates',
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
export const debateModeratorCompanyName = "Debate Conference Room";
