/**
 * Randomly determine if a card is reversed.
 * @returns true if reversed, false if upright
 */
export function determineOrientation(): boolean {
  return Math.random() < 0.5;
}
