import { quotientValue, reduceDivisionEvent, traceOperatorDivision } from '../../mechanisms/operator-division';

/** Two P/M teaching inputs, not named-machine procedures or stored answers. */
export const DIVISION_SCENARIOS = [
  { id: 'exact', dividend: 8478, divisor: 314, initialOffset: 1 },
  { id: 'remainder', dividend: 1000, divisor: 64, initialOffset: 1 },
] as const;

export type DivisionScenarioId = typeof DIVISION_SCENARIOS[number]['id'];
export interface DivisionLesson {
  scenarioId: DivisionScenarioId;
  /** Number of visible events, not number of operator actions. */
  eventIndex: number;
}

function scenarioFor(id: string) {
  const scenario = DIVISION_SCENARIOS.find(candidate => candidate.id === id);
  if (!scenario) throw new Error(`Unknown division scenario: ${id}`);
  return scenario;
}

export function createDivisionLesson(scenarioId: string = 'exact'): DivisionLesson {
  return { scenarioId: scenarioFor(scenarioId).id, eventIndex: 0 };
}

export function divisionLessonFrame(lesson: Readonly<DivisionLesson>) {
  const scenario = scenarioFor(lesson.scenarioId);
  const trace = traceOperatorDivision(scenario.dividend, scenario.divisor, scenario.initialOffset);
  if (!Number.isSafeInteger(lesson.eventIndex) || lesson.eventIndex < 0 || lesson.eventIndex > trace.events.length) {
    throw new Error('Division event cursor is out of range');
  }
  const events = trace.events.slice(0, lesson.eventIndex);
  // One subtraction action can emit two events. Retain the pending overshoot
  // prefix instead of jumping straight to that action's detected final state.
  const state = events.reduce(reduceDivisionEvent, structuredClone(trace.initialState));
  return {
    scenario, trace, events, state, quotient: quotientValue(state),
    lastEvent: events.at(-1),
    nextEvent: trace.events[lesson.eventIndex],
    counts: {
      subtractions: events.filter(event => event.type === 'SUBTRACT_ONCE').length,
      detections: events.filter(event => event.type === 'OVERSHOOT_DETECTED').length,
      corrections: events.filter(event => event.type === 'CORRECT_ADD_BACK').length,
      shifts: events.filter(event => event.type === 'SHIFT_CARRIAGE_DOWN').length,
    },
  };
}

export function stepDivisionLesson(lesson: Readonly<DivisionLesson>): DivisionLesson {
  const { trace } = divisionLessonFrame(lesson);
  return { ...lesson, eventIndex: Math.min(lesson.eventIndex + 1, trace.events.length) };
}

export function resetDivisionLesson(lesson: Readonly<DivisionLesson>): DivisionLesson {
  divisionLessonFrame(lesson);
  return createDivisionLesson(lesson.scenarioId);
}
