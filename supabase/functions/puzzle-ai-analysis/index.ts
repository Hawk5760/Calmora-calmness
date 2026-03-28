import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_TIME_TAKEN = 3600; // 1 hour max
const MAX_ATTEMPTS = 100;
const MAX_DIFFICULTY_LENGTH = 50;
const MAX_CATEGORY_LENGTH = 100;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create authenticated Supabase client with user's token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { gameSessionId, timeTaken, attempts, difficulty, category } = await req.json();

    // Input validation
    const validatedTimeTaken = typeof timeTaken === 'number' && timeTaken >= 0 && timeTaken <= MAX_TIME_TAKEN 
      ? timeTaken 
      : 0;
    const validatedAttempts = typeof attempts === 'number' && attempts >= 0 && attempts <= MAX_ATTEMPTS 
      ? attempts 
      : 1;
    const validatedDifficulty = typeof difficulty === 'string' 
      ? difficulty.slice(0, MAX_DIFFICULTY_LENGTH) 
      : 'medium';
    const validatedCategory = typeof category === 'string' 
      ? category.slice(0, MAX_CATEGORY_LENGTH) 
      : 'general';

    // Get recent game sessions for analysis
    const { data: recentSessions, error: sessionsError } = await supabaseClient
      .from('game_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (sessionsError) {
      console.error('Error fetching sessions');
      return new Response(JSON.stringify({ error: 'Unable to fetch data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user's recent stress reports for context
    const { data: recentReports, error: reportsError } = await supabaseClient
      .from('stress_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (reportsError) {
      console.error('Error fetching reports');
    }

    // Prepare data for AI analysis
    const gameData = {
      currentSession: { timeTaken: validatedTimeTaken, attempts: validatedAttempts, difficulty: validatedDifficulty, category: validatedCategory },
      recentSessions: recentSessions || [],
      recentReports: recentReports || [],
      sessionCount: recentSessions?.length || 0
    };

    // Calculate performance metrics
    const avgTime = recentSessions?.length ? 
      recentSessions.reduce((sum, session) => sum + (session.time_taken || 0), 0) / recentSessions.length : 0;
    
    const solvedSessions = recentSessions?.filter(s => s.solved) || [];
    const successRate = recentSessions?.length ? (solvedSessions.length / recentSessions.length) * 100 : 0;

    // Create comprehensive prompt for Gemini AI
    const analysisPrompt = `
    You are a mental wellness AI assistant for Calmora Mind Puzzle. Analyze this user's puzzle performance and generate a comprehensive visual stress report.

    🎮 Current Puzzle Session:
    - Time taken: ${validatedTimeTaken} seconds
    - Attempts: ${validatedAttempts}
    - Difficulty: ${validatedDifficulty}
    - Category: ${validatedCategory}

    📊 Performance History:
    - Average solving time: ${avgTime.toFixed(1)} seconds
    - Success rate: ${successRate.toFixed(1)}%
    - Total puzzles solved: ${gameData.sessionCount}
    - Recent sessions: ${JSON.stringify(recentSessions?.slice(0, 5).map(s => ({ 
        time: s.time_taken, 
        attempts: s.attempts, 
        solved: s.solved,
        difficulty: s.difficulty 
      })))}

    ${recentReports?.length ? `🧠 Recent Mood Context:
    - Previous stress levels: ${recentReports.map(r => r.stress_level).join(', ')}
    - Wellness journey: ${recentReports[0]?.ai_analysis || 'Just starting'}` : ''}

    Generate a friendly, visual, easy-to-digest stress report with these elements:

    1. 🌡️ Stress Level Assessment (low/moderate/high):
       - LOW: Fast completion (<30s), 1-2 attempts, improving trend, consistent performance
       - MODERATE: Average time (30-60s), 2-4 attempts, stable performance with minor fluctuations
       - HIGH: Slow completion (>60s), 5+ attempts, declining trend, fatigue indicators

    2. 📈 Weekly Progress Insight (describe trend):
       - Analyze improvement or decline patterns
       - Note consistency and engagement level
       - Highlight positive momentum or areas for gentle attention

    3. 💡 Personalized Coping Tip of the Day:
       - Must be specific, actionable, and deeply encouraging
       - Tailored to their stress level and performance patterns
       - Include mindfulness, breathing exercises, or positive mindset techniques
       - Make it feel like a caring friend's advice

    4. 🎉 Motivational Achievement Badges (select 1-3 that apply):
       - "first_solve" (🌱 Mindful Beginner): First puzzle completed - welcome to your wellness journey!
       - "quick_thinker" (⚡ Speed Master): Solved in under 30 seconds with minimal attempts
       - "mindful_solver" (🧘 Zen Solver): Completed mindfulness/wellness category puzzles
       - "consistent_player" (🔥 Daily Champion): Maintaining excellent play patterns and streaks
       - "stress_manager" (🌟 Wellness Warrior): Showing improvement in stress management
       - "focus_champion" (🎯 Focus Pro): Exceptional concentration and accuracy
       - "comeback_star" (💪 Resilient Spirit): Bounced back after challenges

    5. 📊 Weekly Wellness Score (0-100):
       - Calculate based on: speed (30%), accuracy (30%), consistency (20%), improvement trend (20%)
       - 90-100: Exceptional wellness and focus
       - 75-89: Strong performance with great mindfulness
       - 60-74: Good progress, room for gentle growth
       - 40-59: Keep going, every puzzle helps
       - 0-39: Be kind to yourself, it's a journey

    6. 🌈 AI Wellness Journey Analysis (2-4 encouraging sentences):
       - Celebrate their specific accomplishments and growth
       - Acknowledge effort and consistency (even if just starting)
       - Highlight unique positive patterns in their gameplay
       - Provide warm, motivational insights about their mental wellness path
       - Make them feel seen, supported, and inspired to continue

    Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
    {
      "stressLevel": "low",
      "weeklyProgress": "Your progress trend description here",
      "copingTip": "Your warm, personalized tip here",
      "aiAnalysis": "Your encouraging 2-4 sentence wellness journey analysis here",
      "suggestedBadges": ["badge_id1", "badge_id2"],
      "weeklyScore": 85
    }
    `;

    // Call Gemini AI API for comprehensive stress analysis
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('AI API key not configured');
      // Return fallback analysis instead of exposing configuration status
      const fallbackResult = generateFallbackAnalysis(validatedTimeTaken, validatedAttempts, validatedDifficulty, gameData.sessionCount, successRate);
      return await saveAndReturnReport(supabaseClient, user.id, gameSessionId, fallbackResult);
    }

    console.log('Calling AI for puzzle stress analysis...');
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: analysisPrompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      console.error('AI API error:', geminiResponse.status);
      const fallbackResult = generateFallbackAnalysis(validatedTimeTaken, validatedAttempts, validatedDifficulty, gameData.sessionCount, successRate);
      return await saveAndReturnReport(supabaseClient, user.id, gameSessionId, fallbackResult);
    }

    const geminiData = await geminiResponse.json();
    console.log('AI response received');

    let aiResult;
    try {
      const aiText = geminiData.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response (remove markdown code blocks if present)
      let jsonText = aiText.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResult = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        if (!aiResult.stressLevel || !aiResult.copingTip || !aiResult.aiAnalysis) {
          throw new Error('Missing required fields in AI response');
        }
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response');
      aiResult = generateFallbackAnalysis(validatedTimeTaken, validatedAttempts, validatedDifficulty, gameData.sessionCount, successRate);
    }

    return await saveAndReturnReport(supabaseClient, user.id, gameSessionId, aiResult);

  } catch (error) {
    console.error('Error in puzzle-ai-analysis function');
    return new Response(JSON.stringify({ error: 'Unable to process request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateFallbackAnalysis(timeTaken: number, attempts: number, difficulty: string, sessionCount: number, successRate: number) {
  const performanceScore = Math.max(0, 100 - (timeTaken * 1.5) - (attempts * 8));
  const stressLevel = performanceScore > 70 ? 'low' : performanceScore > 40 ? 'moderate' : 'high';
  
  return {
    stressLevel: stressLevel,
    weeklyProgress: sessionCount > 1 
      ? `You've completed ${sessionCount} puzzles! ${successRate > 70 ? 'Your consistency is impressive!' : 'Keep building your mindfulness practice.'}`
      : 'Welcome to your wellness journey! Every puzzle you solve helps build mental resilience.',
    copingTip: stressLevel === 'high' 
      ? 'Take a mindful pause. Close your eyes, breathe deeply for 3 counts, and remember - progress over perfection. You\'re doing great just by showing up!'
      : stressLevel === 'moderate'
      ? 'You\'re finding your rhythm! Try the 4-7-8 breathing technique before your next puzzle: breathe in for 4, hold for 7, exhale for 8.'
      : 'Beautiful work! Your mind is sharp and focused. Keep this positive momentum by celebrating small wins throughout your day.',
    aiAnalysis: `You completed this ${difficulty} puzzle in ${timeTaken} seconds with ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}. ${
      attempts === 1 ? '🎯 Perfect focus! You\'re showing excellent concentration.' : 
      attempts <= 3 ? '💪 Great persistence! Every challenge you overcome builds resilience.' :
      '🌱 Remember, growth happens with practice. Each puzzle is a step forward in your wellness journey.'
    } Your engagement with Calmora Mind Puzzle shows dedication to your mental wellness. Keep going, you\'re building something beautiful! 🌟`,
    suggestedBadges: [
      ...(sessionCount === 1 ? ['first_solve'] : []),
      ...(timeTaken < 30 && attempts === 1 ? ['quick_thinker'] : []),
      ...(sessionCount >= 3 ? ['consistent_player'] : []),
      ...(stressLevel === 'low' ? ['stress_manager'] : [])
    ].filter(Boolean).slice(0, 3),
    weeklyScore: Math.round(Math.max(20, Math.min(100, performanceScore)))
  };
}

async function saveAndReturnReport(supabaseClient: any, userId: string, gameSessionId: string, aiResult: any) {
  // Store the comprehensive stress report in database
  console.log('Saving stress report to database...');
  const { data: stressReport, error: reportError } = await supabaseClient
    .from('stress_reports')
    .insert({
      user_id: userId,
      stress_level: aiResult.stressLevel,
      weekly_score: aiResult.weeklyScore || 50,
      coping_tip: aiResult.copingTip,
      ai_analysis: aiResult.aiAnalysis,
      badges: aiResult.suggestedBadges || [],
      game_session_id: gameSessionId
    })
    .select()
    .single();

  if (reportError) {
    console.error('Error saving stress report');
    return new Response(JSON.stringify({ error: 'Unable to save report' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  console.log('Stress report saved successfully');

  // Update user game stats
  const { data: currentStats } = await supabaseClient
    .from('user_game_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (currentStats) {
    const newStreak = currentStats.last_played_date === new Date().toISOString().split('T')[0] 
      ? currentStats.current_streak 
      : currentStats.current_streak + 1;
    
    await supabaseClient
      .from('user_game_stats')
      .update({
        current_streak: newStreak,
        max_streak: Math.max(currentStats.max_streak, newStreak),
        total_puzzles_solved: currentStats.total_puzzles_solved + 1,
        average_solve_time: ((currentStats.average_solve_time * currentStats.total_puzzles_solved) + (aiResult.timeTaken || 0)) / (currentStats.total_puzzles_solved + 1),
        last_played_date: new Date().toISOString().split('T')[0]
      })
      .eq('user_id', userId);
  }

  console.log('Returning analysis response');
  return new Response(JSON.stringify({
    success: true,
    report: stressReport,
    analysis: {
      ...aiResult,
      weeklyProgress: aiResult.weeklyProgress || 'Keep up the great work on your wellness journey!'
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
