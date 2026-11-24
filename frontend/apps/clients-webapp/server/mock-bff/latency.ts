/** Small artificial delay so loading states are visible in DEV. */
export function simulateLatency(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
