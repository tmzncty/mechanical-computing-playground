/** Fixed P/M lesson: setting, operator repetition and decimal alignment are distinct. */
export const REPEATED_MULTIPLICAND = 314;
export const REPEATED_SETTING_DIGITS = Object.freeze([4, 1, 3] as const);
export type RepeatedCrankAction = 'TURN_CRANK' | 'SHIFT_CARRIAGE';

export interface RepeatedCrankState {
  settingDigits: readonly number[];
  carriageOffset: 0 | 1;
  accumulator: number;
  completedCranks: number;
  placeTurns: readonly [number, number];
  shiftCount: number;
}

export interface SettingTransfer {
  settingColumn: number;
  digit: number;
  targetColumn: number;
  contribution: number;
}

export interface RepeatedCrankEvent {
  type: 'CRANK_COMPLETED' | 'CARRIAGE_SHIFTED';
  sequence: number;
  action: RepeatedCrankAction;
  before: RepeatedCrankState;
  after: RepeatedCrankState;
  /** Per-column contributions of one complete crank; not physical contact timing. */
  transfers: SettingTransfer[];
}

export interface RepeatedCrankTrace {
  initialState: RepeatedCrankState;
  events: RepeatedCrankEvent[];
  finalState: RepeatedCrankState;
}

export function createRepeatedCrankState(): RepeatedCrankState {
  return { settingDigits: [...REPEATED_SETTING_DIGITS], carriageOffset: 0,
    accumulator: 0, completedCranks: 0, placeTurns: [0, 0], shiftCount: 0 };
}

function assertLessonState(state: Readonly<RepeatedCrankState>): void {
  const [units, tens] = state.placeTurns;
  if (state.settingDigits.length !== 3 || state.settingDigits.some((digit, i) => digit !== REPEATED_SETTING_DIGITS[i])
    || state.placeTurns.length !== 2
    || !Number.isInteger(units) || units < 0 || units > 7
    || !Number.isInteger(tens) || tens < 0 || tens > 2
    || (state.carriageOffset !== 0 && state.carriageOffset !== 1)
    || (state.carriageOffset === 0 && tens !== 0)
    || (state.carriageOffset === 1 && units !== 7)
    || state.shiftCount !== state.carriageOffset
    || state.completedCranks !== units + tens
    || state.accumulator !== REPEATED_MULTIPLICAND * (units + 10 * tens)) {
    throw new Error('state does not belong to the fixed 314 guided lesson');
  }
}

/** Alignment map only: no claim that these columns move in this physical order. */
export function repeatedSettingTransfers(state: Readonly<RepeatedCrankState>): SettingTransfer[] {
  assertLessonState(state);
  return state.settingDigits.map((digit, settingColumn) => ({
    settingColumn, digit, targetColumn: settingColumn + state.carriageOffset,
    contribution: digit * 10 ** (settingColumn + state.carriageOffset),
  }));
}

/** These permissions guide this exercise; they are not historical machine interlocks. */
export function nextRepeatedCrankAction(state: Readonly<RepeatedCrankState>): RepeatedCrankAction | null {
  assertLessonState(state);
  if (state.carriageOffset === 0) return state.placeTurns[0] < 7 ? 'TURN_CRANK' : 'SHIFT_CARRIAGE';
  return state.placeTurns[1] < 2 ? 'TURN_CRANK' : null;
}

export function transitionRepeatedCrank(
  state: Readonly<RepeatedCrankState>, action: RepeatedCrankAction,
): { state: RepeatedCrankState; event: RepeatedCrankEvent } {
  if (nextRepeatedCrankAction(state) !== action) throw new Error('action is outside this guided exercise step');
  const before = structuredClone(state);
  const after: RepeatedCrankState = structuredClone(state);
  const transfers = action === 'TURN_CRANK' ? repeatedSettingTransfers(state) : [];
  if (action === 'TURN_CRANK') {
    const contribution = transfers.reduce((sum, transfer) => sum + transfer.contribution, 0);
    after.accumulator += contribution;
    after.completedCranks += 1;
    after.placeTurns = state.carriageOffset === 0
      ? [state.placeTurns[0] + 1, state.placeTurns[1]]
      : [state.placeTurns[0], state.placeTurns[1] + 1];
  } else {
    after.carriageOffset = 1;
    after.shiftCount += 1;
  }
  assertLessonState(after);
  return { state: after, event: {
    type: action === 'TURN_CRANK' ? 'CRANK_COMPLETED' : 'CARRIAGE_SHIFTED',
    sequence: state.completedCranks + state.shiftCount, action, before,
    after: structuredClone(after), transfers,
  } };
}

/** Comparison summaries reuse exactly the requests available to the visitor. */
export function createRepeatedCrankTrace(): RepeatedCrankTrace {
  const initialState = createRepeatedCrankState();
  let state = initialState;
  const events: RepeatedCrankEvent[] = [];
  for (let action = nextRepeatedCrankAction(state); action !== null; action = nextRepeatedCrankAction(state)) {
    const result = transitionRepeatedCrank(state, action);
    state = result.state;
    events.push(result.event);
  }
  return { initialState, events, finalState: state };
}
