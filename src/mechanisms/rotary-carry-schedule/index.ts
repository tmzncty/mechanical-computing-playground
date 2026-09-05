export const ROTARY_CARRY_SCHEDULE_ID = 'rotary-carry-schedule';

export interface RotaryCarryScheduleState {
  mechanismId: typeof ROTARY_CARRY_SCHEDULE_ID;
  width: number;
  carryDepth: number;
  phase: 'READY' | 'CONDITIONED' | 'COMPLETE';
  currentSourceOrder: number;
  conditionedTargetOrder: number | null;
  nextTransferSlot: number;
  completedTransfers: number;
  carryOut: boolean;
}

export interface ScheduleRotaryCarryAction { type: 'SCHEDULE_CARRY_CHAIN'; cycleId: string; }
interface EventBase { mechanismId: typeof ROTARY_CARRY_SCHEDULE_ID; cycleId: string; sequence: number; }
export type RotaryCarryScheduleEvent =
  | (EventBase & { type: 'BOUNDARY_CROSSED'; sourceOrder: number; causedByCarry: boolean })
  | (EventBase & { type: 'NEXT_ORDER_CONDITIONED'; sourceOrder: number; targetOrder: number })
  | (EventBase & { type: 'TRANSFER_OPPORTUNITY'; sourceOrder: number; targetOrder: number; slot: number })
  | (EventBase & { type: 'CARRY_OUT'; sourceOrder: number; targetOrder: number; slot: number })
  | (EventBase & { type: 'SCHEDULE_COMPLETE'; transferCount: number; carryOut: boolean });
export interface RotaryCarryScheduleTrace {
  initialState: RotaryCarryScheduleState;
  action: ScheduleRotaryCarryAction;
  events: RotaryCarryScheduleEvent[];
  finalState: RotaryCarryScheduleState;
}

export class InvalidRotaryCarryScheduleError extends Error {
  constructor(message: string) { super(message); this.name = 'InvalidRotaryCarryScheduleError'; }
}

export function assertRotaryCarryScheduleState(state: Readonly<RotaryCarryScheduleState>): void {
  if (state.mechanismId !== ROTARY_CARRY_SCHEDULE_ID) throw new InvalidRotaryCarryScheduleError('rotary carry schedule mechanism id mismatch');
  if (!Number.isSafeInteger(state.width) || state.width < 2) throw new InvalidRotaryCarryScheduleError('width must be a safe integer of at least two orders');
  if (!Number.isSafeInteger(state.carryDepth) || state.carryDepth < 1 || state.carryDepth > state.width) throw new InvalidRotaryCarryScheduleError('carry depth must be within register width');
  if (!['READY', 'CONDITIONED', 'COMPLETE'].includes(state.phase)) throw new InvalidRotaryCarryScheduleError('invalid rotary carry schedule phase');
  for (const [name, value] of [['source order', state.currentSourceOrder], ['next slot', state.nextTransferSlot], ['completed transfers', state.completedTransfers]] as const) {
    if (!Number.isSafeInteger(value) || value < 0) throw new InvalidRotaryCarryScheduleError(`${name} must be a non-negative safe integer`);
  }
  if (typeof state.carryOut !== 'boolean') throw new InvalidRotaryCarryScheduleError('carry-out flag must be boolean');
  if (state.currentSourceOrder > state.width - 1 || state.nextTransferSlot > state.carryDepth || state.completedTransfers > state.carryDepth || state.nextTransferSlot !== state.completedTransfers) throw new InvalidRotaryCarryScheduleError('schedule counters are inconsistent');
  if (state.phase === 'CONDITIONED') {
    if (state.completedTransfers >= state.carryDepth || state.currentSourceOrder !== state.completedTransfers || !Number.isSafeInteger(state.conditionedTargetOrder) || state.conditionedTargetOrder! !== state.currentSourceOrder + 1 || state.conditionedTargetOrder! > state.width) throw new InvalidRotaryCarryScheduleError('conditioned state is inconsistent with transfer progress');
  } else {
    if (state.conditionedTargetOrder !== null) throw new InvalidRotaryCarryScheduleError('only a conditioned state may retain a target');
    if (state.phase === 'READY') {
      const sourceIsValid = state.completedTransfers === 0
        ? state.currentSourceOrder === 0
        : state.completedTransfers < state.carryDepth
          ? state.currentSourceOrder === state.completedTransfers - 1 || state.currentSourceOrder === state.completedTransfers
          : state.currentSourceOrder === state.carryDepth - 1;
      if (!sourceIsValid) throw new InvalidRotaryCarryScheduleError('ready source order is inconsistent with transfer progress');
    } else if (state.completedTransfers !== state.carryDepth || state.currentSourceOrder !== state.carryDepth - 1 || state.carryOut !== (state.carryDepth === state.width)) {
      throw new InvalidRotaryCarryScheduleError('complete state is inconsistent with the finished schedule');
    }
  }
  if (state.carryOut && (state.carryDepth !== state.width || state.completedTransfers !== state.carryDepth || state.phase === 'CONDITIONED')) throw new InvalidRotaryCarryScheduleError('carry-out is only valid after a full-width chain');
}

