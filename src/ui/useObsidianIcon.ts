import { setIcon } from "obsidian";
import { useCallback } from "react";

export function useObsidianIcon<T extends HTMLElement>(icon: string) {
  return useCallback(
    (element: T | null) => {
      if (!element) return;

      setIcon(element, icon);
      return () => element.empty();
    },
    [icon],
  );
}
