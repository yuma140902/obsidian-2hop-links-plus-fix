import { setIcon } from "obsidian";
import { useCallback } from "react";

export function useObsidianIcon<T extends HTMLElement>(icon: string) {
  return useCallback(
    (element: T | null) => {
      if (element) setIcon(element, icon);
    },
    [icon],
  );
}
