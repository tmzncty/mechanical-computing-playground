import type { MechanismEvent } from './events';
import { applyEvents } from './transition';
import type { Transition } from './transition';
import type { ErrorCondition, MechanismId, OperationCycleId, WarningCondition } from './types';

export interface OperationTrace<State, Action, Event extends MechanismEvent = MechanismEvent> {
  format: 'mechanical-computing-trace';
  version: 1;
  mechanismId: MechanismId;
  cycleId: OperationCycleId;
  initialState: State;
  action: Action;
  events: Event[];
  warnings: WarningCondition[];
  errors: ErrorCondition[];
  finalState: State;
}

export function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }
  return value;
}

export function serializeTrace<State, Action, Event extends MechanismEvent>(
  trace: OperationTrace<State, Action, Event>,
): string {
  return JSON.stringify(canonicalize(trace));
}

export function parseTrace<State, Action, Event extends MechanismEvent>(
  json: string,
): OperationTrace<State, Action, Event> {
  const parsed = JSON.parse(json) as Partial<OperationTrace<State, Action, Event>>;
  if (parsed.format !== 'mechanical-computing-trace' || parsed.version !== 1 || !Array.isArray(parsed.events)) {
    throw new Error('unsupported or malformed mechanism trace');
  }
  return parsed as OperationTrace<State, Action, Event>;
}

/**
 * Compare the complete enumerable trace shape while ignoring object member
 * insertion order. Unlike JSON.stringify, this does not collapse NaN into
 * null, sparse array slots with explicit undefined entries, or discard enumerable
 * undefined and Symbol properties.
 */
function enumerableKeys(value: object): PropertyKey[] {
  return Reflect.ownKeys(value)
    .filter((key) => Object.prototype.propertyIsEnumerable.call(value, key));
}

function traceValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
  }
  if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object') return false;
  if (Object.getPrototypeOf(left) !== Object.getPrototypeOf(right)) return false;

  const leftKeys = enumerableKeys(left);
  const rightKeys = enumerableKeys(right);
  return leftKeys.length === rightKeys.length
    && leftKeys.every((key) => Object.prototype.hasOwnProperty.call(right, key)
      && traceValuesEqual(
        (left as Record<PropertyKey, unknown>)[key],
        (right as Record<PropertyKey, unknown>)[key],
      ));
}

export function replayTrace<State, Action, Event extends MechanismEvent>(
  trace: OperationTrace<State, Action, Event>,
  reducer: (state: Readonly<State>, event: Readonly<Event>) => State,
  transition: Transition<State, Action, Event>,
): State {
  const supportedTraceKeys = new Set<PropertyKey>([
    'format',
    'version',
    'mechanismId',
    'cycleId',
    'initialState',
    'action',
    'events',
    'warnings',
    'errors',
    'finalState',
  ]);
  const traceKeys = trace !== null && typeof trace === 'object' ? enumerableKeys(trace) : [];
  if (
    trace === null
    || typeof trace !== 'object'
    || traceKeys.length !== supportedTraceKeys.size
    || traceKeys.some((key) => !supportedTraceKeys.has(key))
    || trace.format !== 'mechanical-computing-trace'
    || trace.version !== 1
    || !Array.isArray(trace.events)
    || !Array.isArray(trace.warnings)
    || !Array.isArray(trace.errors)
  ) {
    throw new Error('unsupported or malformed mechanism trace');
  }

  const replayed = applyEvents(trace.initialState, trace.events, reducer);
  if (!traceValuesEqual(replayed, trace.finalState)) {
    throw new Error('trace replay did not produce the recorded final state');
  }

  const expected = transition(trace.initialState, trace.action);
  if (expected.events.some(
    (event) => event.mechanismId !== trace.mechanismId || event.cycleId !== trace.cycleId,
  )) {
    throw new Error('trace envelope does not match the recorded action');
  }
  if (!traceValuesEqual(expected.events, trace.events)) {
    throw new Error('trace action did not produce the recorded events');
  }
  if (!traceValuesEqual(expected.warnings, trace.warnings)) {
    throw new Error('trace action did not produce the recorded warnings');
  }
  if (!traceValuesEqual(expected.errors, trace.errors)) {
    throw new Error('trace action did not produce the recorded errors');
  }
  if (!traceValuesEqual(expected.state, trace.finalState)) {
    throw new Error('trace action did not produce the recorded final state');
  }
  return replayed;
}