export function createRotaryCarrySchedule(width: number, carryDepth: number): RotaryCarryScheduleState {
  const state: RotaryCarryScheduleState = { mechanismId: ROTARY_CARRY_SCHEDULE_ID, width, carryDepth, phase: 'READY', currentSourceOrder: 0, conditionedTargetOrder: null, nextTransferSlot: 0, completedTransfers: 0, carryOut: false };
  assertRotaryCarryScheduleState(state); return state;
}

export function transitionRotaryCarrySchedule(state: Readonly<RotaryCarryScheduleState>, action: Readonly<ScheduleRotaryCarryAction>): { state: RotaryCarryScheduleState; events: RotaryCarryScheduleEvent[] } {
  assertRotaryCarryScheduleState(state);
  if (state.phase !== 'READY' || state.completedTransfers !== 0 || state.currentSourceOrder !== 0 || state.conditionedTargetOrder !== null || state.carryOut) throw new InvalidRotaryCarryScheduleError('schedule action requires a pristine ready state');
  if (action.type !== 'SCHEDULE_CARRY_CHAIN' || typeof action.cycleId !== 'string' || action.cycleId.length === 0) throw new InvalidRotaryCarryScheduleError('invalid schedule action identity');
  const events: RotaryCarryScheduleEvent[] = [];
  const base = (): EventBase => ({ mechanismId: ROTARY_CARRY_SCHEDULE_ID, cycleId: action.cycleId, sequence: events.length });
  events.push({ ...base(), type: 'BOUNDARY_CROSSED', sourceOrder: 0, causedByCarry: false });
  for (let slot = 0; slot < state.carryDepth; slot += 1) {
    const sourceOrder = slot; const targetOrder = sourceOrder + 1;
    events.push({ ...base(), type: 'NEXT_ORDER_CONDITIONED', sourceOrder, targetOrder });
    events.push({ ...base(), type: 'TRANSFER_OPPORTUNITY', sourceOrder, targetOrder, slot });
    if (targetOrder === state.width) events.push({ ...base(), type: 'CARRY_OUT', sourceOrder, targetOrder, slot });
    else if (slot < state.carryDepth - 1) events.push({ ...base(), type: 'BOUNDARY_CROSSED', sourceOrder: targetOrder, causedByCarry: true });
  }
  events.push({ ...base(), type: 'SCHEDULE_COMPLETE', transferCount: state.carryDepth, carryOut: state.carryDepth === state.width });
  const next = events.reduce(reduceRotaryCarryScheduleEvent, structuredClone(state)); assertRotaryCarryScheduleState(next); return { state: next, events };
}

