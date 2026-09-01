import { describe, expect, it } from 'vitest';
import { canonicalize, parseTrace, replayTrace, serializeTrace } from '../src/core/trace';
import type { MechanismEvent } from '../src/core/events';
import {
  crankPlusOne,
  createCrankTrace,
  createDecimalRegister,
  digitsToString,
  incrementWheel,
  InvalidWheelStateError,
  reduceDecimalRegisterEvent,
  replay,
  transitionDecimalRegister,
  type CrankAction,
  type DecimalRegisterState,
} from '../src/mechanism-core';

describe('decimal wheel', () => {
  it.each([[0, 1], [8, 9]])('%i + 1 advances to %i', (position, expected) => {
    expect(incrementWheel(position)).toEqual({ position: expected, carry: false });
  });

  it('9 + 1 rolls over and emits a carry request', () => {
    expect(incrementWheel(9)).toEqual({ position: 0, carry: true });
  });
});

describe('carry chain compatibility API', () => {
  it.each([
    [[9, 0, 0, 0], '0010'],
    [[9, 9, 0, 0], '0100'],
    [[9, 9, 9, 9], '0000'],
  ])('increments %j to %s', (before, expected) => {
    expect(digitsToString(crankPlusOne(before).after)).toBe(expected);
  });

  it('exposes every carry stage and carry-out', () => {
    const result = crankPlusOne([9, 9, 9, 9]);
    expect(result.phases.map(({ phase }) => phase)).toEqual([
      'CRANK_BEGIN', 'WHEEL_STEP',
      'CARRY_PENDING', 'CARRY_PROPAGATED', 'WHEEL_STEP',
      'CARRY_PENDING', 'CARRY_PROPAGATED', 'WHEEL_STEP',
      'CARRY_PENDING', 'CARRY_PROPAGATED', 'WHEEL_STEP',
      'CARRY_OUT', 'CRANK_END',
    ]);
  });

  it('is deterministic and replayable', () => {
    const result = crankPlusOne([9, 9, 8], 3);
    expect(crankPlusOne(result.before, result.crank)).toEqual(result);
    expect(replay(result)).toEqual(result.after);
  });

  it('rejects invalid wheel states', () => {
    expect(() => crankPlusOne([])).toThrow(InvalidWheelStateError);
    expect(() => crankPlusOne([10])).toThrow(InvalidWheelStateError);
    expect(() => crankPlusOne([1.5])).toThrow(InvalidWheelStateError);
  });
});

describe('deterministic transition contract', () => {
  it('returns state, ordered events, warnings, and errors without mutating input', () => {
    const state = createDecimalRegister([9, 9, 0, 0]);
    const original = structuredClone(state);
    const action: CrankAction = { type: 'CRANK_PLUS_ONE', cycleId: 'canonical-0099' };
    const result = transitionDecimalRegister(state, action);
    expect(state).toEqual(original);
    expect(result.state.digits).toEqual([0, 0, 1, 0]);
    expect(result.warnings).toEqual([]);
    expect(result.errors).toEqual([]);
    expect(result.events.map(({ sequence }) => sequence)).toEqual(result.events.map((_, index) => index));
  });

  it('reports explicit overflow warning and event', () => {
    const trace = createCrankTrace([9, 9, 9, 9]);
    expect(trace.events.at(-2)?.type).toBe('CARRY_OUT');
    expect(trace.warnings).toMatchObject([{ code: 'OVERFLOW', wheel: { index: 3 } }]);
  });

  it('rejects malformed action and digit-array shapes before transitioning', () => {
    const state = createDecimalRegister([1, 0, 0, 0]);
    expect(() => transitionDecimalRegister(state, { type: 'CRANK_PLUS_ONE', cycleId: '' })).toThrow(
      InvalidWheelStateError,
    );

    const sparse = createDecimalRegister([1, 0, 0, 0]);
    delete sparse.digits[0];
    expect(() => transitionDecimalRegister(sparse, { type: 'CRANK_PLUS_ONE', cycleId: 'sparse' })).toThrow(
      InvalidWheelStateError,
    );

    const extended = createDecimalRegister([1, 0, 0, 0]);
    Object.assign(extended.digits, { [Symbol('forged')]: true });
    expect(() => transitionDecimalRegister(extended, { type: 'CRANK_PLUS_ONE', cycleId: 'extended' })).toThrow(
      InvalidWheelStateError,
    );
  });
});

