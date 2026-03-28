
-- Player progress table for gamification persistence
CREATE TABLE public.player_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  total_xp_earned integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_active_date date,
  moods_completed integer NOT NULL DEFAULT 0,
  journals_completed integer NOT NULL DEFAULT 0,
  meditations_completed integer NOT NULL DEFAULT 0,
  puzzles_completed integer NOT NULL DEFAULT 0,
  quests_completed integer NOT NULL DEFAULT 0,
  streak_shields integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.player_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.player_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.player_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.player_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Daily quests state table
CREATE TABLE public.daily_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quest_date date NOT NULL DEFAULT CURRENT_DATE,
  quests jsonb NOT NULL DEFAULT '[]'::jsonb,
  all_complete_bonus boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, quest_date)
);

ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quests" ON public.daily_quests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quests" ON public.daily_quests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests" ON public.daily_quests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