export function reduceRotaryCarryScheduleEvent(state: Readonly<RotaryCarryScheduleState>, event: Readonly<RotaryCarryScheduleEvent>): RotaryCarryScheduleState {
  assertRotaryCarryScheduleState(state);
  if (event.mechanismId !== state.mechanismId || typeof event.cycleId !== 'string' || !Number.isSafeInteger(event.sequence) || event.sequence < 0) throw new InvalidRotaryCarryScheduleError('invalid rotary carry event identity');
  const accept = (next: RotaryCarryScheduleState): RotaryCarryScheduleState => {
    assertRotaryCarryScheduleState(next);
    return next;
  };
  if (event.type === 'BOUNDARY_CROSSED') {
    if (state.phase !== 'READY' || state.conditionedTargetOrder !== null || typeof event.causedByCarry !== 'boolean') throw new InvalidRotaryCarryScheduleError('boundary-crossing dependency is invalid');
    if (event.causedByCarry) {
      if (state.completedTransfers === 0 || state.completedTransfers >= state.carryDepth || state.currentSourceOrder !== state.completedTransfers - 1 || event.sourceOrder !== state.completedTransfers) throw new InvalidRotaryCarryScheduleError('boundary-crossing dependency is invalid');
    } else if (state.completedTransfers !== 0 || state.currentSourceOrder !== 0 || event.sourceOrder !== 0) throw new InvalidRotaryCarryScheduleError('boundary-crossing dependency is invalid');
    return accept({ ...state, currentSourceOrder: event.sourceOrder });
  }
  if (event.type === 'NEXT_ORDER_CONDITIONED') {
    if (state.phase !== 'READY' || state.completedTransfers >= state.carryDepth || state.currentSourceOrder !== state.completedTransfers || event.sourceOrder !== state.completedTransfers || event.targetOrder !== event.sourceOrder + 1 || event.targetOrder > state.width) throw new InvalidRotaryCarryScheduleError('next-order conditioning is invalid');
    return accept({ ...state, phase: 'CONDITIONED', conditionedTargetOrder: event.targetOrder });
  }
  if (event.type === 'TRANSFER_OPPORTUNITY') {
    if (state.phase !== 'CONDITIONED' || event.sourceOrder !== state.currentSourceOrder || event.targetOrder !== state.conditionedTargetOrder || event.slot !== state.nextTransferSlot) throw new InvalidRotaryCarryScheduleError('transfer opportunity is out of dependency order');
    return accept({ ...state, phase: 'READY', conditionedTargetOrder: null, nextTransferSlot: state.nextTransferSlot + 1, completedTransfers: state.completedTransfers + 1 });
  }
  if (event.type === 'CARRY_OUT') {
    if (state.phase !== 'READY' || state.carryDepth !== state.width || state.completedTransfers !== state.carryDepth || state.currentSourceOrder !== state.width - 1 || state.carryOut || event.sourceOrder !== state.currentSourceOrder || event.targetOrder !== state.width || event.slot !== state.completedTransfers - 1) throw new InvalidRotaryCarryScheduleError('carry-out relationship is invalid');
    return accept({ ...state, carryOut: true });
  }
  if (event.type === 'SCHEDULE_COMPLETE') {
    const expectedCarryOut = state.carryDepth === state.width;
    if (state.phase !== 'READY' || event.transferCount !== state.carryDepth || state.completedTransfers !== state.carryDepth || state.carryOut !== expectedCarryOut || event.carryOut !== expectedCarryOut) throw new InvalidRotaryCarryScheduleError('schedule completion is invalid');
    return accept({ ...state, phase: 'COMPLETE' });
  }
  throw new InvalidRotaryCarryScheduleError(`unknown rotary carry event: ${String((event as { type?: unknown }).type)}`);
}

export function createRotaryCarryScheduleTrace(width: number, carryDepth: number, cycleId = `rotary-${width}-${carryDepth}`): RotaryCarryScheduleTrace {
  const initialState = createRotaryCarrySchedule(width, carryDepth); const action: ScheduleRotaryCarryAction = { type: 'SCHEDULE_CARRY_CHAIN', cycleId }; const result = transitionRotaryCarrySchedule(initialState, action);
  return { initialState, action, events: result.events, finalState: result.state };
}

export function replayRotaryCarrySchedule(trace: Readonly<RotaryCarryScheduleTrace>): RotaryCarryScheduleState {
  assertRotaryCarryScheduleState(trace.initialState); assertRotaryCarryScheduleState(trace.finalState);
  const expected = transitionRotaryCarrySchedule(trace.initialState, trace.action);
  if (JSON.stringify(expected.events) !== JSON.stringify(trace.events)) throw new InvalidRotaryCarryScheduleError('rotary carry action/event mismatch');
  const replayed = trace.events.reduce(reduceRotaryCarryScheduleEvent, structuredClone(trace.initialState));
  if (JSON.stringify(replayed) !== JSON.stringify(trace.finalState)) throw new InvalidRotaryCarryScheduleError('rotary carry final state mismatch');
  return replayed;
}
