import { useEffect } from "react";

let UNSAFE_IS_SAVING: boolean;

/**
 * Prevent browser tab from closing by displaying browser's alert box.
 */
function preventUnload(event: BeforeUnloadEvent) {
  if (UNSAFE_IS_SAVING) {
    const confirmation = `
      There are unsaved changes to your work. Before leaving, make sure you're
      online, and you've clicked the Cloud Save button.
    `;

    event.returnValue = confirmation;
    return confirmation;
  }
  return undefined;
}

/** Hook to prevent the browser tab from closing if there is an ongoing save. */
export function useSaveProtection(isSaving: boolean) {
  // Global reference
  // isSaving will be changing a lot, and redefining a callback based on that
  // value would not be ideal.
  UNSAFE_IS_SAVING = isSaving;

  // Attach handler to watch for tab closes
  useEffect(() => {
    window.addEventListener("beforeunload", preventUnload);
    return () => window.removeEventListener("beforeunload", preventUnload);
  }, []);
}
