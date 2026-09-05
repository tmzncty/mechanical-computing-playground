import {
  createIntegrator,
  reduceIntegratorEvent,
  transitionIntegrator,
  type IntegratorEvent,
  type IntegratorState,
} from '../../mechanisms/continuous-integrator';
import { assertStableEnumerableDataTree, traceValuesEqual } from '../../core/trace';

export const CONTINUOUS_FLOW_ID = 'continuous-mechanics-teaching-flow';
const EVENTS_PER_FLOW_CYCLE = 6;

export interface ContinuousFlowFixture { inputA: number; inputB: number; inspectionInterval: number; }
export interface ContinuousFlowState {
  mechanismId: typeof CONTINUOUS_FLOW_ID;
  inputA: number;
  inputB: number;
  adderOutput: number | null;
  integrator: IntegratorState;
  tracerOutput: number | null;
  phase: 'READY' | 'SUM_AVAILABLE' | 'INTEGRATING' | 'INTEGRATED' | 'TRACED';
  eventIndex: number;
  cycleCount: number;
}
interface BaseEvent { mechanismId: typeof CONTINUOUS_FLOW_ID; sequence: number; cycleId: string; claimType: 'P/M'; }
export type ContinuousFlowEvent =
  | (BaseEvent & { type: 'INPUTS_OBSERVED'; inputA: number; inputB: number })
  | (BaseEvent & { type: 'ADDER_RELATION_APPLIED'; inputA: number; inputB: number; sum: number })
  | (BaseEvent & { type: 'INTEGRATOR_EVENT'; integratorEvent: IntegratorEvent })
  | (BaseEvent & { type: 'OUTPUT_TRACED'; integratedQuantity: number; cycleBefore: number; cycleAfter: number });
export interface ContinuousFlowTrace { fixture: ContinuousFlowFixture; initialState: ContinuousFlowState; events: ContinuousFlowEvent[]; finalState: ContinuousFlowState; }
export class InvalidContinuousFlowError extends Error { constructor(message: string) { super(message); this.name = 'InvalidContinuousFlowError'; } }

function finite(value: number, name: string): void { if (!Number.isFinite(value)) throw new InvalidContinuousFlowError(`${name} must be finite`); }
function add(a: number, b: number, name: string): number { const result = a + b; finite(result, name); return result; }
function increment(value: number, name: string): number { if (!Number.isSafeInteger(value) || value < 0 || value === Number.MAX_SAFE_INTEGER) throw new InvalidContinuousFlowError(`invalid ${name}`); return value + 1; }

export function createContinuousFlowState(fixture: ContinuousFlowFixture = { inputA: 2, inputB: 1, inspectionInterval: 0.5 }): ContinuousFlowState {
  finite(fixture.inputA, 'input A'); finite(fixture.inputB, 'input B'); finite(fixture.inspectionInterval, 'inspection interval');
  if (fixture.inspectionInterval <= 0) throw new InvalidContinuousFlowError('inspection interval must be positive');
  return { mechanismId: CONTINUOUS_FLOW_ID, inputA: fixture.inputA, inputB: fixture.inputB, adderOutput: null, integrator: createIntegrator(0, fixture.inspectionInterval), tracerOutput: null, phase: 'READY', eventIndex: 0, cycleCount: 0 };
}

export function reduceContinuousFlowEvent(state: Readonly<ContinuousFlowState>, event: Readonly<ContinuousFlowEvent>): ContinuousFlowState {
  if (state.mechanismId !== CONTINUOUS_FLOW_ID || event.mechanismId !== state.mechanismId || event.sequence !== state.eventIndex || event.claimType !== 'P/M') throw new InvalidContinuousFlowError('invalid flow event identity or sequence');
  const nextIndex = state.eventIndex + 1;
  if (event.type === 'INPUTS_OBSERVED') {
    if ((state.phase !== 'READY' && state.phase !== 'TRACED') || event.inputA !== state.inputA || event.inputB !== state.inputB) throw new InvalidContinuousFlowError('invalid input observation');
    return { ...state, phase: 'SUM_AVAILABLE', eventIndex: nextIndex, tracerOutput: null, adderOutput: null };
  }
  if (event.type === 'ADDER_RELATION_APPLIED') {
    const expected = add(state.inputA, state.inputB, 'adder output');
    if (state.phase !== 'SUM_AVAILABLE' || event.inputA !== state.inputA || event.inputB !== state.inputB || event.sum !== expected) throw new InvalidContinuousFlowError('invalid adder relation');
    return { ...state, adderOutput: expected, phase: 'INTEGRATING', eventIndex: nextIndex };
  }
  if (event.type === 'INTEGRATOR_EVENT') {
    if ((state.phase !== 'INTEGRATING' && state.phase !== 'INTEGRATED') || state.adderOutput === null || event.integratorEvent.sequence !== state.integrator.nextSequence) throw new InvalidContinuousFlowError('invalid embedded integrator event order');
    const integrator = reduceIntegratorEvent(state.integrator, event.integratorEvent);
    const complete = event.integratorEvent.type === 'INTEGRATED_QUANTITY_ADVANCED';
    return { ...state, integrator, phase: complete ? 'INTEGRATED' : 'INTEGRATING', eventIndex: nextIndex };
  }
  if (event.type === 'OUTPUT_TRACED') {
    if (state.phase !== 'INTEGRATED' || event.integratedQuantity !== state.integrator.integratedQuantity || event.cycleBefore !== state.cycleCount || event.cycleAfter !== increment(state.cycleCount, 'cycle count')) throw new InvalidContinuousFlowError('invalid tracer output');
    return { ...state, tracerOutput: event.integratedQuantity, phase: 'TRACED', eventIndex: nextIndex, cycleCount: event.cycleAfter };
  }
  throw new InvalidContinuousFlowError(`unknown continuous-flow event: ${String((event as { type?: unknown }).type)}`);
}

