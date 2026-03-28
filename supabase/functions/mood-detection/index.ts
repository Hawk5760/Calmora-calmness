import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_TEXT_LENGTH = 5000;
const MAX_CONTEXT_LENGTH = 500;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user - decode JWT token directly
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Decode JWT to get user ID (the token is already validated by Supabase)
    let userId: string | null = null;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        userId = payload.sub;
      }
    } catch (e) {
      console.error('Failed to decode JWT');
    }

    if (!userId) {
      console.error('No user ID in token');
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Authenticated user:', userId);

    const { text, context } = await req.json();

    // Input validation
    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return new Response(JSON.stringify({ error: 'Text too long' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Sanitize context
    const sanitizedContext = typeof context === 'string' 
      ? context.slice(0, MAX_CONTEXT_LENGTH) 
      : 'General mood check';

// Create a concise mood detection prompt for fast response
const moodPrompt = `Detect mood from: "${text}"
Return: mood (happy/sad/angry/calm/anxious/excited/frustrated/peaceful/overwhelmed/grateful/stressed), confidence (0-100), descriptors (2 words), supportive_message (1 Hinglish sentence), secondary_emotions (1-2), song_suggestions (3 songs with title, artist, genre, youtubeUrl).`;

    let moodData: any = null;

    // 1) Try Gemini directly if key present - using gemini-2.0-flash for speed
    if (geminiApiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: moodPrompt }] }],
            generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 300 }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          try {
            if (typeof textOut === 'string') moodData = JSON.parse(textOut);
          } catch {}
        } else {
          console.error('AI API error:', response.status);
        }
      } catch (e) {
        console.error('AI fetch failed');
      }
    }

    // 2) Fallback to Lovable AI Gateway if needed
    if (!moodData && lovableApiKey) {
      try {
        const body: any = {
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'Concise mood detector. Use the tool.' },
            { role: 'user', content: moodPrompt },
          ],
          tools: [
            {
              type: 'function',
              function: {
                name: 'mood_detection',
                description: 'Return mood detection results with song recommendations',
                parameters: {
                  type: 'object',
                  properties: {
                    mood: { type: 'string' },
                    confidence: { type: 'number' },
                    descriptors: { type: 'array', items: { type: 'string' } },
                    supportive_message: { type: 'string' },
                    secondary_emotions: { type: 'array', items: { type: 'string' } },
                    song_suggestions: { 
                      type: 'array', 
                      items: { 
                        type: 'object', 
                        properties: {
                          title: { type: 'string' },
                          artist: { type: 'string' },
                          genre: { type: 'string' },
                          youtubeUrl: { type: 'string' }
                        },
                        required: ['title', 'artist', 'genre', 'youtubeUrl']
                      } 
                    }
                  },
                  required: ['mood', 'confidence', 'descriptors', 'supportive_message', 'secondary_emotions', 'song_suggestions'],
                  additionalProperties: false
                }
              }
            }
          ],
          tool_choice: { type: 'function', function: { name: 'mood_detection' } },
        };

        const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${lovableApiKey}` },
          body: JSON.stringify(body),
        });

        if (aiResp.ok) {
          const data = await aiResp.json();
          const argsStr = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
          const parsed = typeof argsStr === 'string' ? JSON.parse(argsStr) : argsStr;
          if (parsed) moodData = parsed;
        } else {
          console.error('AI gateway error:', aiResp.status);
        }
      } catch (e) {
        console.error('Lovable AI fallback failed');
      }
    }

    // 3) Last resort heuristic fallback
    if (!moodData) {
      moodData = detectMoodFallback(text);
    }

    return new Response(JSON.stringify(moodData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error in mood-detection function');
    
    // Fallback mood detection without re-reading body
    const fallbackMood = detectMoodFallback("");
    
    return new Response(JSON.stringify({ 
      ...fallbackMood,
      fallback: true
    }), {
      status: 200, // Return 200 with fallback instead of error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fallback mood detection function
function detectMoodFallback(text: string) {
  const lowerText = text.toLowerCase();
  
  const moodKeywords = {
    happy: ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'good', 'smile', 'laugh'],
    sad: ['sad', 'down', 'depressed', 'unhappy', 'disappointed', 'cry', 'tears', 'hurt', 'pain', 'loss'],
    angry: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated', 'rage', 'hate', 'upset'],
    anxious: ['anxious', 'worried', 'nervous', 'stress', 'panic', 'fear', 'scared', 'overwhelmed'],
    calm: ['calm', 'peaceful', 'relaxed', 'serene', 'quiet', 'still', 'tranquil', 'zen'],
    excited: ['excited', 'thrilled', 'pumped', 'energetic', 'enthusiastic', 'eager'],
    grateful: ['grateful', 'thankful', 'blessed', 'appreciate', 'lucky', 'fortunate']
  };
  
  let bestMatch = { mood: 'calm', score: 0 };
  
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (lowerText.includes(keyword) ? 1 : 0);
    }, 0);
    
    if (score > bestMatch.score) {
      bestMatch = { mood, score };
    }
  }
  
  // Fallback songs based on detected mood
  const fallbackSongs = getFallbackSongs(bestMatch.mood);
  
  return {
    mood: bestMatch.mood,
    confidence: Math.min(bestMatch.score * 20 + 40, 90),
    descriptors: [bestMatch.mood, "detected"],
    supportive_message: "Main yahan hoon tumhare saath. Jo bhi feel ho raha hai, sab theek hoga. 💙",
    secondary_emotions: [bestMatch.mood],
    song_suggestions: fallbackSongs
  };
}

// Fallback songs for when AI is unavailable
function getFallbackSongs(mood: string) {
  const calmingSongs = [
    { title: "Tum Hi Ho", artist: "Arijit Singh", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Tum+Hi+Ho+Arijit+Singh" },
    { title: "Agar Tum Saath Ho", artist: "Arijit Singh & Alka Yagnik", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Agar+Tum+Saath+Ho" },
    { title: "Perfect", artist: "Ed Sheeran", genre: "Pop", youtubeUrl: "https://www.youtube.com/results?search_query=Ed+Sheeran+Perfect" },
  ];
  
  const upliftingSongs = [
    { title: "Kar Har Maidaan Fateh", artist: "Sukhwinder Singh", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Kar+Har+Maidaan+Fateh" },
    { title: "Zinda", artist: "Siddharth Mahadevan", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Zinda+Bhaag+Milkha+Bhaag" },
    { title: "Happy", artist: "Pharrell Williams", genre: "Pop", youtubeUrl: "https://www.youtube.com/results?search_query=Pharrell+Williams+Happy" },
  ];
  
  const happySongs = [
    { title: "Badtameez Dil", artist: "Benny Dayal", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Badtameez+Dil" },
    { title: "London Thumakda", artist: "Labh Janjua & Sonu Kakkar", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=London+Thumakda" },
    { title: "Uptown Funk", artist: "Bruno Mars", genre: "Pop", youtubeUrl: "https://www.youtube.com/results?search_query=Uptown+Funk+Bruno+Mars" },
  ];
  
  const devotionalSongs = [
    { title: "Gayatri Mantra", artist: "Various Artists", genre: "Devotional", youtubeUrl: "https://www.youtube.com/results?search_query=Gayatri+Mantra+peaceful" },
    { title: "Om Jai Jagdish Hare", artist: "Various Artists", genre: "Devotional", youtubeUrl: "https://www.youtube.com/results?search_query=Om+Jai+Jagdish+Hare" },
  ];
  
  if (mood === 'sad' || mood === 'angry' || mood === 'anxious' || mood === 'stressed' || mood === 'overwhelmed') {
    return [...calmingSongs, ...upliftingSongs];
  } else if (mood === 'happy' || mood === 'excited' || mood === 'joyful' || mood === 'grateful') {
    return [...happySongs, ...upliftingSongs.slice(0, 1)];
  } else if (mood === 'calm' || mood === 'peaceful' || mood === 'content') {
    return [...devotionalSongs, ...calmingSongs];
  } else {
    return [...calmingSongs.slice(0, 2), ...upliftingSongs.slice(0, 2), ...happySongs.slice(0, 2)];
  }
}
