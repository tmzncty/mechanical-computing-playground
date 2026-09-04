export const PRINTING_LEDGER_ID = 'generic-printing-ledger';
export type PrintedLineKind = 'ITEM' | 'SUBTOTAL' | 'TOTAL';
export interface PrintedLine { sequence: number; kind: PrintedLineKind; value: number; }
export interface PrintingLedgerState {
  mechanismId: typeof PRINTING_LEDGER_ID;
  accumulator: number;
  printedLines: PrintedLine[];
  operationIndex: number;
  itemCount: number;
}
export type PrintingLedgerAction =
  | { type: 'ADD_ITEM'; amount: number }
  | { type: 'PRINT_SUBTOTAL' }
  | { type: 'PRINT_TOTAL' };
interface BaseEvent { mechanismId: typeof PRINTING_LEDGER_ID; sequence: number; claimType: 'P/M'; }
export type PrintingLedgerEvent =
  | (BaseEvent & { type: 'ITEM_RECORDED'; amount: number; accumulatorBefore: number; accumulatorAfter: number; itemCountBefore: number; itemCountAfter: number; line: PrintedLine })
  | (BaseEvent & { type: 'SUBTOTAL_RECORDED'; accumulatorBefore: number; accumulatorAfter: number; line: PrintedLine })
  | (BaseEvent & { type: 'TOTAL_RECORDED_AND_CLEARED'; accumulatorBefore: number; accumulatorAfter: 0; line: PrintedLine });
export interface PrintingLedgerTrace { initialState: PrintingLedgerState; actions: readonly PrintingLedgerAction[]; events: PrintingLedgerEvent[]; finalState: PrintingLedgerState; }
export class InvalidPrintingLedgerError extends Error { constructor(message: string) { super(message); this.name = 'InvalidPrintingLedgerError'; } }

