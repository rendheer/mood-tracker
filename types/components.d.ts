declare module '@/components/mood/mood-history' {
  import { FC } from 'react';
  import { MoodEntry } from '@/types/supabase';

  interface MoodHistoryProps {
    history: Array<MoodEntry & { timestamp: Date }>;
    onEditNote?: (id: string, note: string) => Promise<void>;
    onClearHistory?: () => Promise<void>;
  }

  const MoodHistory: FC<MoodHistoryProps>;
  export default MoodHistory;
}

declare module '@/components/mood/mood-analytics' {
  import { FC } from 'react';
  import { MoodEntry } from '@/types/supabase';

  interface MoodAnalyticsProps {
    history: Array<MoodEntry & { timestamp: Date }>;
  }

  const MoodAnalytics: FC<MoodAnalyticsProps>;
  export default MoodAnalytics;
}

declare module '@/components/mood/mood-correlation' {
  import { FC } from 'react';
  import { MoodEntry } from '@/types/supabase';

  interface MoodCorrelationProps {
    history: Array<MoodEntry & { timestamp: Date }>;
  }

  const MoodCorrelation: FC<MoodCorrelationProps>;
  export default MoodCorrelation;
}
