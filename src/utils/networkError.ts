/**
 * Returns true when an error is caused by the network being unreachable or a
 * request timeout (AbortController), rather than a normal HTTP error from the
 * server (4xx / 5xx). Use this in catch blocks to decide whether to trigger a
 * server reachability check.
 *
 * Background: `fetchJSONData` (squarecommons) calls `fetch()` directly.
 * - Network unreachable → `fetch()` throws a `TypeError` ("Failed to fetch")
 * - AbortController timeout → `fetch()` throws a `DOMException` with name "AbortError"
 * - Normal HTTP error → `fetch()` resolves; error is re-thrown as `new Error(message)`,
 *   which is neither a TypeError nor a DOMException.
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof DOMException && error.name === "AbortError") return true;
  return false;
}
