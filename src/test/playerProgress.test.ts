import { describe, it, expect } from "vitest";
import { getXpForLevel, getLevelTitle, getLevelEmoji, getStreakMultiplier } from "@/hooks/usePlayerProgress";

describe("Player Progress Logic", () => {
  it("calculates XP for level correctly", () => {
    expect(getXpForLevel(1)).toBe(120);
    expect(getXpForLevel(5)).toBe(280);
    expect(getXpForLevel(10)).toBe(480);
  });

  it("returns correct level titles", () => {
    expect(getLevelTitle(1)).toBe("Seedling");
    expect(getLevelTitle(4)).toBe("Bloom");
    expect(getLevelTitle(7)).toBe("Tree");
    expect(getLevelTitle(16)).toBe("Forest");
    expect(getLevelTitle(25)).toBe("Sage");
  });

  it("returns correct level emojis", () => {
    expect(getLevelEmoji(1)).toBe("🫒");
    expect(getLevelEmoji(2)).toBe("🌱");
    expect(getLevelEmoji(7)).toBe("🌴");
    expect(getLevelEmoji(21)).toBe("🧙");
  });

  it("calculates streak multiplier correctly", () => {
    expect(getStreakMultiplier(0)).toBe(1);
    expect(getStreakMultiplier(3)).toBe(1.5);
    expect(getStreakMultiplier(7)).toBe(2);
    expect(getStreakMultiplier(14)).toBe(2.5);
    expect(getStreakMultiplier(30)).toBe(3);
  });
});
