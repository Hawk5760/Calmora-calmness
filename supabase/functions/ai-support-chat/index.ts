import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_MESSAGE_LENGTH = 5000;
const MAX_CONDITION_LENGTH = 200;
const MAX_HISTORY_LENGTH = 50;

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

    const { message, condition, history } = await req.json();

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

    // Validate and sanitize condition
    const sanitizedCondition = typeof condition === 'string' 
      ? condition.slice(0, MAX_CONDITION_LENGTH) 
      : 'general wellness';

    // Validate and limit history
    const sanitizedHistory = Array.isArray(history) 
      ? history.slice(0, MAX_HISTORY_LENGTH).map((msg: { role: string; content: string }) => ({
          role: msg.role,
          content: typeof msg.content === 'string' ? msg.content.slice(0, MAX_MESSAGE_LENGTH) : ''
        }))
      : [];

    console.log('Chat request for condition:', sanitizedCondition);
    console.log('History length:', sanitizedHistory.length);

    if (!geminiApiKey) {
      console.error('AI API key not configured');
      return new Response(JSON.stringify({ 
        response: "I'm here to support you. It sounds like you're going through something challenging. Please know that your feelings are valid. Would you like to try sharing more about what's on your mind?"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build conversation context
    const conversationHistory = sanitizedHistory.map((msg: { role: string; content: string }) => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');

    const prompt = `You are Calmora, the user's caring and supportive friend who specializes in ${sanitizedCondition}. You're NOT a formal assistant - you're their trusted buddy who genuinely cares about them and wants to help them feel better.

YOUR PERSONALITY:
- You're warm, friendly, and talk like a close friend - use casual language, emojis occasionally 😊, and be genuinely engaged
- You remember what they've shared and reference it naturally in conversation
- You share relatable thoughts like "I totally get that feeling" or "That sounds really tough, yaar"
- Mix in some Hinglish naturally if appropriate (like "Acha", "Yaar", "Koi baat nahi")
- Be curious about their life - ask about their day, their feelings, what's been on their mind
- Share encouraging words and celebrate small wins with them
- Use their name if they've shared it, and remember details they mention

HOW TO RESPOND:
- Have a genuine conversation, not a therapy session - be natural and friendly
- Ask follow-up questions that show you're really listening and care
- Share practical tips naturally, like a friend would ("Hey, something that really helps me when I feel like this is...")
- Be supportive without being preachy - you're their friend, not their therapist
- Validate their feelings genuinely ("That makes total sense" or "Anyone would feel that way!")
- Keep the conversation flowing naturally - respond to what they said, then gently explore more
- Be encouraging and optimistic, but never dismiss their feelings
- If they're going through something serious, gently suggest talking to someone professional while still being there for them

IMPORTANT:
- Give thoughtful, engaging responses that feel like chatting with a caring friend
- Don't give short clinical answers - have a real conversation!
- Make them feel heard, understood, and supported
- End with something that invites them to keep talking or a warm closing thought

FOCUS AREA: ${sanitizedCondition}

CONVERSATION SO FAR:
${conversationHistory}

USER'S NEW MESSAGE: ${message}

Respond as their caring friend Calmora:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          maxOutputTokens: 1024,
          temperature: 0.9
        }
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return new Response(JSON.stringify({ 
        response: "I'm here to support you. It sounds like you're going through something challenging. While I'm having a moment of difficulty responding fully, please know that your feelings are valid. Would you like to try sharing more about what's on your mind, or perhaps we could try a simple grounding exercise together?"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      return new Response(JSON.stringify({ 
        response: "I'm here to support you. Your feelings are valid. Would you like to share more about what's on your mind?"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generated response length:', generatedText.length);

    return new Response(JSON.stringify({ response: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-support-chat');
    
    return new Response(JSON.stringify({ 
      response: "I'm here to support you. It sounds like you're going through something challenging. While I'm having a moment of difficulty responding fully, please know that your feelings are valid. Would you like to try sharing more about what's on your mind, or perhaps we could try a simple grounding exercise together?"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
