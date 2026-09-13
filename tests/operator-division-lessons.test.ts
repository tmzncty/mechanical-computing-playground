import { describe, expect, it } from 'vitest';
import { replayOperatorDivision } from '../src/mechanisms/operator-division';
import {
  DIVISION_SCENARIOS, createDivisionLesson, divisionLessonFrame, resetDivisionLesson, stepDivisionLesson,
  type DivisionLesson,
} from '../src/exhibits/operator-division-lessons';

// Literal hand-calculated prefixes, not expected values obtained from another
// invocation of the implementation. Fields: residual, whole quotient, place,
// arithmetic operations, human operations, phase, exhausted place.
const exactPrefixes = [
  [8478, 0, 1, 0, 0, 'READY', false],
  [5338, 10, 1, 1, 1, 'READY', false],
  [2198, 20, 1, 2, 2, 'READY', false],
  [-942, 30, 1, 3, 3, 'OVERSHOOT_PENDING', false],
  [-942, 30, 1, 3, 3, 'CORRECTION_REQUIRED', false],
  [2198, 20, 1, 4, 4, 'READY', true],
  [2198, 20, 0, 4, 5, 'READY', false],
  [1884, 21, 0, 5, 6, 'READY', false],
  [1570, 22, 0, 6, 7, 'READY', false],
  [1256, 23, 0, 7, 8, 'READY', false],
  [942, 24, 0, 8, 9, 'READY', false],
  [628, 25, 0, 9, 10, 'READY', false],
  [314, 26, 0, 10, 11, 'READY', false],
  [0, 27, 0, 11, 12, 'READY', true],
  [0, 27, 0, 11, 12, 'COMPLETE', true],
];
const remainderPrefixes = [
  [1000, 0, 1, 0, 0, 'READY', false],
  [360, 10, 1, 1, 1, 'READY', false],
  [-280, 20, 1, 2, 2, 'OVERSHOOT_PENDING', false],
  [-280, 20, 1, 2, 2, 'CORRECTION_REQUIRED', false],
  [360, 10, 1, 3, 3, 'READY', true],
  [360, 10, 0, 3, 4, 'READY', false],
  [296, 11, 0, 4, 5, 'READY', false],
  [232, 12, 0, 5, 6, 'READY', false],
  [168, 13, 0, 6, 7, 'READY', false],
  [104, 14, 0, 7, 8, 'READY', false],
  [40, 15, 0, 8, 9, 'READY', false],
  [-24, 16, 0, 9, 10, 'OVERSHOOT_PENDING', false],
  [-24, 16, 0, 9, 10, 'CORRECTION_REQUIRED', false],
  [40, 15, 0, 10, 11, 'READY', true],
  [40, 15, 0, 10, 11, 'COMPLETE', true],
];
const subtract = 'SUBTRACT_ONCE';
const detect = 'OVERSHOOT_DETECTED';
const correct = 'CORRECT_ADD_BACK';
const shift = 'SHIFT_CARRIAGE_DOWN';
const complete = 'DIVISION_COMPLETE';

