import { describe, expect, it } from 'vitest';
import { assertPrintingLedgerState, createPrintingLedger, InvalidPrintingLedgerError, PRINTING_LEDGER_PRESET, reducePrintingLedgerEvent, replayPrintingLedger, tracePrintingLedger, transitionPrintingLedger, type PrintedLine, type PrintingLedgerAction, type PrintingLedgerEvent, type PrintingLedgerState } from '../src/mechanisms/printing-ledger';
import { getOutputContractProfile, OUTPUT_CONTRACT_PROFILES } from '../src/exhibits/output-contracts';
const clone = <T>(value: T): T => structuredClone(value);
const ledgerState = (accumulator: number, printedLines: PrintedLine[], itemCount: number): PrintingLedgerState => ({
  ...createPrintingLedger(),
  accumulator,
  printedLines,
  operationIndex: printedLines.length,
  itemCount,
});
const sparseLedgerState = (hole: 'start' | 'middle' | 'end'): PrintingLedgerState => {
  const printedLines = Array<PrintedLine>(hole === 'middle' ? 3 : 2);
  if (hole === 'start') printedLines[1] = { sequence: 1, kind: 'ITEM', value: 12 };
  if (hole === 'middle') {
    printedLines[0] = { sequence: 0, kind: 'ITEM', value: 12 };
    printedLines[2] = { sequence: 2, kind: 'SUBTOTAL', value: 12 };
  }
  if (hole === 'end') printedLines[0] = { sequence: 0, kind: 'ITEM', value: 12 };
  return ledgerState(12, printedLines, 1);
};
const disguisedPrintedLine = (shape: 'array' | 'function' | 'null'): PrintedLine => {
  if (shape === 'null') return null as unknown as PrintedLine;
  const value = shape === 'array' ? [] : () => undefined;
  return Object.assign(value, { sequence: 0, kind: 'ITEM', value: 12 }) as unknown as PrintedLine;
};
const expectInvalidPrintedLine = (operation: () => unknown): void => {
  expect(operation).toThrow(InvalidPrintingLedgerError);
  expect(operation).toThrow('printed line must be a non-array object');
};