function nonNegativeSafe(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) throw new InvalidPrintingLedgerError(`${name} must be a non-negative safe integer`);
}
function addSafe(left: number, right: number): number {
  const result = left + right;
  if (!Number.isSafeInteger(result)) throw new InvalidPrintingLedgerError('accumulator exceeds safe integer range');
  return result;
}
function assertLine(line: unknown, index: number): asserts line is PrintedLine {
  if (line === null || typeof line !== 'object' || Array.isArray(line)) throw new InvalidPrintingLedgerError('printed line must be a non-array object');
  const record = line as Partial<PrintedLine>;
  if (record.sequence !== index || !['ITEM', 'SUBTOTAL', 'TOTAL'].includes(record.kind as PrintedLineKind)) throw new InvalidPrintingLedgerError('invalid printed line identity/order');
  nonNegativeSafe(record.value as number, 'printed value');
}
export function assertPrintingLedgerState(state: Readonly<PrintingLedgerState>): void {
  if (state.mechanismId !== PRINTING_LEDGER_ID) throw new InvalidPrintingLedgerError('printing-ledger mechanism id mismatch');
  nonNegativeSafe(state.accumulator, 'accumulator'); nonNegativeSafe(state.operationIndex, 'operation index'); nonNegativeSafe(state.itemCount, 'item count');
  if (!Array.isArray(state.printedLines) || state.printedLines.length !== state.operationIndex) throw new InvalidPrintingLedgerError('printed record/operation consistency failed');
  let recordedAccumulator = 0;
  let recordedItemCount = 0;
  for (let index = 0; index < state.printedLines.length; index += 1) {
    if (!Object.prototype.hasOwnProperty.call(state.printedLines, index)) throw new InvalidPrintingLedgerError('printed record must be a dense array');
    const line = state.printedLines[index];
    assertLine(line, index);
    if (line.kind === 'ITEM') {
      if (line.value === 0) throw new InvalidPrintingLedgerError('item amount must be positive');
      recordedAccumulator = addSafe(recordedAccumulator, line.value);
      recordedItemCount += 1;
    } else if (line.kind === 'SUBTOTAL') {
      if (recordedAccumulator === 0) throw new InvalidPrintingLedgerError('subtotal requires accumulated items');
      if (line.value !== recordedAccumulator) throw new InvalidPrintingLedgerError('subtotal value mismatch');
    } else {
      if (recordedAccumulator === 0) throw new InvalidPrintingLedgerError('total requires accumulated items');
      if (line.value !== recordedAccumulator) throw new InvalidPrintingLedgerError('total value mismatch');
      recordedAccumulator = 0;
    }
  }
  if (recordedItemCount !== state.itemCount) throw new InvalidPrintingLedgerError('item count/record consistency failed');
  if (recordedAccumulator !== state.accumulator) throw new InvalidPrintingLedgerError('printed record/accumulator consistency failed');
}
export function createPrintingLedger(): PrintingLedgerState {
  return { mechanismId: PRINTING_LEDGER_ID, accumulator: 0, printedLines: [], operationIndex: 0, itemCount: 0 };
}
export function reducePrintingLedgerEvent(state: Readonly<PrintingLedgerState>, event: Readonly<PrintingLedgerEvent>): PrintingLedgerState {
  assertPrintingLedgerState(state);
  if (event.mechanismId !== PRINTING_LEDGER_ID || event.sequence !== state.operationIndex || event.claimType !== 'P/M') throw new InvalidPrintingLedgerError('invalid ledger event identity/sequence');
  const expectedLine = (kind: PrintedLineKind, value: number): PrintedLine => ({ sequence: state.printedLines.length, kind, value });
  let next: PrintingLedgerState;
  if (event.type === 'ITEM_RECORDED') {
    nonNegativeSafe(event.amount, 'item amount');
    const after = addSafe(state.accumulator, event.amount);
    const line = expectedLine('ITEM', event.amount);
    if (event.accumulatorBefore !== state.accumulator || event.accumulatorAfter !== after || event.itemCountBefore !== state.itemCount || event.itemCountAfter !== state.itemCount + 1 || JSON.stringify(event.line) !== JSON.stringify(line)) throw new InvalidPrintingLedgerError('invalid item event');
    next = { ...state, accumulator: after, itemCount: event.itemCountAfter, operationIndex: state.operationIndex + 1, printedLines: [...state.printedLines, line] };
  } else if (event.type === 'SUBTOTAL_RECORDED') {
    if (state.itemCount === 0 || state.accumulator === 0) throw new InvalidPrintingLedgerError('subtotal requires accumulated items');
    const line = expectedLine('SUBTOTAL', state.accumulator);
    if (event.accumulatorBefore !== state.accumulator || event.accumulatorAfter !== state.accumulator || JSON.stringify(event.line) !== JSON.stringify(line)) throw new InvalidPrintingLedgerError('invalid subtotal event');
    next = { ...state, operationIndex: state.operationIndex + 1, printedLines: [...state.printedLines, line] };
  } else if (event.type === 'TOTAL_RECORDED_AND_CLEARED') {
    if (state.itemCount === 0 || state.accumulator === 0) throw new InvalidPrintingLedgerError('total requires accumulated items');
    const line = expectedLine('TOTAL', state.accumulator);
    if (event.accumulatorBefore !== state.accumulator || event.accumulatorAfter !== 0 || JSON.stringify(event.line) !== JSON.stringify(line)) throw new InvalidPrintingLedgerError('invalid total event');
    next = { ...state, accumulator: 0, operationIndex: state.operationIndex + 1, printedLines: [...state.printedLines, line] };
  } else throw new InvalidPrintingLedgerError(`unknown ledger event: ${String((event as { type?: unknown }).type)}`);
  assertPrintingLedgerState(next); return next;
}
export function transitionPrintingLedger(state: Readonly<PrintingLedgerState>, action: Readonly<PrintingLedgerAction>): { state: PrintingLedgerState; events: PrintingLedgerEvent[] } {
  assertPrintingLedgerState(state);
  const base: BaseEvent = { mechanismId: PRINTING_LEDGER_ID, sequence: state.operationIndex, claimType: 'P/M' };
  let event: PrintingLedgerEvent;
  if (action.type === 'ADD_ITEM') {
    nonNegativeSafe(action.amount, 'item amount'); if (action.amount === 0) throw new InvalidPrintingLedgerError('item amount must be positive');
    event = { ...base, type: 'ITEM_RECORDED', amount: action.amount, accumulatorBefore: state.accumulator, accumulatorAfter: addSafe(state.accumulator, action.amount), itemCountBefore: state.itemCount, itemCountAfter: state.itemCount + 1, line: { sequence: state.printedLines.length, kind: 'ITEM', value: action.amount } };
  } else if (action.type === 'PRINT_SUBTOTAL') event = { ...base, type: 'SUBTOTAL_RECORDED', accumulatorBefore: state.accumulator, accumulatorAfter: state.accumulator, line: { sequence: state.printedLines.length, kind: 'SUBTOTAL', value: state.accumulator } };
  else if (action.type === 'PRINT_TOTAL') event = { ...base, type: 'TOTAL_RECORDED_AND_CLEARED', accumulatorBefore: state.accumulator, accumulatorAfter: 0, line: { sequence: state.printedLines.length, kind: 'TOTAL', value: state.accumulator } };
  else throw new InvalidPrintingLedgerError('unsupported printing-ledger action type');
  return { state: reducePrintingLedgerEvent(state, event), events: [event] };
}
export function tracePrintingLedger(actions: readonly PrintingLedgerAction[], initial = createPrintingLedger()): PrintingLedgerTrace {
  assertPrintingLedgerState(initial);
  let state = structuredClone(initial); const events: PrintingLedgerEvent[] = [];
  for (const action of actions) { const result = transitionPrintingLedger(state, action); events.push(...result.events); state = result.state; }
  return { initialState: structuredClone(initial), actions: structuredClone(actions), events, finalState: state };
}
export function replayPrintingLedger(trace: Readonly<PrintingLedgerTrace>): PrintingLedgerState {
  assertPrintingLedgerState(trace.initialState); assertPrintingLedgerState(trace.finalState);
  if (trace.actions.length !== trace.events.length) throw new InvalidPrintingLedgerError('action/event count mismatch');
  let state = structuredClone(trace.initialState);
  for (let index = 0; index < trace.events.length; index += 1) {
    const derived = transitionPrintingLedger(state, trace.actions[index]);
    if (JSON.stringify(derived.events[0]) !== JSON.stringify(trace.events[index])) throw new InvalidPrintingLedgerError('ledger action/event mismatch');
    state = reducePrintingLedgerEvent(state, trace.events[index]);
  }
  if (JSON.stringify(state) !== JSON.stringify(trace.finalState)) throw new InvalidPrintingLedgerError('ledger final state mismatch');
  return state;
}
export const PRINTING_LEDGER_PRESET: readonly PrintingLedgerAction[] = [
  { type: 'ADD_ITEM', amount: 12 }, { type: 'ADD_ITEM', amount: 8 }, { type: 'PRINT_SUBTOTAL' }, { type: 'ADD_ITEM', amount: 5 }, { type: 'PRINT_TOTAL' },
];