export function createContinuousFlowTrace(fixture: ContinuousFlowFixture = { inputA: 2, inputB: 1, inspectionInterval: 0.5 }, cycles = 1): ContinuousFlowTrace {
  if (!Number.isSafeInteger(cycles) || cycles <= 0) throw new InvalidContinuousFlowError('cycles must be a positive safe integer');
  const recordedFixture: ContinuousFlowFixture = {
    inputA: fixture.inputA,
    inputB: fixture.inputB,
    inspectionInterval: fixture.inspectionInterval,
  };
  const initialState = createContinuousFlowState(recordedFixture);
  let state = initialState;
  const events: ContinuousFlowEvent[] = [];
  type WithoutBase<T> = T extends BaseEvent ? Omit<T, keyof BaseEvent> : never;
  const push = (event: WithoutBase<ContinuousFlowEvent>) => {
    const full = { mechanismId: CONTINUOUS_FLOW_ID, sequence: events.length, cycleId: `flow-${state.cycleCount}`, claimType: 'P/M', ...event } as ContinuousFlowEvent;
    state = reduceContinuousFlowEvent(state, full); events.push(full);
  };
  for (let cycle = 0; cycle < cycles; cycle += 1) {
    push({ type: 'INPUTS_OBSERVED', inputA: recordedFixture.inputA, inputB: recordedFixture.inputB });
    const sum = add(recordedFixture.inputA, recordedFixture.inputB, 'adder output');
    push({ type: 'ADDER_RELATION_APPLIED', inputA: recordedFixture.inputA, inputB: recordedFixture.inputB, sum });
    const integration = transitionIntegrator(state.integrator, { type: 'OBSERVE_AND_INTEGRATE', cycleId: `integration-${cycle}`, inputQuantity: sum });
    for (const integratorEvent of integration.events) push({ type: 'INTEGRATOR_EVENT', integratorEvent });
    push({ type: 'OUTPUT_TRACED', integratedQuantity: integration.state.integratedQuantity, cycleBefore: cycle, cycleAfter: cycle + 1 });
  }
  return { fixture: recordedFixture, initialState: structuredClone(initialState), events, finalState: state };
}

export function stateAtContinuousEvent(trace: Readonly<ContinuousFlowTrace>, count: number): ContinuousFlowState {
  if (!Number.isInteger(count) || count < 0 || count > trace.events.length) throw new InvalidContinuousFlowError('event index outside trace');
  return trace.events.slice(0, count).reduce(reduceContinuousFlowEvent, structuredClone(trace.initialState));
}
export function replayContinuousFlow(trace: Readonly<ContinuousFlowTrace>): ContinuousFlowState {
  try {
    assertStableEnumerableDataTree(trace, 'continuous-flow trace requires stable enumerable data');
    if (
      !Array.isArray(trace.events)
      || trace.events.length === 0
      || trace.events.length % EVENTS_PER_FLOW_CYCLE !== 0
    ) {
      throw new InvalidContinuousFlowError('continuous-flow trace has an invalid event count');
    }
    const replayed = stateAtContinuousEvent(trace, trace.events.length);
    const expected = createContinuousFlowTrace(
      trace.fixture,
      trace.events.length / EVENTS_PER_FLOW_CYCLE,
    );
    if (!traceValuesEqual(expected, trace)) {
      throw new InvalidContinuousFlowError('continuous-flow trace is not fixture-derived');
    }
    return replayed;
  } catch (error) {
    if (error instanceof InvalidContinuousFlowError) throw error;
    throw new InvalidContinuousFlowError('invalid continuous-flow trace data');
  }
}
