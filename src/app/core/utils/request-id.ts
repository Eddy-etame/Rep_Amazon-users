export function generateRequestId(): string {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `req_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}