describe('operator-division teaching contrast', () => {
  it('keeps the original default and declares only the two input scenarios', () => {
    expect(createDivisionLesson()).toEqual({ scenarioId: 'exact', eventIndex: 0 });
    expect(DIVISION_SCENARIOS).toEqual([
      { id: 'exact', dividend: 8478, divisor: 314, initialOffset: 1 },
      { id: 'remainder', dividend: 1000, divisor: 64, initialOffset: 1 },
    ]);
  });

  it.each([
    { id: 'exact', prefixes: exactPrefixes, types: [subtract, subtract, subtract, detect, correct, shift, subtract, subtract, subtract, subtract, subtract, subtract, subtract, complete], counts: { subtractions: 10, detections: 1, corrections: 1, shifts: 1 }, actions: 13 },
    { id: 'remainder', prefixes: remainderPrefixes, types: [subtract, subtract, detect, correct, shift, subtract, subtract, subtract, subtract, subtract, subtract, detect, correct, complete], counts: { subtractions: 8, detections: 2, corrections: 2, shifts: 1 }, actions: 12 },
  ])('projects every literal $id prefix and retains action-bound replay', ({ id, prefixes, types, counts, actions }) => {
    let lesson = createDivisionLesson(id);
    for (let index = 0; index < prefixes.length; index += 1) {
      const frame = divisionLessonFrame(lesson);
      const { state } = frame;
      expect(lesson.eventIndex).toBe(index);
      expect([state.residual, frame.quotient, state.carriageOffset, state.operationCount, state.humanOperationCount, state.phase, state.placeExhausted]).toEqual(prefixes[index]);
      expect(frame.events.map(event => event.type)).toEqual(types.slice(0, index));
      expect(frame.nextEvent?.type).toBe(types[index]);
      expect(frame.lastEvent?.type).toBe(types[index - 1]);
      expect(state.dividend).toBe(state.divisor * frame.quotient + state.residual);
      expect(state.currentContribution).toBe(state.divisor * 10 ** state.carriageOffset);
      expect(state.operationCount).toBe(frame.counts.subtractions + frame.counts.corrections);
      expect(state.humanOperationCount).toBe(state.operationCount + frame.counts.shifts);
      lesson = stepDivisionLesson(lesson);
    }
    const frame = divisionLessonFrame(lesson);
    expect(frame.counts).toEqual(counts);
    expect(frame.trace.actions).toHaveLength(actions);
    expect(frame.state).toEqual(frame.trace.finalState);
    expect(replayOperatorDivision(frame.trace)).toEqual(frame.state);
    expect(stepDivisionLesson(lesson)).toEqual(lesson);
    for (let index = 0; index < frame.trace.events.length; index += 1) {
      if (frame.trace.events[index].type === detect) {
        expect(frame.trace.events[index - 1].type).toBe(subtract);
        expect(frame.trace.events[index].cycleId).toBe(frame.trace.events[index - 1].cycleId);
      }
    }
  });

  it('distinguishes the first remainder 40 from corrected 40 and completion', () => {
    const frame = (eventIndex: number) => divisionLessonFrame({ scenarioId: 'remainder', eventIndex });
    expect(frame(10).state).toMatchObject({ residual: 40, phase: 'READY', placeExhausted: false });
    expect(frame(10).nextEvent?.type).toBe(subtract);
    expect(frame(11)).toMatchObject({ quotient: 16, state: { residual: -24, phase: 'OVERSHOOT_PENDING', pendingOvershoot: { residualBefore: 40, quotientBefore: 5, offset: 0, contribution: 64 } } });
    expect(frame(12).state.phase).toBe('CORRECTION_REQUIRED');
    expect(frame(13)).toMatchObject({ quotient: 15, state: { residual: 40, phase: 'READY', placeExhausted: true, pendingOvershoot: null } });
    expect(frame(13).nextEvent?.type).toBe(complete);
    expect(frame(14).state.phase).toBe('COMPLETE');
  });

  it('selects and resets without retaining another scenario or cursor', () => {
    const original = { ...createDivisionLesson(), eventIndex: 3 };
    const other = stepDivisionLesson(createDivisionLesson('remainder'));
    expect(resetDivisionLesson(other)).toEqual(createDivisionLesson('remainder'));
    expect(resetDivisionLesson(original)).toEqual(createDivisionLesson());
    expect(divisionLessonFrame(original)).toMatchObject({ quotient: 30, state: { residual: -942, phase: 'OVERSHOOT_PENDING' } });
    expect(divisionLessonFrame({ ...other, eventIndex: 3 })).toMatchObject({ quotient: 20, state: { residual: -280, phase: 'CORRECTION_REQUIRED' } });
    expect(original.eventIndex).toBe(3);
    expect(other.eventIndex).toBe(1);
    expect(createDivisionLesson('exact')).toEqual({ scenarioId: 'exact', eventIndex: 0 });
  });

  it('returns isolated state/trace projections without mutating the lesson', () => {
    const lesson = Object.freeze({ scenarioId: 'remainder', eventIndex: 11 } as const);
    const frame = divisionLessonFrame(lesson);
    frame.state.quotientDigits[0] = 99;
    frame.state.pendingOvershoot!.residualBefore = 999;
    frame.trace.events.length = 0;
    expect(divisionLessonFrame(lesson)).toMatchObject({ quotient: 16, state: { residual: -24, quotientDigits: [6, 1], pendingOvershoot: { residualBefore: 40 } } });
    expect(stepDivisionLesson(lesson).eventIndex).toBe(12);
    expect(lesson.eventIndex).toBe(11);
  });

  it('rejects unknown scenario identities', () => {
    expect(() => createDivisionLesson('unknown')).toThrow(/Unknown division scenario/);
    expect(() => divisionLessonFrame({ scenarioId: 'unknown', eventIndex: 0 } as unknown as DivisionLesson)).toThrow(/Unknown division scenario/);
  });

  it.each([-1, 15, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects cursor %s rather than truncating a trace', eventIndex => {
    const lesson = { scenarioId: 'exact' as const, eventIndex };
    expect(() => divisionLessonFrame(lesson)).toThrow(/cursor/);
    expect(() => stepDivisionLesson(lesson)).toThrow(/cursor/);
    expect(() => resetDivisionLesson(lesson)).toThrow(/cursor/);
  });
});
