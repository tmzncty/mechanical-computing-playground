const SPACE_OWNERS = [
  'button', 'a[href]', 'area[href]', 'input', 'select', 'textarea', 'summary',
  'audio[controls]', 'video[controls]', '[tabindex]',
  // HTML's valid false keyword is ASCII-case-insensitive.
  '[contenteditable]:not([contenteditable="false" i])',
  ...[
    'button', 'link', 'checkbox', 'radio', 'switch', 'menuitem', 'menuitemcheckbox',
    'menuitemradio', 'option', 'tab', 'treeitem', 'slider', 'spinbutton', 'textbox',
    'searchbox', 'combobox', 'listbox', 'grid', 'tree', 'menu', 'menubar', 'radiogroup',
  ].map(role => `[role~="${role}"]`),
].join(',');

/** A page shortcut must not replace an interactive control's own Space action. */
export function pageOwnsSpace(event: KeyboardEvent): boolean {
  if (
    event.key !== ' ' || event.defaultPrevented || event.isComposing
    || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
  ) return false;

  // Inspect ancestors and the original path, including controls inside an open shadow root.
  // A non-editable child inside an editor still belongs to that editor's keyboard context.
  return !event.composedPath().some(target => target instanceof Element && target.matches(SPACE_OWNERS));
}
