/**
 * Calculates how many bonuses a customer has available to claim.
 * Per AC-5.3: bonuses stacked = floor(accumulated paid omzet / threshold) − bonuses already granted
 */
export function calcBonusAvailable(
  accumulatedOmzet: number,
  threshold: number,
  alreadyGranted: number
): number {
  if (threshold <= 0) return 0; // Prevent division by zero or negative thresholds

  const safeOmzet = Math.max(0, accumulatedOmzet);
  const earned = Math.floor(safeOmzet / threshold);

  // Return the remaining available bonuses (ensure it doesn't go below 0)
  return Math.max(0, earned - alreadyGranted);
}
