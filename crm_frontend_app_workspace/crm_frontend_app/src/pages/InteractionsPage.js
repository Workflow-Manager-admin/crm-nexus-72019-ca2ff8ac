import React from "react";
import InteractionLog from "./InteractionLog";

// PUBLIC_INTERFACE
/**
 * InteractionsPage delegates to the modular <InteractionLog /> UI.
 * This ensures all timeline/list and add interaction controls are encapsulated and reusable.
 */
export default function InteractionsPage(props) {
  return (
    <section>
      <h2 style={{ marginBottom: 8 }}>Interactions Log</h2>
      <InteractionLog {...props} />
    </section>
  );
}
