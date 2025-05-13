import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodEntry } from "@/types/supabase";

interface MoodHistoryProps {
  history: Array<MoodEntry & { timestamp: Date }>;
  onEditNote?: (id: string, note: string) => Promise<void>;
  onClearHistory?: () => Promise<void>;
}

export default function MoodHistory({ history, onEditNote, onClearHistory }: MoodHistoryProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Mood History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No mood entries yet. Track your first mood!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Mood History</CardTitle>
        {onClearHistory && (
          <Button variant="outline" size="sm" onClick={onClearHistory}>
            Clear History
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {history.map((entry) => (
          <div key={entry.id} className="flex items-start gap-4">
            <div className="text-2xl">{entry.mood}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {entry.timestamp.toLocaleDateString()}
                </p>
                <span className="text-sm text-muted-foreground">
                  {entry.timestamp.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {entry.note && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {entry.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
