import { useEffect } from "react";

export interface KeyboardShortcutHandlers {
  onRefresh: () => void;
  onSwap: () => void;
  onFocusAmount: () => void;
}

function isFormField(element: EventTarget | null): boolean {
  if (!(element instanceof HTMLElement)) return false;
  const tag = element.tagName.toLowerCase();
  return tag === "input" || tag === "select" || tag === "textarea" || element.isContentEditable;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const { onRefresh, onSwap, onFocusAmount } = handlers;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isFormField(event.target)) return;

      const key = event.key.toLowerCase();

      if (key === "r") {
        event.preventDefault();
        onRefresh();
      } else if (key === "s") {
        event.preventDefault();
        onSwap();
      } else if (key === "/") {
        event.preventDefault();
        onFocusAmount();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRefresh, onSwap, onFocusAmount]);
}