describe('generic P/M printing ledger', () => {
  it('persists two item lines while accumulating 12 + 8', () => {
    const trace = tracePrintingLedger(PRINTING_LEDGER_PRESET.slice(0, 2));
    expect(trace.finalState.accumulator).toBe(20);
    expect(trace.finalState.printedLines).toEqual([{ sequence: 0, kind: 'ITEM', value: 12 }, { sequence: 1, kind: 'ITEM', value: 8 }]);
  });
  it('subtotal records 20 and retains 20', () => {
    const state = tracePrintingLedger(PRINTING_LEDGER_PRESET.slice(0, 3)).finalState;
    expect(state.accumulator).toBe(20); expect(state.printedLines.at(-1)).toEqual({ sequence: 2, kind: 'SUBTOTAL', value: 20 });
  });
  it('then adds 5, prints total 25, and clears only working state', () => {
    const trace = tracePrintingLedger(PRINTING_LEDGER_PRESET);
    expect(trace.finalState.accumulator).toBe(0);
    expect(trace.finalState.printedLines.map(line => `${line.kind}:${line.value}`)).toEqual(['ITEM:12', 'ITEM:8', 'SUBTOTAL:20', 'ITEM:5', 'TOTAL:25']);
  });
  it('starts a new accumulation after total without erasing the old record', () => {
    const closed = tracePrintingLedger(PRINTING_LEDGER_PRESET).finalState;
    const next = transitionPrintingLedger(closed, { type: 'ADD_ITEM', amount: 7 }).state;
    expect(next.accumulator).toBe(7); expect(next.printedLines).toHaveLength(6); expect(next.printedLines[4]).toMatchObject({ kind: 'TOTAL', value: 25 });
  });
  it('is deterministic and replayable', () => {
    const left = tracePrintingLedger(PRINTING_LEDGER_PRESET); const right = tracePrintingLedger(PRINTING_LEDGER_PRESET);
    expect(left).toEqual(right); expect(replayPrintingLedger(left)).toEqual(left.finalState);
  });
  it.each([
    ['stale accumulator', ledgerState(99, [{ sequence: 0, kind: 'ITEM', value: 12 }], 1), /printed record\/accumulator consistency failed/],
    ['zero-valued item', ledgerState(0, [{ sequence: 0, kind: 'ITEM', value: 0 }], 1), /item amount must be positive/],
    ['orphan subtotal', ledgerState(0, [{ sequence: 0, kind: 'SUBTOTAL', value: 0 }], 0), /subtotal requires accumulated items/],
    ['wrong subtotal', ledgerState(12, [{ sequence: 0, kind: 'ITEM', value: 12 }, { sequence: 1, kind: 'SUBTOTAL', value: 99 }], 1), /subtotal value mismatch/],
    ['wrong total', ledgerState(0, [{ sequence: 0, kind: 'ITEM', value: 12 }, { sequence: 1, kind: 'TOTAL', value: 99 }], 1), /total value mismatch/],
  ] as const)('rejects a causally impossible %s state', (_name, state, diagnostic) => {
    expect(() => assertPrintingLedgerState(state)).toThrow(diagnostic);
  });
  it('rejects a printed record whose running total exceeds the safe-integer range', () => {
    const impossible = ledgerState(0, [
      { sequence: 0, kind: 'ITEM', value: Number.MAX_SAFE_INTEGER },
      { sequence: 1, kind: 'ITEM', value: 1 },
    ], 2);
    expect(() => assertPrintingLedgerState(impossible)).toThrow(/accumulator exceeds safe integer range/);
  });
  it.each(['start', 'middle', 'end'] as const)('rejects a sparse printed record with a hole at the %s', hole => {
    expect(() => assertPrintingLedgerState(sparseLedgerState(hole))).toThrow(/printed record must be a dense array/);
  });
  it.each(['assert', 'transition', 'reduce', 'trace', 'replay'] as const)('rejects an array masquerading as a printed line through %s', entryPoint => {
    const impossible = ledgerState(12, [disguisedPrintedLine('array')], 1);
    const validState = tracePrintingLedger([{ type: 'ADD_ITEM', amount: 12 }]).finalState;
    const totalEvent = transitionPrintingLedger(validState, { type: 'PRINT_TOTAL' }).events[0];
    const operation = {
      assert: () => assertPrintingLedgerState(impossible),
      transition: () => transitionPrintingLedger(impossible, { type: 'PRINT_TOTAL' }),
      reduce: () => reducePrintingLedgerEvent(impossible, totalEvent),
      trace: () => tracePrintingLedger([], impossible),
      replay: () => replayPrintingLedger({ initialState: impossible, actions: [], events: [], finalState: clone(impossible) }),
    }[entryPoint];
    expectInvalidPrintedLine(operation);
  });
  it.each(['null', 'function'] as const)('rejects a %s printed line with a stable domain error', shape => {
    const impossible = ledgerState(12, [disguisedPrintedLine(shape)], 1);
    expectInvalidPrintedLine(() => assertPrintingLedgerState(impossible));
  });
  it('accepts a dense plain-object printed record', () => {
    const state = ledgerState(12, [{ sequence: 0, kind: 'ITEM', value: 12 }], 1);
    expect(() => assertPrintingLedgerState(state)).not.toThrow();
    expect(replayPrintingLedger(tracePrintingLedger([], state))).toEqual(state);
  });
  it('fails closed for an impossible initial state even when a trace has no actions', () => {
    const impossible = ledgerState(99, [{ sequence: 0, kind: 'ITEM', value: 12 }], 1);
    expect(() => tracePrintingLedger([], impossible)).toThrow(/printed record\/accumulator consistency failed/);
    expect(() => replayPrintingLedger({ initialState: impossible, actions: [], events: [], finalState: clone(impossible) })).toThrow(/printed record\/accumulator consistency failed/);
  });
  it('accepts a causally valid persistent snapshot in a zero-action trace', () => {
    const initial = tracePrintingLedger(PRINTING_LEDGER_PRESET).finalState;
    const trace = tracePrintingLedger([], initial);
    expect(replayPrintingLedger(trace)).toEqual(initial);
  });
  it('accepts a new accumulation batch after a total', () => {
    const trace = tracePrintingLedger([
      { type: 'ADD_ITEM', amount: 12 },
      { type: 'PRINT_TOTAL' },
      { type: 'ADD_ITEM', amount: 5 },
    ]);
    expect(trace.finalState).toMatchObject({ accumulator: 5, itemCount: 2 });
    expect(trace.finalState.printedLines.map(line => `${line.kind}:${line.value}`)).toEqual(['ITEM:12', 'TOTAL:12', 'ITEM:5']);
    expect(replayPrintingLedger(trace)).toEqual(trace.finalState);
  });
  it('accepts repeated valid subtotals without clearing the running total', () => {
    const trace = tracePrintingLedger([
      { type: 'ADD_ITEM', amount: 12 },
      { type: 'PRINT_SUBTOTAL' },
      { type: 'PRINT_SUBTOTAL' },
    ]);
    expect(trace.finalState).toMatchObject({ accumulator: 12, itemCount: 1 });
    expect(trace.finalState.printedLines.map(line => `${line.kind}:${line.value}`)).toEqual(['ITEM:12', 'SUBTOTAL:12', 'SUBTOTAL:12']);
    expect(replayPrintingLedger(trace)).toEqual(trace.finalState);
  });
  it.each(['sequence', 'value', 'before', 'after', 'kind', 'final', 'omit', 'action'] as const)('rejects %s tampering', kind => {
    const trace = clone(tracePrintingLedger(PRINTING_LEDGER_PRESET));
    if (kind === 'sequence') trace.events[1].sequence = 9;
    if (kind === 'value') trace.events[0].line.value = 99;
    if (kind === 'before') trace.events[1].accumulatorBefore += 1;
    if (kind === 'after') trace.events[1].accumulatorAfter += 1;
    if (kind === 'kind') trace.events[2].line.kind = 'TOTAL';
    if (kind === 'final') trace.finalState.accumulator = 25;
    if (kind === 'omit') trace.events.pop();
    if (kind === 'action') (trace.actions[0] as { amount?: number }).amount = 13;
    expect(() => replayPrintingLedger(trace)).toThrow(InvalidPrintingLedgerError);
  });
  it('fails closed for unknown/invalid/unsafe operations', () => {
    expect(() => transitionPrintingLedger(createPrintingLedger(), { type: 'BAD' } as unknown as PrintingLedgerAction)).toThrow(/unsupported/);
    expect(() => transitionPrintingLedger(createPrintingLedger(), { type: 'ADD_ITEM', amount: 0 })).toThrow(InvalidPrintingLedgerError);
    expect(() => transitionPrintingLedger(createPrintingLedger(), { type: 'ADD_ITEM', amount: 1.5 })).toThrow(InvalidPrintingLedgerError);
    expect(() => transitionPrintingLedger(createPrintingLedger(), { type: 'PRINT_SUBTOTAL' })).toThrow(/requires accumulated/);
    const trace = tracePrintingLedger([{ type: 'ADD_ITEM', amount: 1 }]); trace.events[0] = { ...trace.events[0], type: 'BAD' } as unknown as PrintingLedgerEvent;
    expect(() => replayPrintingLedger(trace)).toThrow();
  });
});

