import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pageOwnsSpace } from '../src/ui/keyboard';

// Node unit tests isolate the event gate and composed-path traversal. Actual DOM matching,
// native activation and editing behavior are verified separately in the browser regression.
class PathElement {
  constructor(readonly ownsSpace = false) {}
  matches() { return this.ownsSpace; }
}

function keyEvent(patch: Partial<KeyboardEvent> = {}, path: unknown[] = []): KeyboardEvent {
  return {
    key: ' ', defaultPrevented: false, isComposing: false,
    altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, repeat: false,
    composedPath: () => path,
    ...patch,
  } as KeyboardEvent;
}

describe('page Space ownership', () => {
  beforeEach(() => vi.stubGlobal('Element', PathElement));
  afterEach(() => vi.unstubAllGlobals());

  it('accepts an unmodified background Space', () => {
    expect(pageOwnsSpace(keyEvent({}, [new PathElement(), {}, null]))).toBe(true);
  });

  it.each(['Enter', 'ArrowRight', 'Spacebar', 'a', ''])('does not claim %j', key => {
    expect(pageOwnsSpace(keyEvent({ key }))).toBe(false);
  });

  it.each(['defaultPrevented', 'isComposing', 'altKey', 'ctrlKey', 'metaKey', 'shiftKey'] as const)(
    'leaves %s events with their existing owner', flag => {
      const composedPath = vi.fn(() => []);
      expect(pageOwnsSpace(keyEvent({ [flag]: true, composedPath }))).toBe(false);
      expect(composedPath).not.toHaveBeenCalled();
    },
  );

  it('leaves Space with the target control', () => {
    expect(pageOwnsSpace(keyEvent({}, [new PathElement(true), new PathElement()]))).toBe(false);
  });

  it('leaves a descendant event with its interactive ancestor', () => {
    expect(pageOwnsSpace(keyEvent({}, [new PathElement(), new PathElement(true), {}]))).toBe(false);
  });

  it('recognizes an original shadow control even when the event target is a passive host', () => {
    const host = new PathElement();
    expect(pageOwnsSpace(keyEvent({ target: host as unknown as EventTarget }, [new PathElement(true), {}, host]))).toBe(false);
  });

  it('does not mistake non-element path entries for interactive DOM controls', () => {
    expect(pageOwnsSpace(keyEvent({}, [{ matches: () => true }, new PathElement(), null]))).toBe(true);
  });

  it('does not cancel or otherwise mutate the event while deciding ownership', () => {
    const preventDefault = vi.fn();
    const event = keyEvent({ preventDefault }, [new PathElement(true)]);
    expect(pageOwnsSpace(event)).toBe(false);
    expect(preventDefault).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it('preserves the existing one-step-per-keydown behavior for background key repeat', () => {
    expect(pageOwnsSpace(keyEvent({ repeat: true }, [new PathElement()]))).toBe(true);
  });
});
