import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodEntry } from "@/types/supabase";

interface MoodCorrelationProps {
  history: Array<MoodEntry & { timestamp: Date }>;
}

export default function MoodCorrelation({ history }: MoodCorrelationProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Correlations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Track more moods to see correlations and patterns.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group entries by day of week
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const moodByDay = daysOfWeek.map(() => ({ count: 0, total: 0 }));
  
  history.forEach(entry => {
    const day = entry.timestamp.getDay(); // 0 = Sunday, 1 = Monday, etc.
    moodByDay[day].count++;
    moodByDay[day].total += moodValues[entry.mood] || 0;
  });

  // Calculate average mood for each day
  const averageMoodByDay = moodByDay.map(({ count, total }) => 
    count > 0 ? total / count : 0
  );

  // Find best and worst days
  const bestDayIndex = averageMoodByDay.indexOf(Math.max(...averageMoodByDay));
  const worstDayIndex = averageMoodByDay.indexOf(
    Math.min(...averageMoodByDay.filter(avg => avg > 0))
  );

  // Calculate mood by time of day
  const timesOfDay = ["Morning", "Afternoon", "Evening", "Night"];
  const moodByTime = timesOfDay.map(() => ({ count: 0, total: 0 }));
  
  history.forEach(entry => {
    const hour = entry.timestamp.getHours();
    let timeIndex;
    
    if (hour >= 5 && hour < 12) timeIndex = 0; // Morning (5 AM - 11:59 AM)
    else if (hour >= 12 && hour < 17) timeIndex = 1; // Afternoon (12 PM - 4:59 PM)
    else if (hour >= 17 && hour < 22) timeIndex = 2; // Evening (5 PM - 9:59 PM)
    else timeIndex = 3; // Night (10 PM - 4:59 AM)
    
    moodByTime[timeIndex].count++;
    moodByTime[timeIndex].total += moodValues[entry.mood] || 0;
  });

  // Calculate average mood for each time of day
  const averageMoodByTime = moodByTime.map(({ count, total }) => 
    count > 0 ? total / count : 0
  );
  
  // Find best and worst times
  const bestTimeIndex = averageMoodByTime.indexOf(Math.max(...averageMoodByTime));
  const worstTimeIndex = averageMoodByTime.indexOf(
    Math.min(...averageMoodByTime.filter(avg => avg > 0))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Correlations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium">Mood by Day of Week</h3>
          <div className="mt-2 flex h-40 items-end justify-between border-b border-l">
            {averageMoodByDay.map((avg, index) => (
              <div
                key={index}
                className="flex flex-1 flex-col items-center"
                style={{
                  height: `${(avg / 5) * 100}%`,
                }}
              >
                <div
                  className={`w-3/4 ${
                    index === bestDayIndex
                      ? "bg-green-500"
                      : index === worstDayIndex
                      ? "bg-red-500"
                      : "bg-primary"
                  }`}
                  style={{
                    height: "100%",
                  }}
                />
                <span className="mt-1 text-xs">{daysOfWeek[index]}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Best Day</p>
              <p className="font-medium">{daysOfWeek[bestDayIndex]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Worst Day</p>
              <p className="font-medium">
                {worstDayIndex >= 0 ? daysOfWeek[worstDayIndex] : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium">Mood by Time of Day</h3>
          <div className="mt-2 flex h-32 items-end justify-between border-b border-l">
            {averageMoodByTime.map((avg, index) => (
              <div
                key={index}
                className="flex flex-1 flex-col items-center"
                style={{
                  height: `${(avg / 5) * 100}%`,
                }}
              >
                <div
                  className={`w-3/4 ${
                    index === bestTimeIndex
                      ? "bg-green-500"
                      : index === worstTimeIndex
                      ? "bg-red-500"
                      : "bg-primary"
                  }`}
                  style={{
                    height: "100%",
                  }}
                />
                <span className="mt-1 text-xs">
                  {timesOfDay[index]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Best Time</p>
              <p className="font-medium">
                {bestTimeIndex >= 0 ? timesOfDay[bestTimeIndex] : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Worst Time</p>
              <p className="font-medium">
                {worstTimeIndex >= 0 ? timesOfDay[worstTimeIndex] : "N/A"}
              </p>
            </div>
          </div>
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
