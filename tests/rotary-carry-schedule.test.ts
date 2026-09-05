import { describe, expect, it } from 'vitest';
import {
  assertRotaryCarryScheduleState,
  createRotaryCarrySchedule,
  createRotaryCarryScheduleTrace,
  InvalidRotaryCarryScheduleError,
  reduceRotaryCarryScheduleEvent,
  replayRotaryCarrySchedule,
  transitionRotaryCarrySchedule,
  type RotaryCarryScheduleEvent,
  type RotaryCarryScheduleState,
} from '../src/mechanisms/rotary-carry-schedule';

const reduceEvents = (
  state: RotaryCarryScheduleState,
  events: readonly RotaryCarryScheduleEvent[],
): RotaryCarryScheduleState => events.reduce(reduceRotaryCarryScheduleEvent, state);

describe('ordinal rotary carry schedule P/M model', () => {
  it('gives one carry one higher-order transfer opportunity', () => {
    const trace = createRotaryCarryScheduleTrace(4, 1);
    expect(trace.events).toMatchObject([
      { type: 'BOUNDARY_CROSSED', sourceOrder: 0, causedByCarry: false },
      { type: 'NEXT_ORDER_CONDITIONED', sourceOrder: 0, targetOrder: 1 },
      { type: 'TRANSFER_OPPORTUNITY', sourceOrder: 0, targetOrder: 1, slot: 0 },
      { type: 'SCHEDULE_COMPLETE', transferCount: 1, carryOut: false },
    ]);
  });

  it('uses strictly increasing ordinal slots for a three-stage dependency chain', () => {
    const trace = createRotaryCarryScheduleTrace(5, 3);
    const transfers = trace.events.filter(event => event.type === 'TRANSFER_OPPORTUNITY');
    expect(transfers.map(event => event.slot)).toEqual([0, 1, 2]);
    expect(transfers.map(event => [event.sourceOrder, event.targetOrder])).toEqual([[0, 1], [1, 2], [2, 3]]);
    expect(new Set(transfers.map(event => event.slot)).size).toBe(transfers.length);
    expect(trace.events.filter(event => event.type === 'BOUNDARY_CROSSED')).toMatchObject([
      { sourceOrder: 0, causedByCarry: false }, { sourceOrder: 1, causedByCarry: true }, { sourceOrder: 2, causedByCarry: true },
    ]);
  });

  it('represents a full-width carry-out explicitly', () => {
    const trace = createRotaryCarryScheduleTrace(3, 3);
    expect(trace.events.filter(event => event.type === 'CARRY_OUT')).toEqual([
      expect.objectContaining({ sourceOrder: 2, targetOrder: 3, slot: 2 }),
    ]);
    expect(trace.finalState).toMatchObject({ phase: 'COMPLETE', carryOut: true, completedTransfers: 3 });
  });

  it('is deterministic and replayable', () => {
    const left = createRotaryCarryScheduleTrace(5, 3, 'same');
    const right = createRotaryCarryScheduleTrace(5, 3, 'same');
    expect(left).toEqual(right); expect(replayRotaryCarrySchedule(left)).toEqual(left.finalState);
  });

  it('requires a caused boundary before conditioning the next source order', () => {
    const trace = createRotaryCarryScheduleTrace(3, 2, 'missing-boundary');
    const firstTransferState = reduceEvents(trace.initialState, trace.events.slice(0, 3));
    const secondConditioning = structuredClone(trace.events[4]);
    if (secondConditioning.type !== 'NEXT_ORDER_CONDITIONED') throw new Error('expected second conditioning event');
    secondConditioning.sourceOrder = 0;
    secondConditioning.targetOrder = 1;

    expect(() => reduceRotaryCarryScheduleEvent(firstTransferState, secondConditioning)).toThrow(InvalidRotaryCarryScheduleError);
  });

  it('rejects a duplicate caused boundary at the same source order', () => {
    const trace = createRotaryCarryScheduleTrace(3, 2, 'duplicate-boundary');
    const afterBoundary = reduceEvents(trace.initialState, trace.events.slice(0, 4));
    const duplicateBoundary = structuredClone(trace.events[3]);

    expect(() => reduceRotaryCarryScheduleEvent(afterBoundary, duplicateBoundary)).toThrow(InvalidRotaryCarryScheduleError);
  });

  it('requires the explicit carry-out before completing a full-width chain', () => {
    const trace = createRotaryCarryScheduleTrace(2, 2, 'missing-carry-out');
    const beforeCompletion = reduceEvents(
      trace.initialState,
      trace.events.filter(event => event.type !== 'CARRY_OUT' && event.type !== 'SCHEDULE_COMPLETE'),
    );
    const completion = structuredClone(trace.events.find(event => event.type === 'SCHEDULE_COMPLETE')!);
    if (completion.type !== 'SCHEDULE_COMPLETE') throw new Error('expected completion event');
    completion.carryOut = false;

    expect(() => reduceRotaryCarryScheduleEvent(beforeCompletion, completion)).toThrow(InvalidRotaryCarryScheduleError);
  });

  it('rejects a carry-out for a chain that does not reach the register width', () => {
    const trace = createRotaryCarryScheduleTrace(3, 1, 'spurious-carry-out');
    const afterTransfer = reduceEvents(trace.initialState, trace.events.slice(0, 3));
    const carryOut: RotaryCarryScheduleEvent = {
      mechanismId: 'rotary-carry-schedule',
      cycleId: 'spurious-carry-out',
      sequence: 3,
      type: 'CARRY_OUT',
      sourceOrder: 2,
      targetOrder: 3,
      slot: 0,
    };

    expect(() => reduceRotaryCarryScheduleEvent(afterTransfer, carryOut)).toThrow(InvalidRotaryCarryScheduleError);
  });

  it('rejects a duplicate carry-out for the same full-width chain', () => {
    const trace = createRotaryCarryScheduleTrace(2, 2, 'duplicate-carry-out');
    const carryOutIndex = trace.events.findIndex(event => event.type === 'CARRY_OUT');
    const afterCarryOut = reduceEvents(trace.initialState, trace.events.slice(0, carryOutIndex + 1));
    const duplicateCarryOut = structuredClone(trace.events[carryOutIndex]);

    expect(() => reduceRotaryCarryScheduleEvent(afterCarryOut, duplicateCarryOut)).toThrow(InvalidRotaryCarryScheduleError);
  });

  it('rejects a caused boundary after the final scheduled transfer', () => {
    const trace = createRotaryCarryScheduleTrace(3, 1, 'post-final-boundary');
    const afterTransfer = reduceEvents(trace.initialState, trace.events.slice(0, 3));
    const boundary: RotaryCarryScheduleEvent = {
      mechanismId: 'rotary-carry-schedule',
      cycleId: 'post-final-boundary',
      sequence: 3,
      type: 'BOUNDARY_CROSSED',
      sourceOrder: 1,
      causedByCarry: true,
    };

    expect(() => reduceRotaryCarryScheduleEvent(afterTransfer, boundary)).toThrow(InvalidRotaryCarryScheduleError);
  });

  it.each([
    { label: 'conditioned source lags its transfer slot', width: 4, depth: 3, patch: { phase: 'CONDITIONED', currentSourceOrder: 0, conditionedTargetOrder: 1, nextTransferSlot: 1, completedTransfers: 1 } },
    { label: 'conditioned phase remains after the final transfer', width: 4, depth: 3, patch: { phase: 'CONDITIONED', currentSourceOrder: 3, conditionedTargetOrder: 4, nextTransferSlot: 3, completedTransfers: 3 } },
    { label: 'ready source lags by more than one transfer', width: 4, depth: 3, patch: { currentSourceOrder: 0, nextTransferSlot: 2, completedTransfers: 2 } },
    { label: 'partial completion retains the wrong source', width: 4, depth: 2, patch: { phase: 'COMPLETE', currentSourceOrder: 0, nextTransferSlot: 2, completedTransfers: 2 } },
    { label: 'full-width completion omits carry-out', width: 3, depth: 3, patch: { phase: 'COMPLETE', currentSourceOrder: 2, nextTransferSlot: 3, completedTransfers: 3, carryOut: false } },
    { label: 'carry-out flag is not boolean', width: 4, depth: 2, patch: { carryOut: 0 } },
  ])('rejects persisted state when $label', ({ width, depth, patch }) => {
    const state = { ...createRotaryCarrySchedule(width, depth), ...patch } as RotaryCarryScheduleState;
    expect(() => assertRotaryCarryScheduleState(state)).toThrow(InvalidRotaryCarryScheduleError);
  });

  it('accepts every producer-derived intermediate state across schedule dimensions', () => {
    for (let width = 2; width <= 6; width += 1) {
      for (let depth = 1; depth <= width; depth += 1) {
        const trace = createRotaryCarryScheduleTrace(width, depth, `valid-${width}-${depth}`);
        let state = structuredClone(trace.initialState);
        expect(() => assertRotaryCarryScheduleState(state)).not.toThrow();
        for (const event of trace.events) {
          state = reduceRotaryCarryScheduleEvent(state, event);
          expect(() => assertRotaryCarryScheduleState(state)).not.toThrow();
        }
        expect(state).toEqual(trace.finalState);
      }
    }
  });

  it.each(['slot', 'order', 'sequence', 'cycle', 'omit', 'insert', 'unknown', 'final'] as const)('rejects %s trace tampering', kind => {
    const trace = structuredClone(createRotaryCarryScheduleTrace(5, 3, 'tamper'));
    const transfer = trace.events.find(event => event.type === 'TRANSFER_OPPORTUNITY')!;
    if (kind === 'slot' && transfer.type === 'TRANSFER_OPPORTUNITY') transfer.slot = 2;
    if (kind === 'order' && transfer.type === 'TRANSFER_OPPORTUNITY') transfer.targetOrder = 3;
    if (kind === 'sequence') trace.events[2].sequence = 99;
    if (kind === 'cycle') trace.events[2].cycleId = 'other';
    if (kind === 'omit') trace.events.splice(1, 1);
    if (kind === 'insert') trace.events.splice(2, 0, structuredClone(trace.events[1]));
    if (kind === 'unknown') trace.events[0] = { ...trace.events[0], type: 'BAD' } as never;
    if (kind === 'final') trace.finalState.completedTransfers = 2;
    expect(() => replayRotaryCarrySchedule(trace)).toThrow(InvalidRotaryCarryScheduleError);
  });

  it.each([[1, 1], [3, 0], [3, 4], [2.5, 1]])('rejects malformed width/depth (%s, %s)', (width, depth) => {
    expect(() => createRotaryCarrySchedule(width, depth)).toThrow(InvalidRotaryCarryScheduleError);
  });

  it('rejects non-ready public action state', () => {
    const state = { ...createRotaryCarrySchedule(4, 2), phase: 'CONDITIONED', conditionedTargetOrder: 1 } as const;
    expect(() => transitionRotaryCarrySchedule(state, { type: 'SCHEDULE_CARRY_CHAIN', cycleId: 'bad-start' })).toThrow(InvalidRotaryCarryScheduleError);
  });
});
