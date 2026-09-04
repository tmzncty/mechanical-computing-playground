import { createRevolutionCounter, type RevolutionState } from '../revolution-counter';

export const REGISTER_LIFECYCLE_ID = 'register-lifecycle';
export type RegisterMode = 'ADD_MULTIPLY' | 'SUBTRACT_DIVIDE';

export interface RegisterLifecycleState {
  mechanismId: typeof REGISTER_LIFECYCLE_ID;
  resultRegister: number;
  revolutionRegister: RevolutionState;
  mode: RegisterMode;
  clearActionCount: number;
  humanOperationCount: number;
  nextSequence: number;
}

export type RegisterLifecycleAction =
  | { type: 'SET_MODE'; cycleId: string; mode: RegisterMode }
  | { type: 'CLEAR_REVOLUTION_REGISTER'; cycleId: string }
  | { type: 'CLEAR_RESULT_REGISTER'; cycleId: string };

interface BaseEvent { mechanismId: typeof REGISTER_LIFECYCLE_ID; cycleId: string; sequence: number }
export type RegisterLifecycleEvent =
  | (BaseEvent & { type: 'MODE_SELECTED'; modeBefore: RegisterMode; modeAfter: RegisterMode; humanBefore: number; humanAfter: number })
  | (BaseEvent & { type: 'REVOLUTION_REGISTER_CLEARED'; before: number; after: 0; resultPreserved: number; clearBefore: number; clearAfter: number; humanBefore: number; humanAfter: number })
  | (BaseEvent & { type: 'RESULT_REGISTER_CLEARED'; before: number; after: 0; revolutionPreserved: number; clearBefore: number; clearAfter: number; humanBefore: number; humanAfter: number });

export interface RegisterLifecycleTrace {
  initialState: RegisterLifecycleState;
  actions: RegisterLifecycleAction[];
  events: RegisterLifecycleEvent[];
  finalState: RegisterLifecycleState;
}

export class InvalidRegisterLifecycleError extends Error {
  constructor(message: string) { super(message); this.name = 'InvalidRegisterLifecycleError'; }
}

function safeCount(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) throw new InvalidRegisterLifecycleError(`${name} must be a non-negative safe integer`);
}
function increment(value: number, name: string): number {
  safeCount(value, name);
  if (value === Number.MAX_SAFE_INTEGER) throw new InvalidRegisterLifecycleError(`${name} exceeds safe integer range`);
  return value + 1;
}
function validMode(mode: unknown): mode is RegisterMode { return mode === 'ADD_MULTIPLY' || mode === 'SUBTRACT_DIVIDE'; }

export function assertRegisterLifecycleState(state: Readonly<RegisterLifecycleState>): void {
  if (state.mechanismId !== REGISTER_LIFECYCLE_ID) throw new InvalidRegisterLifecycleError('register-lifecycle mechanism id mismatch');
  safeCount(state.resultRegister, 'result register');
  createRevolutionCounter(state.revolutionRegister.count);
  if (!validMode(state.mode)) throw new InvalidRegisterLifecycleError('invalid operation mode');
  safeCount(state.clearActionCount, 'clear-action count');
  safeCount(state.humanOperationCount, 'human-operation count');
  safeCount(state.nextSequence, 'next sequence');
  if (state.humanOperationCount !== state.nextSequence) throw new InvalidRegisterLifecycleError('human-operation count must equal next sequence');
  if (state.clearActionCount > state.humanOperationCount) throw new InvalidRegisterLifecycleError('clear-action count cannot exceed human-operation count');
}

export function createRegisterLifecycle(resultRegister = 0, revolutionCount = 0, mode: RegisterMode = 'ADD_MULTIPLY'): RegisterLifecycleState {
  const state: RegisterLifecycleState = {
    mechanismId: REGISTER_LIFECYCLE_ID,
    resultRegister,
    revolutionRegister: createRevolutionCounter(revolutionCount),
    mode,
    clearActionCount: 0,
    humanOperationCount: 0,
    nextSequence: 0,
  };
  assertRegisterLifecycleState(state);
  return state;
}

