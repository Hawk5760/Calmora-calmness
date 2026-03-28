import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Heart,
  Smile,
  Meh,
  Frown,
  Activity,
  Target
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { PageLayout } from "@/components/layout/PageLayout";
import { useUserStorage, STORAGE_KEYS } from "@/hooks/useUserStorage";

interface MoodEntry {
  date: string;
  mood: string;
  score: number;
}

interface WeeklyData {
  week: string;
  average: number;
  entries: number;
}

const MOOD_COLORS = {
  'Very Happy': '#10b981',
  'Happy': '#22c55e',
  'Neutral': '#fbbf24',
  'Sad': '#f97316',
  'Very Sad': '#ef4444'
};

export const AnalyticsPage = () => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [moodDistribution, setMoodDistribution] = useState<any[]>([]);
  const { getItem } = useUserStorage();

  useEffect(() => {
    // Load mood data from user-scoped storage
    const entries = getItem<any[]>(STORAGE_KEYS.MOOD_ENTRIES, []);
    if (entries.length > 0) {
      setMoodEntries(entries);
      
      // Process weekly data
      const weekly = processWeeklyData(entries);
      setWeeklyData(weekly);
      
      // Process mood distribution
      const distribution = processMoodDistribution(entries);
      setMoodDistribution(distribution);
    } else {
      // Generate sample data for demo
      const sampleData = generateSampleData();
      setMoodEntries(sampleData);
      setWeeklyData(processWeeklyData(sampleData));
      setMoodDistribution(processMoodDistribution(sampleData));
    }
  }, []);

  const generateSampleData = (): MoodEntry[] => {
    const moods = ['Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad'];
    const scores = [5, 4, 3, 2, 1];
    const data = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const moodIndex = Math.floor(Math.random() * moods.length);
      data.push({
        date: date.toISOString().split('T')[0],
        mood: moods[moodIndex],
        score: scores[moodIndex]
      });
    }
    
    return data.reverse();
  };

  const processWeeklyData = (entries: MoodEntry[]): WeeklyData[] => {
    const weeks: { [key: string]: { total: number; count: number } } = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.date);
      
      // Skip invalid dates
      if (isNaN(date.getTime())) {
        console.warn('Invalid date found:', entry.date);
        return;
      }
      
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { total: 0, count: 0 };
      }
      weeks[weekKey].total += entry.score;
      weeks[weekKey].count += 1;
    });

    return Object.entries(weeks).map(([week, data]) => {
      const weekDate = new Date(week);
      const weekLabel = isNaN(weekDate.getTime()) 
        ? 'Invalid' 
        : weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
      return {
        week: weekLabel,
        average: Math.round((data.total / data.count) * 10) / 10,
        entries: data.count
      };
    }).slice(-8);
  };

  const processMoodDistribution = (entries: MoodEntry[]) => {
    const distribution: { [key: string]: number } = {};
    
    entries.forEach(entry => {
      distribution[entry.mood] = (distribution[entry.mood] || 0) + 1;
    });

    return Object.entries(distribution).map(([mood, count]) => ({
      name: mood,
      value: count,
      color: MOOD_COLORS[mood as keyof typeof MOOD_COLORS]
    }));
  };

  const getAverageScore = () => {
    if (moodEntries.length === 0) return 0;
    return (moodEntries.reduce((sum, entry) => sum + entry.score, 0) / moodEntries.length).toFixed(1);
  };

  const getTrend = () => {
    if (moodEntries.length < 7) return { direction: 'stable', percentage: 0 };
    
    const recent = moodEntries.slice(-7);
    const previous = moodEntries.slice(-14, -7);
    
    if (previous.length === 0) return { direction: 'stable', percentage: 0 };
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.score, 0) / recent.length;
    const previousAvg = previous.reduce((sum, entry) => sum + entry.score, 0) / previous.length;
    
    const change = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    return {
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      percentage: Math.abs(change).toFixed(1)
    };
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'Very Happy': return <Smile className="w-4 h-4 text-green-500" />;
      case 'Happy': return <Smile className="w-4 h-4 text-green-400" />;
      case 'Neutral': return <Meh className="w-4 h-4 text-yellow-500" />;
      case 'Sad': return <Frown className="w-4 h-4 text-orange-500" />;
      case 'Very Sad': return <Frown className="w-4 h-4 text-red-500" />;
      default: return <Meh className="w-4 h-4" />;
    }
  };

  const trend = getTrend();

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-gradient-soul">
              Advanced Analytics
            </h1>
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg text-muted-foreground">
            Deep insights into your mood patterns and wellness journey
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{getAverageScore()}</span>
              </div>
              <p className="text-sm text-muted-foreground">Average Mood Score</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{moodEntries.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Check-ins</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{trend.percentage}%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Weekly Trend 
                <Badge variant={trend.direction === 'up' ? 'default' : trend.direction === 'down' ? 'destructive' : 'secondary'} className="ml-2">
                  {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'}
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{Math.round((moodEntries.length / 30) * 100)}%</span>
              </div>
              <p className="text-sm text-muted-foreground">Monthly Goal</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Mood Trends</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Mood Average</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis domain={[1, 5]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="average" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Check-in Frequency</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="entries" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distribution">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mood Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={moodDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {moodDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Moods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {moodEntries.slice(-10).reverse().map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getMoodIcon(entry.mood)}
                        <span className="font-medium">{entry.mood}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wellness Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2">💡 Pattern Recognition</h4>
                    <p className="text-sm text-muted-foreground">
                      Your mood tends to be highest on weekends, suggesting the importance of rest and relaxation in your wellness routine.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2">📈 Progress Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      You've maintained consistent check-ins for the past month, showing great commitment to your mental wellness journey.
                    </p>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2">🎯 Recommendations</h4>
                    <p className="text-sm text-muted-foreground">
                      Consider adding more mindfulness sessions during weekdays to maintain emotional balance.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Daily Check-ins</span>
                      <span className="text-sm font-semibold">{Math.min(moodEntries.length, 30)}/30</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((moodEntries.length / 30) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Positive Mood Days</span>
                      <span className="text-sm font-semibold">
                        {moodEntries.filter(e => e.score >= 4).length}/{moodEntries.length}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${moodEntries.length > 0 ? (moodEntries.filter(e => e.score >= 4).length / moodEntries.length) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  <Badge variant="outline" className="w-full justify-center py-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    Keep up the great work!
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};