import assert from 'node:assert/strict';

// Only an actual HTTP authentication/authorization response proves this boundary.
// JSON-RPC errors, unavailable endpoints and server failures are not auth evidence.
export function assertAuthorizationDenied(result, expectedStatus) {
  assert([401,403].includes(expectedStatus),'Expected denial must be HTTP 401 or 403');
  assert.equal(result?.httpStatus,expectedStatus,`Expected HTTP ${expectedStatus} authorization denial; got ${result?.httpStatus ?? 'no HTTP denial'}`);
}
