import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodEntry } from "@/types/supabase";

interface MoodAnalyticsProps {
  history: Array<MoodEntry & { timestamp: Date }>;
}

const moodLabels: Record<string, string> = {
  "🥰": "Very Happy",
  "😄": "Happy",
  "😊": "Content",
  "😐": "Neutral",
  "😔": "Sad",
  "😢": "Very Sad"
};

export default function MoodAnalytics({ history }: MoodAnalyticsProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No analytics available yet. Track your mood to see insights!</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate mood distribution
  const moodCounts = history.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate mood trend (last 7 days vs previous 7 days)
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 14);

  const recentMoods = history.filter(
    (entry) => entry.timestamp >= oneWeekAgo
  );
  const previousMoods = history.filter(
    (entry) =>
      entry.timestamp >= twoWeeksAgo && entry.timestamp < oneWeekAgo
  );

  const recentAverage =
    recentMoods.reduce((sum, entry) => sum + (moodValues[entry.mood] || 0), 0) /
    (recentMoods.length || 1);
  const previousAverage =
    previousMoods.reduce((sum, entry) => sum + (moodValues[entry.mood] || 0), 0) /
    (previousMoods.length || 1);

  const trend = recentAverage - previousAverage;
  const trendText =
    Math.abs(trend) < 0.1
      ? "stable"
      : trend > 0
      ? "improving"
      : "declining";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium">Mood Distribution</h3>
          <div className="mt-2 space-y-2">
            {Object.entries(moodCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([mood, count]) => (
                <div key={mood} className="flex items-center">
                  <span className="w-8 text-xl">{mood}</span>
                  <span className="w-20 text-sm text-muted-foreground">
                    {moodLabels[mood] || mood}
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-4 rounded bg-primary/20"
                      style={{
                        width: `${(count / history.length) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="ml-2 w-8 text-right text-sm font-medium">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium">Mood Trend</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your mood has been {trendText} compared to the previous week.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Mood values for calculations
const moodValues: Record<string, number> = {
  "🥰": 5, // Very Happy
  "😄": 4, // Happy
  "😊": 3, // Content
  "😐": 2, // Neutral
  "😔": 1, // Sad
  "😢": 0, // Very Sad
};
