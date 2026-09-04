import { cycle, type StageAEvent, type StageAState, type StageAPhase } from './stage-a';

export interface PhaseMachineState { state: StageAState; phaseIndex: number; events: StageAEvent[]; }
export const STAGE_A_PHASES: readonly StageAPhase[] = ['LOAD_INPUT','FORWARD_MULTIPLY','FORWARD_ACCUMULATE','READ_OUTPUT','SET_TARGET','LOSS_COMPARE','BACKPROP_OUTPUT','GRADIENT_READY','LEARNING_RATE_SCALE','WEIGHT_UPDATE'];
export function createPhaseMachine(state: StageAState): PhaseMachineState { return { state, phaseIndex: 0, events: [] }; }
export function stepPhase(machine: Readonly<PhaseMachineState>): PhaseMachineState {
  const phase = STAGE_A_PHASES[machine.phaseIndex];
  if (!phase) return machine as PhaseMachineState;
  const events = [...machine.events, { phase }];
  if (phase === 'WEIGHT_UPDATE') return { state: cycle(machine.state).state, phaseIndex: 0, events };
  return { state: machine.state, phaseIndex: machine.phaseIndex + 1, events };
}
export function runPhaseCycle(machine: Readonly<PhaseMachineState>): PhaseMachineState { let next = machine as PhaseMachineState; for (let i=machine.phaseIndex;i<STAGE_A_PHASES.length;i+=1) next=stepPhase(next); return next; }
