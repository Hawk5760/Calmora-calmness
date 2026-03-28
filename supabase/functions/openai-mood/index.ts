import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openaiKey = Deno.env.get("OPENAI_API_KEY");

// Input validation constants
const MAX_TEXT_LENGTH = 5000;
const MAX_CONTEXT_LENGTH = 500;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
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

    if (!openaiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const { text, context } = await req.json();
    
    // Input validation
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Invalid 'text' provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return new Response(JSON.stringify({ error: "Text too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize inputs
    const sanitizedText = text.slice(0, MAX_TEXT_LENGTH);
    const sanitizedContext = typeof context === 'string' 
      ? context.slice(0, MAX_CONTEXT_LENGTH) 
      : 'General mood check';

    const systemPrompt = `You are an expert mood detection system for a mindfulness app called Calmora. Analyze the user's text and return STRICT JSON only.

Categories: happy, sad, angry, calm, anxious, excited, frustrated, peaceful, overwhelmed, grateful, lonely, confident, stressed, content, hopeful, disappointed, energetic, tired, worried, joyful

Return only valid JSON with this exact shape and keys in this order:
{
  "mood": "one_of_categories",
  "confidence": 0,
  "descriptors": ["word1", "word2", "word3"],
  "supportive_message": "1-2 sentences",
  "secondary_emotions": ["emotion1", "emotion2"]
}

Rules:
- Output JSON only, no markdown, no extra text
- confidence is an integer 0-100
- descriptors are concise emotional adjectives
- supportive_message is warm, concise, and practical`;

    const userPrompt = `Text: "${sanitizedText}"
Context: ${sanitizedContext}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-2025-08-07",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    let moodData: any;
    try {
      // Extract JSON block
      const match = content.match(/\{[\s\S]*\}/);
      moodData = match ? JSON.parse(match[0]) : JSON.parse(content);
    } catch (_e) {
      // Fallback minimal response
      moodData = {
        mood: "calm",
        confidence: 50,
        descriptors: ["neutral", "unclear"],
        supportive_message: "I'm here with you. Share more if you'd like.",
        secondary_emotions: ["thoughtful"],
        fallback: true,
      };
    }

    return new Response(JSON.stringify(moodData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in openai-mood function:", error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message,
        fallback: true,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
