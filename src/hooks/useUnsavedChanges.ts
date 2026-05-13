import { useEffect, useCallback, useRef } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Warns the user before navigating away from a page with unsaved changes.
 * Uses both the browser `beforeunload` event (for tab close/refresh)
 * and React Router's `useBlocker` (for in-app navigation).
 */
export function useUnsavedChanges(isDirty: boolean) {
  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;

  // Browser tab close / refresh
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // React Router in-app navigation
  const blocker = useBlocker(
    useCallback(
      () => dirtyRef.current,
      [] // stable ref — no re-render dependency needed
    )
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      const ok = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );
      if (ok) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);
}
