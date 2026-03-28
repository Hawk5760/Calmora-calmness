import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/layout/PageLayout';
import { ChevronLeft, ChevronRight, Heart, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserStorage, STORAGE_KEYS } from '@/hooks/useUserStorage';
import { EmptyState } from '@/components/shared/EmptyState';

interface MoodEntry {
  mood: string;
  note: string;
  timestamp: string;
}

const MOOD_COLORS: Record<string, { bg: string; label: string }> = {
  happy: { bg: 'bg-emerald-500', label: '😊 Happy' },
  amazing: { bg: 'bg-emerald-400', label: '🤩 Amazing' },
  good: { bg: 'bg-teal-400', label: '😃 Good' },
  calm: { bg: 'bg-sky-400', label: '😌 Calm' },
  okay: { bg: 'bg-slate-400', label: '😐 Okay' },
  neutral: { bg: 'bg-slate-300', label: '😶 Neutral' },
  sad: { bg: 'bg-blue-500', label: '😢 Sad' },
  anxious: { bg: 'bg-amber-500', label: '😰 Anxious' },
  angry: { bg: 'bg-red-500', label: '😡 Angry' },
  motivated: { bg: 'bg-violet-500', label: '💪 Motivated' },
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MoodCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { getItem } = useUserStorage();

  const moodEntries: MoodEntry[] = useMemo(() => {
    return getItem<MoodEntry[]>(STORAGE_KEYS.MOOD_ENTRIES, []);
  }, [getItem]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const dayMoodMap = useMemo(() => {
    const map: Record<number, MoodEntry[]> = {};
    moodEntries.forEach(entry => {
      const d = new Date(entry.timestamp);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(entry);
      }
    });
    return map;
  }, [moodEntries, year, month]);

  const getDominantMood = (day: number): string | null => {
    const entries = dayMoodMap[day];
    if (!entries || entries.length === 0) return null;
    const counts: Record<string, number> = {};
    entries.forEach(e => { counts[e.mood] = (counts[e.mood] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const today = new Date();
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const totalEntries = Object.values(dayMoodMap).reduce((sum, arr) => sum + arr.length, 0);
  const activeDays = Object.keys(dayMoodMap).length;
  const moodCounts: Record<string, number> = {};
  Object.values(dayMoodMap).flat().forEach(e => { moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1; });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const hasMoodData = moodEntries.length > 0;

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mood Calendar</h1>
            </div>
            <p className="text-sm text-muted-foreground">Your emotional journey, visualized.</p>
          </div>

          {!hasMoodData ? (
            <EmptyState
              icon={<Smile className="w-8 h-8 text-primary" />}
              title="No mood entries yet"
              description="Start your first mood check-in to see your emotional journey visualized on this calendar."
              actionLabel="Log Your First Mood"
              actionHref="/mood"
            />
          ) : (
            <>
              <Card className="p-4 sm:p-6 bg-card/80 backdrop-blur-sm border-border/50 mb-4">
                <div className="flex items-center justify-between mb-5">
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={prevMonth}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="text-center">
                    <h2 className="text-lg font-bold text-foreground">{monthName}</h2>
                    <button onClick={goToday} className="text-[10px] text-primary hover:underline">Today</button>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={nextMonth}>
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAYS.map(day => (
                    <div key={day} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {cells.map((day, i) => {
                    if (day === null) return <div key={`empty-${i}`} />;
                    const mood = getDominantMood(day);
                    const moodInfo = mood ? MOOD_COLORS[mood] : null;
                    const entryCount = dayMoodMap[day]?.length || 0;

                    return (
                      <Tooltip key={day}>
                        <TooltipTrigger asChild>
                          <div
                            className={`
                              relative aspect-square rounded-lg flex flex-col items-center justify-center cursor-default transition-colors
                              ${isToday(day) ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                              ${moodInfo ? `${moodInfo.bg}/20 hover:${moodInfo.bg}/30` : 'bg-muted/20 hover:bg-muted/30'}
                            `}
                          >
                            <span className={`text-xs font-medium ${isToday(day) ? 'text-primary' : 'text-foreground'}`}>
                              {day}
                            </span>
                            {moodInfo && (
                              <div className={`w-2 h-2 rounded-full ${moodInfo.bg} mt-0.5`} />
                            )}
                            {entryCount > 1 && (
                              <span className="absolute top-0.5 right-1 text-[8px] text-muted-foreground">{entryCount}</span>
                            )}
                          </div>
                        </TooltipTrigger>
                        {moodInfo && (
                          <TooltipContent side="top" className="text-xs">
                            <p>{moodInfo.label} · {entryCount} {entryCount === 1 ? 'entry' : 'entries'}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </div>
              </Card>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <Card className="p-3 bg-card/80 backdrop-blur-sm border-border/50 text-center">
                  <div className="text-xl font-bold text-foreground">{totalEntries}</div>
                  <div className="text-[10px] text-muted-foreground">Entries</div>
                </Card>
                <Card className="p-3 bg-card/80 backdrop-blur-sm border-border/50 text-center">
                  <div className="text-xl font-bold text-foreground">{activeDays}</div>
                  <div className="text-[10px] text-muted-foreground">Active Days</div>
                </Card>
                <Card className="p-3 bg-card/80 backdrop-blur-sm border-border/50 text-center">
                  <div className="text-xl font-bold text-foreground capitalize">{topMood ? topMood[0] : '—'}</div>
                  <div className="text-[10px] text-muted-foreground">Top Mood</div>
                </Card>
              </div>

              <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50">
                <h3 className="text-xs font-semibold text-foreground mb-3">Mood Legend</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(MOOD_COLORS).map(([mood, info]) => (
                    <div key={mood} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <div className={`w-2.5 h-2.5 rounded-full ${info.bg}`} />
                      <span className="capitalize">{mood}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default MoodCalendarPage;
