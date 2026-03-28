/**
 * Crisis keyword detection for automatic SOS triggering.
 * Detects suicidal, self-harm, and severe distress language in English, Hinglish,
 * and common misspellings.
 */

const CRISIS_KEYWORDS = [
  // English - suicidal (including common misspellings)
  'kill myself', 'want to die', 'end my life', 'end it all', 'no reason to live',
  'better off dead', 'wish i was dead', 'wish i were dead',
  'suicide', 'suicidal', 'sucide', 'sucidal', 'suside', 'susidal', 'suicid',
  'take my own life', 'jump off', 'hang myself', 'slit my wrist', 'overdose',
  'not worth living', 'life is not worth', "can't go on", "can't take it anymore",
  'nobody would miss me', 'world without me', 'disappear forever', 'give up on life',
  'planning to end', 'goodbye forever', 'final goodbye', 'last goodbye',
  'no point in living', 'done with life', 'tired of living', 'wanna die',
  'want to end it', 'ending it tonight', 'ending it today',
  'i want to do suicide', 'i want to do sucide', 'want to commit suicide',
  'commit suicide', 'do suicide', 'do sucide',

  // Self-harm
  'cut myself', 'cutting myself', 'hurt myself', 'hurting myself', 'self harm',
  'self-harm', 'burn myself', 'punish myself', 'hate myself so much',

  // Severe distress
  'nobody loves me', 'nobody cares about me', 'completely alone', 'all alone',
  'no hope left', 'hopeless', 'worthless', 'i am a burden', 'burden to everyone',

  // Hinglish / Hindi transliteration
  'mar jana chahta', 'mar jana chahti', 'marna chahta', 'marna chahti',
  'zindagi khatam', 'jeene ka mann nahi', 'jeena nahi chahta', 'jeena nahi chahti',
  'suicide karna', 'sucide karna', 'khudkhushi', 'khud ko maar', 'khud ko khatam',
  'koi fayda nahi', 'sab khatam', 'maut chahiye', 'mar jaunga', 'mar jaungi',
  'kisi ko fark nahi padta', 'koi mujhe nahi chahta', 'akela hu', 'akeli hu',
  'zindagi se haar', 'thak gaya hu', 'thak gayi hu', 'jee nahi lagta',
  'sab chhod dena chahta', 'duniya chhod', 'khatam karna chahta',
  'khud ko hurt', 'apne aap ko maar', 'hath kaat', 'nass kaat',
  'mujhe marna hai', 'main mar jaunga', 'main mar jaungi',
  'life khatam', 'sab khatam kar dunga', 'sab khatam kar dungi',
];

// Quick single-word triggers (checked separately)
const CRISIS_SINGLE_WORDS = [
  'suicide', 'suicidal', 'sucide', 'sucidal', 'suside', 'khudkhushi',
];

/**
 * Check if text contains crisis/suicidal language.
 * Returns true if crisis keywords are detected.
 */
export const detectCrisis = (text: string): boolean => {
  if (!text || text.trim().length < 3) return false;
  const lower = text.toLowerCase().trim();

  // Check single-word triggers
  for (const word of CRISIS_SINGLE_WORDS) {
    if (lower.includes(word)) return true;
  }

  // Check phrase triggers
  for (const phrase of CRISIS_KEYWORDS) {
    if (lower.includes(phrase)) return true;
  }

  return false;
};
