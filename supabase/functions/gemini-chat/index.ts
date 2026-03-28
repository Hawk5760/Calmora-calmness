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
const MAX_MESSAGE_LENGTH = 5000;
const MAX_HISTORY_LENGTH = 50;
const MAX_MOOD_LENGTH = 100;

serve(async (req) => {
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

    const { message, mood, history } = await req.json();

    // Input validation
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return new Response(JSON.stringify({ error: 'Message too long' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate and sanitize mood
    const sanitizedMood = typeof mood === 'string' ? mood.slice(0, MAX_MOOD_LENGTH) : 'neutral';

    // Validate and limit history
    const sanitizedHistory = Array.isArray(history) 
      ? history.slice(0, MAX_HISTORY_LENGTH).map((msg: { role: string; content: string }) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: typeof msg.content === 'string' ? msg.content.slice(0, MAX_MESSAGE_LENGTH) : ''
        }))
      : [];

    // Adaptive system prompt based on message type
    const isGreeting = /^(hi|hello|hey|namaste|kaise ho|what's up|sup)/i.test(message.trim());
    const isShort = message.split(' ').length <= 5;
    const needsEmpathy = /sad|anxious|stressed|angry|hurt|worried|scared|lonely|depressed|failed|exam|didn't pass/i.test(message);
    
    let responseGuidance = "";
    if (isGreeting) {
      responseGuidance = "Reply with 1-2 warm Hinglish sentences. Be friendly, ask how they're feeling.";
    } else if (isShort && !needsEmpathy) {
      responseGuidance = "Keep reply brief: 2-3 sentences max. Match their energy.";
    } else if (needsEmpathy) {
      responseGuidance = "Be deeply empathetic first (2-3 sentences validating feelings), then offer 2 gentle activities. End with caring question. 60-80 words.";
    } else {
      responseGuidance = "Give thoughtful reply: 40-60 words. Include 1-2 helpful suggestions if relevant.";
    }
    
    const systemPrompt = `You are Calmora, a warm emotional support companion. Use natural Hinglish. User mood: ${sanitizedMood}. ${responseGuidance} Never be preachy or give long lectures.`;

    // Build conversation context
    const conversationHistory = sanitizedHistory;
    const conversationText = conversationHistory
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'Calmora'}: ${m.content}`)
      .join('\n');

    let generatedText: string | null = null;
    let providerUsed: 'gemini' | 'lovable' | 'fallback' = 'fallback';

    const fullPrompt = `${systemPrompt}\n\nCONVERSATION SO FAR:\n${conversationText}\n\nUser: ${message}\n\nCalmora:`;

    // Try direct Gemini first - using gemini-2.0-flash for speed
    if (geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullPrompt }] }],
              generationConfig: {
                maxOutputTokens: 400,
                temperature: 0.8,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
          if (generatedText) providerUsed = 'gemini';
        } else {
          console.error('AI API error:', response.status);
        }
      } catch (e) {
        console.error('AI fetch failed');
      }
    }

    // Fallback: Lovable AI Gateway
    if (!generatedText && lovableApiKey) {
      try {
        const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${lovableApiKey}` },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            temperature: 0.8,
            max_tokens: 400,
            messages: [
              { role: 'system', content: systemPrompt },
              ...conversationHistory,
              { role: 'user', content: message },
            ]
          })
        });
        if (aiResp.ok) {
          const g = await aiResp.json();
          generatedText = g?.choices?.[0]?.message?.content ?? null;
          if (generatedText) providerUsed = 'lovable';
        } else {
          console.error('AI gateway error:', aiResp.status);
        }
      } catch (e) {
        console.error('Lovable AI fallback failed');
      }
    }

    if (!generatedText) {
      generatedText = "Main yahan hoon tumhare saath. 💙 Kya chal raha hai aaj?";
      providerUsed = 'fallback';
    }

    console.log('Response provider:', providerUsed);
    console.log('Response length:', generatedText.length);


    return new Response(JSON.stringify({ response: generatedText, mood: sanitizedMood }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-chat function');
    return new Response(JSON.stringify({ 
      response: "Koi baat nahi, sometimes technology bhi thak jaati hai! Aap mujhe phir se bata sakte ho - main sun raha/rahi hoon. 🌸",
      fallback: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});