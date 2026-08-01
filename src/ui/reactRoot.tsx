import type { ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

const roots = new WeakMap<Element, Root>();

export function renderReactRoot(container: Element, children: ReactNode): void {
  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }
  root.render(children);
}

export function unmountReactRoot(container: Element): void {
  const root = roots.get(container);
  if (!root) return;

  root.unmount();
  roots.delete(container);
}