export function transitionRegisterLifecycle(state: Readonly<RegisterLifecycleState>, action: Readonly<RegisterLifecycleAction>): { state: RegisterLifecycleState; events: RegisterLifecycleEvent[] } {
  assertRegisterLifecycleState(state);
  if (typeof action.cycleId !== 'string' || action.cycleId.length === 0) throw new InvalidRegisterLifecycleError('register-lifecycle action requires a cycle id');
  const base: BaseEvent = { mechanismId: REGISTER_LIFECYCLE_ID, cycleId: action.cycleId, sequence: state.nextSequence };
  const humanAfter = increment(state.humanOperationCount, 'human-operation count');
  let event: RegisterLifecycleEvent;
  if (action.type === 'SET_MODE') {
    if (!validMode(action.mode)) throw new InvalidRegisterLifecycleError('invalid selected mode');
    event = { ...base, type: 'MODE_SELECTED', modeBefore: state.mode, modeAfter: action.mode, humanBefore: state.humanOperationCount, humanAfter };
  } else if (action.type === 'CLEAR_REVOLUTION_REGISTER') {
    event = { ...base, type: 'REVOLUTION_REGISTER_CLEARED', before: state.revolutionRegister.count, after: 0, resultPreserved: state.resultRegister, clearBefore: state.clearActionCount, clearAfter: increment(state.clearActionCount, 'clear-action count'), humanBefore: state.humanOperationCount, humanAfter };
  } else if (action.type === 'CLEAR_RESULT_REGISTER') {
    event = { ...base, type: 'RESULT_REGISTER_CLEARED', before: state.resultRegister, after: 0, revolutionPreserved: state.revolutionRegister.count, clearBefore: state.clearActionCount, clearAfter: increment(state.clearActionCount, 'clear-action count'), humanBefore: state.humanOperationCount, humanAfter };
  } else throw new InvalidRegisterLifecycleError('unsupported register-lifecycle action type');
  return { state: reduceRegisterLifecycleEvent(state, event), events: [event] };
}

export function reduceRegisterLifecycleEvent(state: Readonly<RegisterLifecycleState>, event: Readonly<RegisterLifecycleEvent>): RegisterLifecycleState {
  assertRegisterLifecycleState(state);
  if (event.mechanismId !== REGISTER_LIFECYCLE_ID || typeof event.cycleId !== 'string' || event.cycleId.length === 0 || event.sequence !== state.nextSequence) throw new InvalidRegisterLifecycleError('invalid register-lifecycle event identity or sequence');
  const nextSequence = increment(state.nextSequence, 'next sequence');
  if (event.type === 'MODE_SELECTED') {
    if (!validMode(event.modeAfter) || event.modeBefore !== state.mode || event.humanBefore !== state.humanOperationCount || event.humanAfter !== increment(state.humanOperationCount, 'human-operation count')) throw new InvalidRegisterLifecycleError('invalid mode-selection event');
    return { ...state, mode: event.modeAfter, humanOperationCount: event.humanAfter, nextSequence };
  }
  if (event.type === 'REVOLUTION_REGISTER_CLEARED') {
    if (event.before !== state.revolutionRegister.count || event.after !== 0 || event.resultPreserved !== state.resultRegister || event.clearBefore !== state.clearActionCount || event.clearAfter !== increment(state.clearActionCount, 'clear-action count') || event.humanBefore !== state.humanOperationCount || event.humanAfter !== increment(state.humanOperationCount, 'human-operation count')) throw new InvalidRegisterLifecycleError('invalid revolution-register clear event');
    return { ...state, revolutionRegister: createRevolutionCounter(0), clearActionCount: event.clearAfter, humanOperationCount: event.humanAfter, nextSequence };
  }
  if (event.type === 'RESULT_REGISTER_CLEARED') {
    if (event.before !== state.resultRegister || event.after !== 0 || event.revolutionPreserved !== state.revolutionRegister.count || event.clearBefore !== state.clearActionCount || event.clearAfter !== increment(state.clearActionCount, 'clear-action count') || event.humanBefore !== state.humanOperationCount || event.humanAfter !== increment(state.humanOperationCount, 'human-operation count')) throw new InvalidRegisterLifecycleError('invalid result-register clear event');
    return { ...state, resultRegister: 0, clearActionCount: event.clearAfter, humanOperationCount: event.humanAfter, nextSequence };
  }
  throw new InvalidRegisterLifecycleError('unsupported register-lifecycle event type');
}

export function traceRegisterLifecycle(initialState: Readonly<RegisterLifecycleState>, actions: readonly RegisterLifecycleAction[]): RegisterLifecycleTrace {
  assertRegisterLifecycleState(initialState);
  let state = structuredClone(initialState);
  const events: RegisterLifecycleEvent[] = [];
  for (const action of actions) {
    const result = transitionRegisterLifecycle(state, action);
    state = result.state;
    events.push(...result.events);
  }
  return { initialState: structuredClone(initialState), actions: structuredClone(actions) as RegisterLifecycleAction[], events, finalState: state };
}

export function replayRegisterLifecycle(trace: Readonly<RegisterLifecycleTrace>): RegisterLifecycleState {
  assertRegisterLifecycleState(trace.initialState);
  assertRegisterLifecycleState(trace.finalState);
  if (!Array.isArray(trace.actions) || !Array.isArray(trace.events)) throw new InvalidRegisterLifecycleError('register-lifecycle trace arrays are required');
  const expected = traceRegisterLifecycle(trace.initialState, trace.actions);
  if (JSON.stringify(expected.events) !== JSON.stringify(trace.events)) throw new InvalidRegisterLifecycleError('register-lifecycle action/event mismatch');
  const replayed = trace.events.reduce(reduceRegisterLifecycleEvent, structuredClone(trace.initialState));
  if (JSON.stringify(replayed) !== JSON.stringify(trace.finalState) || JSON.stringify(expected.finalState) !== JSON.stringify(trace.finalState)) throw new InvalidRegisterLifecycleError('register-lifecycle final state mismatch');
  return replayed;
}