describe('canonical JSON trace and UI-independent replay', () => {
  it('canonicalizes nested object keys without changing array order', () => {
    const canonical = [
      { type: 'FIRST', payload: { left: 1, right: 2 } },
      { type: 'SECOND', payload: { left: 3, right: 4 } },
    ];
    const reorderedKeys = [
      { payload: { right: 2, left: 1 }, type: 'FIRST' },
      { payload: { right: 4, left: 3 }, type: 'SECOND' },
    ];

    expect(JSON.stringify(canonicalize(reorderedKeys))).toBe(JSON.stringify(canonicalize(canonical)));
    expect(JSON.stringify(canonicalize(reorderedKeys.slice().reverse()))).not.toBe(
      JSON.stringify(canonicalize(canonical)),
    );
  });

  it('serializes identical state/action byte-for-byte identically', () => {
    expect(serializeTrace(createCrankTrace([9, 9, 0, 0], 7))).toBe(
      serializeTrace(createCrankTrace([9, 9, 0, 0], 7)),
    );
  });

  it('round trips JSON without changing carry event order', () => {
    const trace = createCrankTrace([9, 9, 0, 0], 7);
    const json = serializeTrace(trace);
    const parsed = parseTrace<DecimalRegisterState, CrankAction, MechanismEvent>(json);
    expect(serializeTrace(parsed)).toBe(json);
    expect(parsed.events.map(({ type }) => type)).toEqual(trace.events.map(({ type }) => type));
  });

  it('replays 0099 + 1 solely from the complete trace', () => {
    const parsed = parseTrace<DecimalRegisterState, CrankAction, MechanismEvent>(
      serializeTrace(createCrankTrace([9, 9, 0, 0], 7)),
    );
    expect(replayTrace(parsed, reduceDecimalRegisterEvent, transitionDecimalRegister)).toEqual(parsed.finalState);
    expect(digitsToString(parsed.finalState.digits)).toBe('0100');
  });

  it.each(['inserted', 'substituted'] as const)('rejects an unknown event type when it is %s', (mutation) => {
    const trace = createCrankTrace([9, 9, 0, 0], 7);
    const unknownEvent = {
      ...trace.events[0],
      type: 'UNKNOWN_DECIMAL_EVENT',
    } as unknown as MechanismEvent;
    const events = mutation === 'inserted'
      ? [unknownEvent, ...trace.events]
      : trace.events.map((event) => event.type === 'WHEEL_STEP' ? event : {
        ...event,
        type: 'UNKNOWN_DECIMAL_EVENT',
      } as unknown as MechanismEvent);

    expect(() => replayTrace({ ...trace, events }, reduceDecimalRegisterEvent, transitionDecimalRegister)).toThrow(
      'unsupported decimal register event type: UNKNOWN_DECIMAL_EVENT',
    );
  });

  it.each([
    'action-cycle',
    'envelope-cycle',
    'omitted-control-events',
    'event-order',
    'event-sequence',
    'warning',
  ] as const)('binds replay to the recorded action for %s tampering', (kind) => {
    const trace = structuredClone(createCrankTrace([9, 9, 0, 0], 7));
    if (kind === 'action-cycle') trace.action.cycleId = 'forged-action-cycle';
    if (kind === 'envelope-cycle') trace.cycleId = 'forged-envelope-cycle';
    if (kind === 'omitted-control-events') {
      trace.events = trace.events.filter((event) => event.type === 'WHEEL_STEP');
    }
    if (kind === 'event-order') {
      const firstStep = trace.events.findIndex((event) => event.type === 'WHEEL_STEP');
      const secondStep = trace.events.findIndex((event, index) => index > firstStep && event.type === 'WHEEL_STEP');
      [trace.events[firstStep], trace.events[secondStep]] = [trace.events[secondStep], trace.events[firstStep]];
    }
    if (kind === 'event-sequence') trace.events[0].sequence = 99;
    if (kind === 'warning') trace.warnings.push({ severity: 'warning', code: 'FORGED', message: 'not action-derived' });

    expect(() => replayTrace(trace, reduceDecimalRegisterEvent, transitionDecimalRegister)).toThrow();
  });

  it('rejects enumerable event fields that canonical JSON would discard', () => {
    const undefinedField = createCrankTrace([1, 0, 0, 0], 7);
    Object.assign(undefinedField.events[0], { forged: undefined });
    expect(() => replayTrace(
      undefinedField,
      reduceDecimalRegisterEvent,
      transitionDecimalRegister,
    )).toThrow('trace action did not produce the recorded events');

    const symbolField = createCrankTrace([1, 0, 0, 0], 7);
    Object.assign(symbolField.events[0], { [Symbol('forged')]: true });
    expect(() => replayTrace(
      symbolField,
      reduceDecimalRegisterEvent,
      transitionDecimalRegister,
    )).toThrow('trace action did not produce the recorded events');
  });

  it.each(['trace', 'initial-state', 'action', 'final-state'] as const)(
    'rejects unsupported enumerable %s fields',
    (target) => {
      const trace = createCrankTrace([1, 0, 0, 0], 7);
      if (target === 'trace') Object.assign(trace, { forged: undefined });
      if (target === 'initial-state') Object.assign(trace.initialState, { forged: undefined });
      if (target === 'action') Object.assign(trace.action, { [Symbol('forged')]: true });
      if (target === 'final-state') Object.assign(trace.finalState, { forged: undefined });

      expect(() => replayTrace(
        trace,
        reduceDecimalRegisterEvent,
        transitionDecimalRegister,
      )).toThrow();
    },
  );

  it('distinguishes sparse event arrays from explicit entries', () => {
    const trace = createCrankTrace([1, 0, 0, 0], 7);
    delete trace.events[0];
    expect(() => replayTrace(
      trace,
      reduceDecimalRegisterEvent,
      transitionDecimalRegister,
    )).toThrow('trace action did not produce the recorded events');
  });
});
