import { describe, expect, it } from 'vitest';
import {
  assertRegisterLifecycleState,
  createRegisterLifecycle,
  InvalidRegisterLifecycleError,
  reduceRegisterLifecycleEvent,
  replayRegisterLifecycle,
  traceRegisterLifecycle,
  transitionRegisterLifecycle,
  type RegisterLifecycleAction,
  type RegisterLifecycleState,
  type RegisterLifecycleTrace,
} from '../src/mechanisms/register-lifecycle';

const clone = <T>(value: T): T => structuredClone(value);
const actions: RegisterLifecycleAction[] = [
  { type: 'SET_MODE', cycleId: 'mode', mode: 'SUBTRACT_DIVIDE' },
  { type: 'CLEAR_REVOLUTION_REGISTER', cycleId: 'clear-revolutions' },
  { type: 'CLEAR_RESULT_REGISTER', cycleId: 'clear-result' },
];
const fullTrace = () => traceRegisterLifecycle(createRegisterLifecycle(8478, 27), actions);
const withCounters = (
  counters: Pick<RegisterLifecycleState, 'clearActionCount' | 'humanOperationCount' | 'nextSequence'>,
): RegisterLifecycleState => ({ ...createRegisterLifecycle(7, 3), ...counters });

describe('generic dual-register lifecycle', () => {
  it('creates valid non-zero independent registers', () => {
    expect(createRegisterLifecycle(8478, 27)).toMatchObject({ resultRegister: 8478, revolutionRegister: { count: 27 }, mode: 'ADD_MULTIPLY' });
  });

  it('clears revolutions while preserving result', () => {
    const result = transitionRegisterLifecycle(createRegisterLifecycle(8478, 27), { type: 'CLEAR_REVOLUTION_REGISTER', cycleId: 'clear-r' });
    expect(result.state).toMatchObject({ resultRegister: 8478, revolutionRegister: { count: 0 }, clearActionCount: 1 });
    expect(result.events[0]).toMatchObject({ before: 27, after: 0, resultPreserved: 8478 });
  });

  it('clears result while preserving revolutions', () => {
    const result = transitionRegisterLifecycle(createRegisterLifecycle(8478, 27), { type: 'CLEAR_RESULT_REGISTER', cycleId: 'clear-result' });
    expect(result.state).toMatchObject({ resultRegister: 0, revolutionRegister: { count: 27 }, clearActionCount: 1 });
    expect(result.events[0]).toMatchObject({ before: 8478, after: 0, revolutionPreserved: 27 });
  });

  it('changes mode without mutating either register', () => {
    const result = transitionRegisterLifecycle(createRegisterLifecycle(8478, 27), { type: 'SET_MODE', cycleId: 'mode', mode: 'SUBTRACT_DIVIDE' });
    expect(result.state).toMatchObject({ mode: 'SUBTRACT_DIVIDE', resultRegister: 8478, revolutionRegister: { count: 27 }, clearActionCount: 0 });
  });

  it('records deterministic no-op clearing of an already-zero register', () => {
    const result = transitionRegisterLifecycle(createRegisterLifecycle(8478, 0), { type: 'CLEAR_REVOLUTION_REGISTER', cycleId: 'clear-zero' });
    expect(result.events[0]).toMatchObject({ type: 'REVOLUTION_REGISTER_CLEARED', before: 0, after: 0 });
    expect(result.state).toMatchObject({ resultRegister: 8478, revolutionRegister: { count: 0 }, clearActionCount: 1, humanOperationCount: 1 });
  });

  it('is deterministic and replayable for mixed mode and clear actions', () => {
    expect(fullTrace()).toEqual(fullTrace());
    const trace = fullTrace();
    expect(replayRegisterLifecycle(trace)).toEqual(trace.finalState);
    expect(trace.finalState).toMatchObject({ resultRegister: 0, revolutionRegister: { count: 0 }, mode: 'SUBTRACT_DIVIDE', clearActionCount: 2, humanOperationCount: 3 });
  });

  it.each([
    ['human operations trail the event sequence', { clearActionCount: 0, humanOperationCount: 0, nextSequence: 1 }],
    ['human operations lead the event sequence', { clearActionCount: 0, humanOperationCount: 1, nextSequence: 0 }],
    ['clear actions exceed all human operations', { clearActionCount: 1, humanOperationCount: 0, nextSequence: 0 }],
  ] as const)('rejects counter-inconsistent persisted state when %s', (_label, counters) => {
    expect(() => assertRegisterLifecycleState(withCounters(counters))).toThrow(InvalidRegisterLifecycleError);
  });

  it('enforces counter consistency at transition, reduction, trace and replay boundaries', () => {
    const inconsistent = withCounters({ clearActionCount: 0, humanOperationCount: 0, nextSequence: 1 });
    const action: RegisterLifecycleAction = { type: 'SET_MODE', cycleId: 'next', mode: 'SUBTRACT_DIVIDE' };
    const event = {
      mechanismId: 'register-lifecycle',
      type: 'MODE_SELECTED',
      cycleId: 'next',
      sequence: 1,
      modeBefore: 'ADD_MULTIPLY',
      modeAfter: 'SUBTRACT_DIVIDE',
      humanBefore: 0,
      humanAfter: 1,
    } as const;

    expect(() => transitionRegisterLifecycle(inconsistent, action)).toThrow(InvalidRegisterLifecycleError);
    expect(() => reduceRegisterLifecycleEvent(inconsistent, event)).toThrow(InvalidRegisterLifecycleError);
    expect(() => traceRegisterLifecycle(inconsistent, [action])).toThrow(InvalidRegisterLifecycleError);

    const zeroActionTrace = (state: RegisterLifecycleState): RegisterLifecycleTrace => ({
      initialState: clone(state),
      actions: [],
      events: [],
      finalState: clone(state),
    });
    expect(() => replayRegisterLifecycle(zeroActionTrace(inconsistent))).toThrow(InvalidRegisterLifecycleError);
    const excessiveClears = withCounters({ clearActionCount: 1, humanOperationCount: 0, nextSequence: 0 });
    expect(() => replayRegisterLifecycle(zeroActionTrace(excessiveClears))).toThrow(InvalidRegisterLifecycleError);
  });

  it('accepts consistent persisted counters, including zero and safe-integer exhaustion', () => {
    expect(() => assertRegisterLifecycleState(withCounters({ clearActionCount: 0, humanOperationCount: 0, nextSequence: 0 }))).not.toThrow();

    const persisted = traceRegisterLifecycle(createRegisterLifecycle(7, 3), [
      { type: 'CLEAR_RESULT_REGISTER', cycleId: 'clear-once' },
      { type: 'SET_MODE', cycleId: 'persisted-mode', mode: 'SUBTRACT_DIVIDE' },
      { type: 'CLEAR_RESULT_REGISTER', cycleId: 'clear-twice' },
    ]).finalState;
    const trace = traceRegisterLifecycle(persisted, [{ type: 'SET_MODE', cycleId: 'resume', mode: 'SUBTRACT_DIVIDE' }]);
    expect(replayRegisterLifecycle(trace)).toEqual(trace.finalState);
    expect(trace.finalState).toMatchObject({ clearActionCount: 2, humanOperationCount: 4, nextSequence: 4 });

    const exhausted = {
      ...withCounters({
        clearActionCount: Number.MAX_SAFE_INTEGER,
        humanOperationCount: Number.MAX_SAFE_INTEGER,
        nextSequence: Number.MAX_SAFE_INTEGER,
      }),
      resultRegister: 0,
    };
    expect(() => assertRegisterLifecycleState(exhausted)).not.toThrow();
    expect(traceRegisterLifecycle(exhausted, []).finalState).toEqual(exhausted);
    expect(() => transitionRegisterLifecycle(exhausted, { type: 'SET_MODE', cycleId: 'overflow', mode: 'ADD_MULTIPLY' })).toThrow(/safe integer range/);
  });

  it.each(['before', 'target', 'sequence', 'order', 'counter', 'final'] as const)('rejects forged %s', kind => {
    const trace = clone(fullTrace());
    if (kind === 'before') {
      const event = trace.events.find(item => item.type === 'RESULT_REGISTER_CLEARED');
      if (event?.type === 'RESULT_REGISTER_CLEARED') event.before += 1;
    }
    if (kind === 'target') {
      const event = trace.events.find(item => item.type === 'REVOLUTION_REGISTER_CLEARED');
      if (event?.type === 'REVOLUTION_REGISTER_CLEARED') event.resultPreserved += 1;
    }
    if (kind === 'sequence') trace.events[1].sequence += 1;
    if (kind === 'order') [trace.events[1], trace.events[2]] = [trace.events[2], trace.events[1]];
    if (kind === 'counter') trace.initialState.revolutionRegister.count = -1;
    if (kind === 'final') trace.finalState.resultRegister = 1;
    expect(() => replayRegisterLifecycle(trace as RegisterLifecycleTrace)).toThrow();
  });

  it('rejects invalid numeric state, mode, cycle, action and event types', () => {
    expect(() => createRegisterLifecycle(-1, 0)).toThrow(InvalidRegisterLifecycleError);
    expect(() => createRegisterLifecycle(0, Number.MAX_VALUE)).toThrow();
    const state = createRegisterLifecycle();
    expect(() => transitionRegisterLifecycle(state, { type: 'SET_MODE', cycleId: '', mode: 'ADD_MULTIPLY' })).toThrow();
    expect(() => transitionRegisterLifecycle(state, { type: 'SET_MODE', cycleId: 'bad', mode: 'BAD' } as never)).toThrow();
    expect(() => transitionRegisterLifecycle(state, { type: 'UNKNOWN', cycleId: 'bad' } as never)).toThrow(/unsupported register-lifecycle action/);
    const trace = clone(fullTrace());
    (trace.events[0] as { type: string }).type = 'UNKNOWN';
    expect(() => replayRegisterLifecycle(trace)).toThrow();
  });
});
