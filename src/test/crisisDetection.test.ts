import { describe, it, expect } from 'vitest';
import { detectCrisis } from '@/utils/crisisDetection';

describe('crisisDetection', () => {
  it('detects "suicide" keyword', () => {
    expect(detectCrisis('suicide')).toBe(true);
  });

  it('detects common misspelling "sucide"', () => {
    expect(detectCrisis('i want to do sucide')).toBe(true);
  });

  it('detects "suicidal"', () => {
    expect(detectCrisis('I feel suicidal')).toBe(true);
  });

  it('detects Hinglish phrases', () => {
    expect(detectCrisis('mujhe marna hai')).toBe(true);
    expect(detectCrisis('khudkhushi karna chahta hu')).toBe(true);
    expect(detectCrisis('zindagi khatam kar dunga')).toBe(true);
  });

  it('detects self-harm phrases', () => {
    expect(detectCrisis('I want to cut myself')).toBe(true);
    expect(detectCrisis('i want to hurt myself')).toBe(true);
  });

  it('does NOT trigger on safe text', () => {
    expect(detectCrisis('I am feeling happy today')).toBe(false);
    expect(detectCrisis('the weather is nice')).toBe(false);
    expect(detectCrisis('I love coding')).toBe(false);
  });

  it('does NOT trigger on very short input', () => {
    expect(detectCrisis('hi')).toBe(false);
    expect(detectCrisis('')).toBe(false);
  });

  it('detects "kill myself"', () => {
    expect(detectCrisis('i want to kill myself')).toBe(true);
  });

  it('detects "want to die"', () => {
    expect(detectCrisis('i just want to die')).toBe(true);
  });
});