describe('typed output-contract provenance', () => {
  it('has unique required profiles and valid two-axis source metadata', () => {
    const ids = OUTPUT_CONTRACT_PROFILES.map(profile => profile.id); expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining(['burroughs-calculator-register', 'burroughs-class-3', 'burroughs-style-9', 'swalm-us885202', 'difference-engine-output']));
    for (const profile of OUTPUT_CONTRACT_PROFILES) { expect(profile.sourceLabel.trim()).not.toBe(''); expect(() => new URL(profile.sourceUrl)).not.toThrow(); expect(['H', 'R', 'H/R']).toContain(profile.claimType); expect(['E1', 'E2', 'E3', 'E4']).toContain(profile.evidenceStrength); expect(profile.notEstablished.length).toBeGreaterThan(0); }
  });
  it('keeps generic event timing out of historical profiles', () => {
    const text = JSON.stringify(OUTPUT_CONTRACT_PROFILES); expect(text).not.toContain('ITEM_RECORDED → SUBTOTAL_RECORDED');
    expect(getOutputContractProfile('swalm-us885202').notEstablished.some(item => item.en.includes('repository ledger'))).toBe(true);
    expect(getOutputContractProfile('difference-engine-output').notEstablished.some(item => item.en.includes('historical phases'))).toBe(true);
  });
  it('fails closed for unknown profile IDs', () => { expect(() => getOutputContractProfile('bad' as never)).toThrow(/unknown output-contract profile/); });
});
