import { describe, expect, it } from 'vitest';
import { compare314x27 } from '../src/exhibits/multiplication-compare';
import { steppedDrum } from '../src/mechanisms/stepped-drum';
import { pinwheel } from '../src/mechanisms/pinwheel';
import { createRepeatedCrankState, createRepeatedCrankTrace, nextRepeatedCrankAction,
  repeatedSettingTransfers, transitionRepeatedCrank, type RepeatedCrankState } from '../src/exhibits/repeated-crank-multiplication';
import { getOperatorWorkProfile } from '../src/exhibits/operator-work';

describe('multiplicand setting versus operator repetition', () => {
  it('represents the fixed 314 setting, not the multiplier digits 7 and 2', () => {
    const comparison = compare314x27();
    expect(comparison.pinwheel.map(operation => operation.effectivePins)).toEqual([4, 1, 3]);
    expect(comparison.steppedDrum.map(operation => operation.effectiveSteps)).toEqual([4, 1, 3]);
  });

  it('describes one stepped-drum actuation independently of the selected digit', () => {
    expect(steppedDrum(4, 0)).toMatchObject({ effectiveSteps: 4, crankCount: 1 });
  });
});

describe('complete-crank guided lesson', () => {
  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])('keeps one actuator request distinct from digit %i', digit => {
    expect(steppedDrum(digit, 0)).toMatchObject({ crankCount: 1, effectiveSteps: digit });
    expect(pinwheel(digit, 0)).toMatchObject({ crankCount: 1, effectivePins: digit });
  });

  it('starts with fixed column settings, no work and three alignment contributions', () => {
    const state = createRepeatedCrankState();
    expect(state).toEqual({ settingDigits: [4, 1, 3], carriageOffset: 0, accumulator: 0,
      completedCranks: 0, placeTurns: [0, 0], shiftCount: 0 });
    expect(repeatedSettingTransfers(state)).toEqual([
      { settingColumn: 0, digit: 4, targetColumn: 0, contribution: 4 },
      { settingColumn: 1, digit: 1, targetColumn: 1, contribution: 10 },
      { settingColumn: 2, digit: 3, targetColumn: 2, contribution: 300 },
    ]);
  });

  it('produces one complete event for each of seven actual turn requests', () => {
    let state = createRepeatedCrankState();
    const amounts = [314, 628, 942, 1256, 1570, 1884, 2198];
    for (let i = 0; i < amounts.length; i += 1) {
      const previous = structuredClone(state);
      const result = transitionRepeatedCrank(state, 'TURN_CRANK');
      expect(state).toEqual(previous);
      expect(result.event).toMatchObject({ type: 'CRANK_COMPLETED', sequence: i, action: 'TURN_CRANK',
        before: previous, after: { accumulator: amounts[i], completedCranks: i + 1, placeTurns: [i + 1, 0] } });
      expect(result.event.transfers.map(transfer => transfer.contribution)).toEqual([4, 10, 300]);
      expect(result.state.settingDigits).toEqual([4, 1, 3]);
      state = result.state;
    }
    expect(nextRepeatedCrankAction(state)).toBe('SHIFT_CARRIAGE');
  });

  it('shifts alignment without adding, counting a turn or changing settings', () => {
    const trace = createRepeatedCrankTrace();
    const shift = trace.events[7];
    expect(shift).toMatchObject({ type: 'CARRIAGE_SHIFTED', sequence: 7, transfers: [],
      before: { accumulator: 2198, completedCranks: 7, placeTurns: [7, 0], carriageOffset: 0, shiftCount: 0 },
      after: { accumulator: 2198, completedCranks: 7, placeTurns: [7, 0], carriageOffset: 1, shiftCount: 1 } });
    expect(repeatedSettingTransfers(shift.after)).toEqual([
      { settingColumn: 0, digit: 4, targetColumn: 1, contribution: 40 },
      { settingColumn: 1, digit: 1, targetColumn: 2, contribution: 100 },
      { settingColumn: 2, digit: 3, targetColumn: 3, contribution: 3000 },
    ]);
    expect(trace.events.slice(8).map(event => event.after.accumulator)).toEqual([5338, 8478]);
    expect(trace.events.slice(8).map(event => event.transfers.reduce((sum, transfer) => sum + transfer.contribution, 0))).toEqual([3140, 3140]);
    expect(trace.finalState).toMatchObject({ completedCranks: 9, shiftCount: 1, placeTurns: [7, 2], settingDigits: [4, 1, 3] });
  });

  it('keeps fixed setting-column identity separate from carriage offset in both descriptions', () => {
    const comparison = compare314x27();
    for (const descriptors of [comparison.steppedDrum, comparison.pinwheel]) {
      expect(descriptors.map(item => item.settingColumn)).toEqual([0, 1, 2]);
      expect(descriptors.map(item => item.carriageShift)).toEqual([0, 0, 0]);
      expect(descriptors.map(item => item.crankCount)).toEqual([1, 1, 1]);
    }
  });

  it('replays its ten recorded requests through the same transition without changing inputs', () => {
    const trace = createRepeatedCrankTrace();
    expect(createRepeatedCrankTrace()).toEqual(trace);
    expect(trace.events).toHaveLength(10);
    let state = createRepeatedCrankState();
    for (const event of trace.events) {
      const result = transitionRepeatedCrank(state, event.action);
      expect(result.event).toEqual(event);
      state = result.state;
    }
    expect(state).toEqual(trace.finalState);
    expect(trace.initialState).toEqual(createRepeatedCrankState());
  });

  it('does not share mutable setting/turn arrays or state snapshots across requests', () => {
    const before = createRepeatedCrankState();
    Object.freeze(before.settingDigits); Object.freeze(before.placeTurns); Object.freeze(before);
    const result = transitionRepeatedCrank(before, 'TURN_CRANK');
    result.state.accumulator = 999;
    (result.state.settingDigits as number[])[0] = 9;
    expect(result.event.after.accumulator).toBe(314);
    expect(result.event.after.settingDigits).toEqual([4, 1, 3]);
    expect(before).toEqual(createRepeatedCrankState());
  });

  it('rejects out-of-guide requests at every boundary without changing prior state', () => {
    const trace = createRepeatedCrankTrace();
    for (const state of [trace.initialState, ...trace.events.map(event => event.after)]) {
      for (const action of ['TURN_CRANK', 'SHIFT_CARRIAGE'] as const) {
        if (action === nextRepeatedCrankAction(state)) continue;
        const previous = structuredClone(state);
        expect(() => transitionRepeatedCrank(state, action)).toThrow('guided exercise');
        expect(state).toEqual(previous);
      }
    }
    expect(nextRepeatedCrankAction(trace.finalState)).toBeNull();
  });

  it('does not accept a different setting or a fictitious running amount as this fixed lesson', () => {
    const cases: RepeatedCrankState[] = [
      { ...createRepeatedCrankState(), settingDigits: [7, 2] },
      { ...createRepeatedCrankState(), accumulator: 8478 },
      { ...createRepeatedCrankState(), completedCranks: 7 },
      { ...createRepeatedCrankState(), carriageOffset: 1, shiftCount: 1 },
    ];
    for (const state of cases) expect(() => transitionRepeatedCrank(state, 'TURN_CRANK')).toThrow('fixed 314');
  });

  it('derives summaries from complete requests while preserving direct and operator-work consumers', () => {
    const comparison = compare314x27();
    const trace = comparison.repeatedCrankTrace;
    for (const path of [comparison.paths.steppedDrum, comparison.paths.pinwheel]) {
      expect(path.finalResult).toBe(trace.finalState.accumulator);
      expect(path.operationCycles).toBe(trace.events.filter(event => event.type === 'CRANK_COMPLETED').length);
      expect(path.carriageShifts).toBe(trace.events.filter(event => event.type === 'CARRIAGE_SHIFTED').length);
    }
    expect(comparison.directMultiplication.trace.events.filter(event => event.type === 'OPERATION_CYCLE').map(event => event.contribution)).toEqual([2198, 6280]);
    expect(comparison.paths.directMultiplication.operationCycles).toBe(2);
    expect(comparison.paths.repeatedAddition.operationCycles).toBe(27);
    const paths = getOperatorWorkProfile('multiplication-314x27').multiplicationPaths!;
    expect(paths.map(path => path.operationCycles)).toEqual([27, 9, 9, 2]);
  });
});
