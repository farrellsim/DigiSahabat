export const XP_PER_LEVEL = 100;

/**
 * Single source of truth for level + progress, derived from XP so the UI is
 * always internally consistent (avoids negative "to next level" math when a
 * stored `level` disagrees with the user's XP).
 */
export function levelProgress(xp: number) {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  const level = Math.floor(safeXp / XP_PER_LEVEL) + 1;
  const xpInLevel = safeXp % XP_PER_LEVEL;
  const xpNeeded = XP_PER_LEVEL;
  const pct = Math.round((xpInLevel / xpNeeded) * 100);
  return { level, xpInLevel, xpNeeded, pct, nextLevel: level + 1 };
}
