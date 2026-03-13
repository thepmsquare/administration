import * as React from "react";

/**
 * Holds the `checkServers` callback owned by Page.tsx.
 * Any descendant component can call `useServerCheck()` to get it and invoke it
 * after catching a network error, triggering an immediate server reachability
 * check without waiting for a polling interval.
 */
export const ServerCheckContext = React.createContext<() => void>(() => {});

export const useServerCheck = (): (() => void) =>
  React.useContext(ServerCheckContext);
