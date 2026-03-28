const moodPatterns: Record<string, { positive: string[]; phrases: string[] }> = {
  happy: {
    positive: ['happy', 'peaceful', 'joyful', 'excited', 'truly content', 'carefree', 'cheerful', 'relaxed', 'smiling from within', 'heart full', 'feeling blessed', 'chilled out', 'thankful', 'grateful', 'fulfilled', 'in love with life', 'warm inside', 'celebrating something', 'family love', 'light-hearted', 'calm and content', 'soulful', 'energetic', 'inspired', 'positive', 'faithful', 'peace in the heart', 'proud of self', 'motivated', 'festival feeling', 'romantic', 'flirty fun', 'adventurous', 'colorful inside', 'full of hope', 'enjoying company', 'bubbly', 'singing mood', 'playful', 'connected', 'feeling loved', 'achieved something', 'overflowing with love', 'sweetly emotional', 'spiritually light', 'mentally clear', 'inner glow', 'lively', 'in the moment', 'smile-worthy', 'joy', 'amazing', 'great', 'wonderful', 'fantastic', 'awesome', 'good', 'delighted', 'thrilled', 'ecstatic', 'elated', 'blissful', 'euphoric', 'overjoyed', 'upbeat', 'bright', 'sunny', 'radiant', 'beaming'],
    phrases: ['feeling great', 'having a blast', 'so happy', 'really good', 'amazing day', 'perfect day', 'love life', 'everything is good', 'going well', 'best feeling', 'so excited', "can't stop smiling", 'heart full', 'feeling blessed', 'in love with life', 'overflowing with love', 'achieved something']
  },
  sad: {
    positive: ['sad', 'low', 'tired emotionally', 'feeling left out', 'lonely', 'quietly hurting', 'downhearted', 'mentally drained', 'dull inside', 'feeling empty', 'missing someone', 'broken inside', 'helpless', 'disappointed', 'regretful', 'guilty', 'mentally weak', 'crying silently', 'numb feeling', 'quiet sadness', 'mentally foggy', 'isolated', 'shy and withdrawn', 'homesick', 'ashamed', 'disconnected', 'overthinking', 'silent tears', 'grieving', 'emotionally cold', 'unseen', 'missing home', 'hurt by someone', 'feel like quitting', 'rejected', 'let down', 'tired of life', 'feel like a burden', 'not enough', 'unheard', 'emotionally tired', 'alone in a crowd', 'burnt out', 'quiet inside', 'closed off', 'empty-hearted', 'feeling ignored', 'emotionally distant', 'wanting peace', 'no motivation', 'depressed', 'down', 'blue', 'upset', 'crying', 'tears', 'heartbroken', 'miserable', 'gloomy', 'devastated', 'crushed', 'broken', 'empty', 'hollow', 'hopeless', 'despair', 'grief', 'sorrow', 'melancholy', 'abandoned', 'hurt', 'pain', 'ache', 'heavy heart', 'dark', 'darkness', 'failed', 'fail', 'failure', 'failing', 'flunked', 'bombed', 'screwed up', 'messed up', 'ruined', 'disaster', 'terrible', 'awful', 'horrible', 'worst', 'disappointing', 'defeated', 'lost', 'losing', 'loser', 'worthless', 'useless', 'stupid', 'idiot', 'shame', 'embarrassed', 'humiliated', 'pathetic', 'regret', 'sorry'],
    phrases: ['feeling down', 'really sad', 'want to cry', 'breaking down', "can't stop crying", 'feel empty', 'everything sucks', 'nothing matters', 'lost hope', 'feel alone', 'nobody cares', 'giving up', 'failed the exam', 'failed my test', "didn't pass", 'got rejected', 'screwed everything up', 'feel like a failure', 'let everyone down', 'so disappointed', 'such a disaster', 'everything went wrong', 'feel terrible', 'feel awful', 'worst day ever', 'hate myself', 'so embarrassed', 'feel stupid', 'tired emotionally', 'feeling left out', 'quietly hurting', 'mentally drained', 'feeling empty', 'missing someone', 'broken inside', 'crying silently', 'feel like quitting', 'feel like a burden']
  },
  angry: {
    positive: ['angry', 'irritated', 'frustrated', 'tense', 'short-tempered', 'mentally overloaded', 'burnt out', 'snappy', 'mood swings', 'on edge', 'tired of explaining', 'disrespected', 'lost patience', 'pushed too far', 'dominated', 'want to shout', 'misunderstood', 'feeling insulted', 'boiling inside', 'exhausted and angry', 'judged', 'annoyed by people', 'criticized', 'resentful', 'jealous', 'hurt but angry', 'holding a grudge', 'emotionally blocked', "can't express", 'rage inside', 'controlled anger', 'want to be left alone', 'passive-aggressive', 'blaming others', 'confused + angry', 'fed up', 'want to fight', 'backstabbed', 'family pressure', 'relationship stress', 'feeling trapped', 'disappointed in self', 'broken trust', 'revengeful', 'heavy heart + anger', 'taken for granted', 'shouting mood', 'emotionally unstable', 'criticism hurt me', 'head bursting', 'mad', 'furious', 'rage', 'pissed', 'livid', 'hate', 'disgusted', 'outraged', 'enraged', 'irate', 'seething', 'boiling', 'fuming', 'bitter', 'hostile', 'aggressive', 'sick of', 'done with', "can't stand", 'drives me crazy', 'makes me mad', 'infuriating'],
    phrases: ['so angry', 'really mad', 'pissed off', 'fed up', 'had enough', 'driving me crazy', "can't take it", 'makes me furious', 'want to scream', 'losing my mind', 'done with this', 'tired of explaining', 'lost patience', 'pushed too far', 'want to shout', 'boiling inside', 'annoyed by people', 'want to be left alone', 'want to fight', 'taken for granted', 'head bursting', 'emotionally unstable']
  },
  calm: {
    positive: ['calm', 'peaceful', 'emotionally still', 'mindful', 'just observing', 'reflective', 'blank', 'detached', 'balanced', 'mentally quiet', 'grounded', 'silent', 'in thought', 'resting mode', 'spiritually centered', 'not feeling much', 'bored but fine', 'still like a lake', 'watching life', 'no strong emotion', 'settled', 'deep in thought', 'plain mood', 'low-key', 'feeling nothing', 'meh mood', 'accepting what is', 'inward focused', 'quietly existing', 'emotionally tired but stable', 'peacefully alone', 'thoughtful', 'daydreaming', 'calm yet alert', 'spacey', 'breathing slow', 'just being', 'easy-going', 'steady mind', 'no expectations', 'internal peace', 'inner silence', 'mild emotions', 'light-hearted neutrality', 'taking a break', 'relaxed body', 'safe and okay', 'mentally coasting', 'simply present', 'relaxed', 'serene', 'tranquil', 'zen', 'content', 'mellow', 'centered', 'still', 'quiet', 'gentle', 'soft', 'smooth', 'easy', 'stable', 'composed', 'collected'],
    phrases: ['feeling calm', 'at peace', 'really relaxed', 'everything is okay', 'feeling balanced', 'in a good place', 'taking it easy', 'going with flow', 'feeling centered', 'inner peace', 'emotionally still', 'just observing', 'mentally quiet', 'resting mode', 'spiritually centered', 'still like a lake', 'accepting what is', 'quietly existing', 'peacefully alone', 'just being', 'simply present']
  },
  motivated: {
    positive: ['motivated', 'determined', 'focused', 'driven', 'ambitious', 'energetic', 'pumped', 'ready', 'confident', 'inspired', 'empowered', 'strong', 'capable', 'unstoppable', 'fierce', 'bold', 'brave', 'courageous'],
    phrases: ["let's do this", 'ready to go', 'feeling strong', 'can do anything', 'bring it on', 'no stopping me', 'full of energy', 'ready for challenge', 'feeling powerful', 'going to succeed']
  }
};

