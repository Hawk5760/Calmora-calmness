import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_ANSWER_LENGTH = 2000;
const MAX_ARRAY_LENGTH = 20;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error');
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Authenticated user:', user.id);

    const { answers } = await req.json();

    // Input validation
    if (!answers || typeof answers !== 'object') {
      return new Response(JSON.stringify({ error: 'Answers are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Sanitize answers
    const sanitizeValue = (value: string | string[]): string => {
      if (Array.isArray(value)) {
        return value.slice(0, MAX_ARRAY_LENGTH)
          .map(v => typeof v === 'string' ? v.slice(0, MAX_ANSWER_LENGTH) : '')
          .filter(v => v)
          .join(', ') || 'Not specified';
      }
      return typeof value === 'string' ? value.slice(0, MAX_ANSWER_LENGTH) : 'Not specified';
    };

    const sanitizedAnswers = {
      symptoms: sanitizeValue(answers.symptoms),
      duration: sanitizeValue(answers.duration),
      impact: sanitizeValue(answers.impact),
      triggers: sanitizeValue(answers.triggers),
    };

    console.log('Received answers for emotional screening');

    if (!geminiApiKey) {
      console.error('AI API key not configured');
      // Return fallback response instead of exposing configuration status
      return new Response(JSON.stringify(getFallbackResult()), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // India-focused, non-diagnostic prompt
    const prompt = `You are a compassionate emotional wellness AI for an Indian mental health app. Analyze the user's responses and provide a supportive EMOTIONAL RISK SCREENING (not a diagnosis).

CRITICAL GUIDELINES:
- This is NOT a medical diagnosis - clearly state this
- Use Indian-friendly, stigma-free language
- Use phrases like "may be experiencing", "commonly associated with", "patterns suggest"
- Focus on emotional wellness, not clinical conditions
- Be warm and culturally sensitive to Indian context
- Use some Hinglish phrases naturally

USER RESPONSES:
1. Feelings/Experiences: ${sanitizedAnswers.symptoms}
2. Duration: ${sanitizedAnswers.duration}
3. Impact on Daily Life: ${sanitizedAnswers.impact}
4. Triggers: ${sanitizedAnswers.triggers}

Provide an emotional wellness assessment in this JSON format:
{
  "primaryConcern": "The main emotional pattern identified (use gentle terms like 'Emotional Overwhelm', 'Stress Patterns', 'Low Energy Periods', 'Worry Tendencies', 'Sleep Disruption', 'Emotional Fatigue' - NOT clinical labels)",
  "concernDescription": "A warm, Indian-friendly description using phrases like 'aapko shayad...', 'commonly associated patterns show...'. Avoid clinical language.",
  "screeningNote": "Moderate/Mild/Notable - this indicates pattern strength, NOT severity of illness",
  "relatedPatterns": ["2-3 other emotional patterns to explore, using gentle Indian-friendly terms"],
  "compassionateMessage": "A warm Hinglish message like 'Aap akele nahi ho. Yeh feelings valid hain. Madad lena strength ki nishani hai.' Be culturally sensitive.",
  "wellnessSuggestions": ["4-5 practical, India-friendly suggestions like 'chai break with deep breathing', 'short evening walk', 'talk to trusted friend/family', 'journaling in your language', 'consider speaking with a professional if feelings persist'"],
  "disclaimer": "Yeh ek emotional wellness screening hai, medical diagnosis nahi. Professional support ke liye qualified mental health expert se baat karein."
}

IMPORTANT: Return ONLY valid JSON. No additional text.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          maxOutputTokens: 1024,
          temperature: 0.7
        }
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return new Response(JSON.stringify(getFallbackResult()), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      return new Response(JSON.stringify(getFallbackResult()), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify(getFallbackResult()), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Map to expected frontend fields
    const mappedResult = {
      primaryCondition: result.primaryConcern,
      conditionDescription: result.concernDescription,
      confidence: result.screeningNote,
      otherConditions: result.relatedPatterns,
      compassionateMessage: result.compassionateMessage,
      supportSuggestions: result.wellnessSuggestions,
      disclaimer: result.disclaimer
    };

    console.log('Screening result generated');

    return new Response(JSON.stringify(mappedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-support-diagnosis');
    
    return new Response(JSON.stringify(getFallbackResult()), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getFallbackResult() {
  return {
    primaryCondition: "Emotional Overwhelm",
    conditionDescription: "Aapke responses se lagta hai ki aap thoda emotional pressure mehsoos kar rahe hain. Yeh bahut common hai aur iska matlab yeh nahi ki kuch galat hai aapke saath.",
    confidence: "Moderate Pattern",
    otherConditions: ["Stress Patterns", "Energy Fluctuations", "Sleep Disruption"],
    compassionateMessage: "Aap yahan tak aaye - yeh himmat ki nishani hai. Apni feelings ko samajhna pehla kadam hai. Aap akele nahi ho, aur madad lena strength hai, kamzori nahi. 💙",
    supportSuggestions: [
      "Rozana 5 minute deep breathing practice karein",
      "Kisi trusted person se baat karein - family ya friend",
      "Regular sleep schedule maintain karein",
      "Light physical activity jaise walking try karein",
      "Agar feelings persist karein, professional counselor se baat karein"
    ],
    disclaimer: "Yeh ek emotional wellness screening hai, medical diagnosis nahi. Professional support ke liye qualified mental health expert se baat karein."
  };
}
