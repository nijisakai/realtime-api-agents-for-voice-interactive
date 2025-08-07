import { simpleHandoffScenario } from './simpleHandoff';
import { customerServiceRetailScenario } from './customerServiceRetail';
import { chatSupervisorScenario } from './chatSupervisor';
import { debateModeratorScenario } from './debateModerator';
import { humanAiDebateScenario } from './humanAiDebate';

import type { RealtimeAgent } from '@openai/agents/realtime';

// Map of scenario key -> array of RealtimeAgent objects
export const allAgentSets: Record<string, RealtimeAgent[]> = {
  aiTutor1: simpleHandoffScenario,
  aiTutor2: customerServiceRetailScenario,
  chatSupervisor: chatSupervisorScenario,
  debateModerator: debateModeratorScenario,
  humanAiDebate: humanAiDebateScenario,
};

export const defaultAgentSetKey = 'debateModerator';