const negationWords = ['not', 'never', 'no', "don't", "can't", "won't", "isn't", "aren't", "wasn't", "weren't", "haven't", "hasn't", "hadn't"];

export const analyzeContext = (text: string): string | null => {
  const contexts = {
    work: ['work', 'job', 'boss', 'colleague', 'office', 'meeting', 'deadline', 'project', 'career'],
    relationship: ['boyfriend', 'girlfriend', 'husband', 'wife', 'partner', 'relationship', 'love', 'breakup', 'dating'],
    family: ['family', 'mom', 'dad', 'mother', 'father', 'parents', 'siblings', 'kids', 'children'],
    health: ['sick', 'illness', 'doctor', 'hospital', 'pain', 'hurt', 'injury', 'medicine', 'therapy'],
    achievement: ['passed', 'won', 'succeeded', 'achieved', 'graduated', 'promoted', 'accomplished', 'victory'],
    loss: ['died', 'death', 'funeral', 'lost', 'goodbye', 'miss', 'gone', 'passed away'],
    academic: ['exam', 'test', 'quiz', 'assignment', 'homework', 'school', 'college', 'university', 'grade', 'marks', 'score', 'result', 'semester', 'class', 'course', 'study', 'studying'],
    failure: ['failed', 'fail', 'failure', 'flunked', 'bombed', 'rejected', 'denied', "didn't get", 'lost', 'unsuccessful']
  };
  if ((contexts.academic.some(w => text.includes(w)) && contexts.failure.some(w => text.includes(w))) || text.includes('failed exam') || text.includes('failed test') || text.includes("didn't pass")) return 'sad';
  if (contexts.loss.some(w => text.includes(w))) return 'sad';
  if (contexts.achievement.some(w => text.includes(w))) return 'happy';
  if (contexts.work.some(w => text.includes(w)) && (text.includes('stress') || text.includes('pressure') || text.includes('deadline'))) return 'anxious';
  if (contexts.academic.some(w => text.includes(w)) && (text.includes('stress') || text.includes('pressure') || text.includes('worried') || text.includes('nervous'))) return 'anxious';
  return null;
};

export const detectMood = (text: string): string => {
  const lowerText = text.toLowerCase();
  const hasNegation = negationWords.some(neg => lowerText.includes(neg));
  const moodScores: Record<string, number> = {};

  Object.entries(moodPatterns).forEach(([mood, patterns]) => {
    let score = 0;
    patterns.positive.forEach(keyword => { if (lowerText.includes(keyword)) score += 1; });
    patterns.phrases.forEach(phrase => { if (lowerText.includes(phrase)) score += 3; });
    if (hasNegation && score > 0) {
      patterns.positive.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          negationWords.forEach(neg => {
            const keywordIndex = lowerText.indexOf(keyword);
            const negIndex = lowerText.indexOf(neg);
            if (Math.abs(keywordIndex - negIndex) < 15) score -= 2;
          });
        }
      });
    }
    moodScores[mood] = Math.max(0, score);
  });

  const contextAnalysis = analyzeContext(lowerText);
  if (contextAnalysis) moodScores[contextAnalysis] = (moodScores[contextAnalysis] || 0) + 2;

  const sortedMoods = Object.entries(moodScores).sort((a, b) => b[1] - a[1]);
  return sortedMoods[0][1] > 0 ? sortedMoods[0][0] : 'calm';
};
