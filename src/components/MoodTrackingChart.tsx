import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MoodEntry {
  mood: string;
  note: string;
  timestamp: Date;
}

interface MoodTrackingChartProps {
  moodEntries: MoodEntry[];
}

export const MoodTrackingChart = ({ moodEntries }: MoodTrackingChartProps) => {
  const chartData = useMemo(() => {
    const moodValues: { [key: string]: number } = {
      happy: 5, joyful: 5, peaceful: 4, calm: 4, content: 4, motivated: 4,
      okay: 3, neutral: 3, sad: 2, anxious: 2, angry: 1, frustrated: 1, overwhelmed: 1
    };

    const groupedByDate = moodEntries.reduce((acc, entry) => {
      const date = entry.timestamp.toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    }, {} as Record<string, MoodEntry[]>);

    return Object.entries(groupedByDate)
      .map(([date, entries]) => {
        const avgMood = entries.reduce((sum, entry) => sum + (moodValues[entry.mood.toLowerCase()] || 3), 0) / entries.length;
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          mood: Math.round(avgMood * 10) / 10,
          entries: entries.length,
          fullDate: date
        };
      })
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
      .slice(-7);
  }, [moodEntries]);

  const moodDistribution = useMemo(() => {
    const distribution = moodEntries.reduce((acc, entry) => {
      const mood = entry.mood.toLowerCase();
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution)
      .map(([mood, count]) => ({
        mood: mood.charAt(0).toUpperCase() + mood.slice(1),
        count,
        percentage: Math.round((count / moodEntries.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [moodEntries]);

  const getMoodTrend = () => {
    if (chartData.length < 2) return 'stable';
    const recent = chartData.slice(-3);
    const avgRecent = recent.reduce((sum, day) => sum + day.mood, 0) / recent.length;
    if (avgRecent > 3.5) return 'improving';
    if (avgRecent < 2.5) return 'declining';
    return 'stable';
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-status-success';
      case 'declining': return 'text-destructive';
      default: return 'text-status-info';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const trend = getMoodTrend();

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">{`Date: ${label}`}</p>
          <p className="text-primary text-sm">{`Mood: ${payload[0].value}/5.0`}</p>
        </div>
      );
    }
    return null;
  };

  const customBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">{`${label}`}</p>
          <p className="text-primary text-sm">{`${data.count} entries (${data.percentage}%)`}</p>
        </div>
      );
    }
    return null;
  };

  if (moodEntries.length === 0) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No mood data yet</p>
        <p className="text-xs text-muted-foreground">Start tracking your mood to see trends</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trend Badge */}
      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
        <span className="text-sm text-muted-foreground">Current Trend:</span>
        <div className={`flex items-center gap-2 font-medium text-sm ${getTrendColor(trend)}`}>
          <span>{getTrendIcon(trend)}</span>
          <span className="capitalize">{trend}</span>
        </div>
      </div>

      {/* Line Chart */}
      {chartData.length > 0 && (
        <div className="h-48 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
              <YAxis domain={[1, 5]} className="text-xs" tick={{ fontSize: 11 }} />
              <Tooltip content={customTooltip} />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Distribution */}
      {moodDistribution.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> Mood Distribution
          </h4>
          <div className="flex flex-wrap gap-2">
            {moodDistribution.map((item) => (
              <Badge key={item.mood} variant="outline" className="text-xs rounded-full gap-1.5">
                {item.mood} <span className="text-muted-foreground">{item.percentage}%</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
