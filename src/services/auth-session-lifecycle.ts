let sessionIsEnding = false;

export function markSessionAsEnding() {
  sessionIsEnding = true;
}

export function isSessionEnding() {
  return sessionIsEnding;
}
