import { useEffect, useRef } from "react";

/**
 * Warns the user before navigating away from a page with unsaved changes.
 * Uses the browser `beforeunload` event for tab close/refresh.
 *
 * Note: React Router's `useBlocker` requires a data router (createBrowserRouter),
 * which this app does not use. We rely on `beforeunload` only.
 */
export function useUnsavedChanges(isDirty: boolean) {
  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);
}
