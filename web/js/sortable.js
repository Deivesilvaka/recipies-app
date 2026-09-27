let counter = 0;

export function nextUid() {
  counter += 1;
  return `row-${Date.now()}-${counter}`;
}

/**
 * Attaches pointer-based (mouse + touch) drag-and-drop reordering to a list container.
 * Rows must have a `data-uid` attribute and a child with `[data-drag-handle]`.
 * Mutates `items` in place (via splice) once a drag ends, matching the new DOM order.
 *
 * @param {HTMLElement} container
 * @param {Array<any>} items
 * @param {(item: any) => string} getUid
 */
export function attachDragReorder(container, items, getUid) {
  let draggingEl = null;

  container.addEventListener('pointerdown', (event) => {
    const handle = event.target.closest('[data-drag-handle]');
    if (!handle) return;
    const row = event.target.closest('.list-row');
    if (!row) return;

    draggingEl = row;
    row.setPointerCapture(event.pointerId);
    row.classList.add('dragging');
    event.preventDefault();
  });

  // pointermove/pointerup/pointercancel are bound on window, not on `container`: once a pointer
  // is captured, some engines (and headless/automated drivers) retarget its release event to the
  // document root rather than to a descendant of the capturing element, so it would never bubble
  // into a container-scoped listener. window always sees it. This handler doesn't rely on
  // event.target anyway (elementFromPoint does the real hit-testing), so listening on window
  // rather than container changes nothing else about the logic.
  window.addEventListener('pointermove', (event) => {
    if (!draggingEl) return;

    const target = document.elementFromPoint(event.clientX, event.clientY);
    const overRow = target ? target.closest('.list-row') : null;
    if (!overRow || overRow === draggingEl || !container.contains(overRow)) return;

    const rect = overRow.getBoundingClientRect();
    const isAfter = event.clientY > rect.top + rect.height / 2;

    if (isAfter) {
      overRow.after(draggingEl);
    } else {
      overRow.before(draggingEl);
    }
  });

  function endDrag() {
    if (!draggingEl) return;
    draggingEl.classList.remove('dragging');
    draggingEl = null;

    const orderedUids = Array.from(container.querySelectorAll('.list-row')).map(
      (row) => row.dataset.uid,
    );
    const byUid = new Map(items.map((item) => [String(getUid(item)), item]));
    const reordered = orderedUids.map((uid) => byUid.get(uid)).filter(Boolean);
    items.splice(0, items.length, ...reordered);
  }

  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
}
