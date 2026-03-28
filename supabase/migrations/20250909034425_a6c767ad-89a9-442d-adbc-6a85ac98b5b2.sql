-- Create tables for the word puzzle game feature

-- Game sessions table to track individual puzzle attempts
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  puzzle_word TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT NOT NULL,
  time_taken INTEGER, -- seconds taken to solve
  attempts INTEGER DEFAULT 0,
  solved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Stress reports table to store AI-generated analysis
CREATE TABLE public.stress_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stress_level TEXT NOT NULL CHECK (stress_level IN ('low', 'moderate', 'high')),
  weekly_score INTEGER NOT NULL DEFAULT 0,
  coping_tip TEXT NOT NULL,
  ai_analysis TEXT,
  badges TEXT[], -- array of badge IDs
  game_session_id UUID REFERENCES public.game_sessions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT NOT NULL,
  achievement_icon TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- User game stats for streaks and progress
CREATE TABLE public.user_game_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  total_puzzles_solved INTEGER DEFAULT 0,
  average_solve_time FLOAT DEFAULT 0,
  last_played_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_game_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for game_sessions
CREATE POLICY "Users can view their own game sessions" 
ON public.game_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game sessions" 
ON public.game_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for stress_reports
CREATE POLICY "Users can view their own stress reports" 
ON public.stress_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stress reports" 
ON public.stress_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for user_game_stats
CREATE POLICY "Users can view their own game stats" 
ON public.user_game_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create and update their own game stats" 
ON public.user_game_stats 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add triggers for timestamps
CREATE TRIGGER update_user_game_stats_updated_at
BEFORE UPDATE ON public.user_game_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Initialize game stats for existing users
INSERT INTO public.user_game_stats (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;