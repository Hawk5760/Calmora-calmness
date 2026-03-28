import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_TITLE_LENGTH = 500;
const MAX_CONTENT_LENGTH = 50000;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
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

    const { content, title } = await req.json();

    // Input validation
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!title || typeof title !== 'string') {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return new Response(
        JSON.stringify({ error: "Content too long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (title.length > MAX_TITLE_LENGTH) {
      return new Response(
        JSON.stringify({ error: "Title too long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Sanitize inputs
    const sanitizedTitle = title.slice(0, MAX_TITLE_LENGTH);
    const sanitizedContent = content.slice(0, MAX_CONTENT_LENGTH);

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!GEMINI_API_KEY && !LOVABLE_API_KEY) {
      console.error("No AI keys configured");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt =
      "You are a compassionate journaling companion. Reflect back key emotions and themes succinctly, celebrate strengths, avoid diagnosing, and suggest one gentle, actionable next step. Keep tone warm and empowering.";

    const userPrompt = `Generate a supportive journaling reflection based on the user's entry.\n\nTitle: ${sanitizedTitle}\n\nEntry:\n${sanitizedContent}\n\nReturn insights via the provided tool with:\n- reflection: 3-6 sentences, empathic and validating\n- summary: 1-2 sentence neutral recap\n- followUpQuestion: 1 thoughtful question that helps deepen reflection`;

    let reflection = "Thank you for writing so openly. Your words show courage and care for yourself.";
    let summary = "Entry captured.";
    let followUpQuestion = "What felt most important as you wrote this?";

    if (GEMINI_API_KEY) {
      console.log("Calling AI API for journal reflection...");
      const gemBody = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          { role: "user", parts: [{ text: userPrompt }] }
        ],
        generationConfig: { responseMimeType: "application/json" }
      } as const;

      const gemUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const gemResp = await fetch(gemUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gemBody),
      });

      if (!gemResp.ok) {
        console.error("AI API error", gemResp.status);
        if (gemResp.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limits exceeded, please try again shortly." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable" }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const gen = await gemResp.json();
      console.log("AI response received");

      try {
        const text = gen?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof text === "string" && text.trim()) {
          const parsed = JSON.parse(text);
          reflection = (parsed?.reflection ?? reflection).toString();
          summary = (parsed?.summary ?? summary).toString();
          followUpQuestion = (parsed?.followUpQuestion ?? followUpQuestion).toString();
        }
      } catch (e) {
        console.warn("Failed to parse AI response, using safe defaults");
      }
    } else {
      console.log("Calling Lovable AI gateway for journal reflection...");

      const body: any = {
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "journal_reflection",
              description: "Return supportive journaling insights",
              parameters: {
                type: "object",
                properties: {
                  reflection: { type: "string", description: "Empathic 3-6 sentence reflection" },
                  summary: { type: "string", description: "1-2 sentence neutral summary" },
                  followUpQuestion: { type: "string", description: "Gentle question for next step" },
                },
                required: ["reflection", "summary", "followUpQuestion"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "journal_reflection" } },
      };

      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!aiResp.ok) {
        console.error("AI gateway error", aiResp.status);
        if (aiResp.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limits exceeded, please try again shortly." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        if (aiResp.status === 402) {
          return new Response(
            JSON.stringify({ error: "Service temporarily unavailable" }),
            { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable" }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const data = await aiResp.json();
      console.log("AI gateway response received");

      try {
        const choice = data?.choices?.[0];
        const toolCalls = choice?.message?.tool_calls;
        if (Array.isArray(toolCalls) && toolCalls.length > 0) {
          const argsStr = toolCalls[0]?.function?.arguments;
          const parsed = typeof argsStr === "string" ? JSON.parse(argsStr) : argsStr;
          reflection = (parsed?.reflection ?? reflection).toString();
          summary = (parsed?.summary ?? summary).toString();
          followUpQuestion = (parsed?.followUpQuestion ?? followUpQuestion).toString();
        } else {
          const msgContent: string | undefined = choice?.message?.content;
          if (typeof msgContent === "string") {
            try {
              const maybeJson = JSON.parse(msgContent);
              reflection = (maybeJson?.reflection ?? reflection).toString();
              summary = (maybeJson?.summary ?? summary).toString();
              followUpQuestion = (maybeJson?.followUpQuestion ?? followUpQuestion).toString();
            } catch {
              // keep defaults
            }
          }
        }
      } catch (e) {
        console.warn("Failed to parse AI gateway response, using safe defaults");
      }
    }

    const responsePayload = { reflection, summary, followUpQuestion };
    console.log("Returning reflection payload");

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("journal-reflection error");
    return new Response(
      JSON.stringify({
        reflection: "Thank you for sharing. Even small reflections are meaningful. Be gentle with yourself as you process.",
        summary: "Entry received.",
        followUpQuestion: "What is one small step you can take to support yourself today?",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
