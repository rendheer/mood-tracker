"use client"

import { useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js"
import { Line, Doughnut, Bar } from "react-chartjs-2"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

// Map emojis to numerical values for charting
const moodValues: Record<string, number> = {
  "🥰": 5, // Very Happy
  "😄": 4, // Happy
  "😐": 3, // Neutral
  "😔": 2, // Sad
  "😢": 1, // Very Sad
}

// Map numerical values back to emojis for display
const valueToEmoji: Record<number, string> = {
  5: "🥰",
  4: "😄",
  3: "😐",
  2: "😔",
  1: "😢",
}

// Map numerical values to colors
const moodColors = {
  5: "rgba(72, 187, 120, 0.7)", // Green for Very Happy
  4: "rgba(104, 211, 145, 0.7)", // Light Green for Happy
  3: "rgba(237, 137, 54, 0.7)", // Orange for Neutral
  2: "rgba(237, 100, 166, 0.7)", // Pink for Sad
  1: "rgba(224, 36, 94, 0.7)", // Red for Very Sad
}

interface MoodAnalyticsProps {
  history: Array<{ mood: string; timestamp: Date }>
}

export default function MoodAnalytics({ history }: MoodAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<string>("week")

  if (history.length < 2) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Track more moods to see analytics</p>
        <p className="text-sm text-gray-400 mt-2">You need at least 2 entries to generate visualizations</p>
      </div>
    )
  }

  // Filter data based on selected time range
  const filteredHistory = (() => {
    const now = new Date()
    const msInDay = 24 * 60 * 60 * 1000

    switch (timeRange) {
      case "week":
        return history.filter((entry) => now.getTime() - entry.timestamp.getTime() <= 7 * msInDay)
      case "month":
        return history.filter((entry) => now.getTime() - entry.timestamp.getTime() <= 30 * msInDay)
      case "year":
        return history.filter((entry) => now.getTime() - entry.timestamp.getTime() <= 365 * msInDay)
      default:
        return history
    }
  })()

  // Sort by timestamp for trend analysis
  const sortedHistory = [...filteredHistory].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  // Prepare data for line chart (mood over time)
  const trendData = {
    labels: sortedHistory.map((entry) => formatDate(entry.timestamp)),
    datasets: [
      {
        label: "Mood",
        data: sortedHistory.map((entry) => moodValues[entry.mood]),
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        tension: 0.3,
        pointBackgroundColor: sortedHistory.map((entry) => moodColors[moodValues[entry.mood]]),
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }

  // Prepare data for distribution chart
  const distributionData = (() => {
    const counts: Record<string, number> = { "🥰": 0, "😄": 0, "😐": 0, "😔": 0, "😢": 0 }

    filteredHistory.forEach((entry) => {
      counts[entry.mood] = (counts[entry.mood] || 0) + 1
    })

    return {
      labels: Object.keys(counts),
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: [moodColors[5], moodColors[4], moodColors[3], moodColors[2], moodColors[1]],
          borderColor: [
            "rgba(72, 187, 120, 1)",
            "rgba(104, 211, 145, 1)",
            "rgba(237, 137, 54, 1)",
            "rgba(237, 100, 166, 1)",
            "rgba(224, 36, 94, 1)",
          ],
          borderWidth: 1,
        },
      ],
    }
  })()

  // Prepare data for weekly patterns
  const weeklyPatternData = (() => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayCounts = Array(7).fill(0)
    const dayTotals = Array(7).fill(0)

    filteredHistory.forEach((entry) => {
      const dayIndex = entry.timestamp.getDay()
      dayCounts[dayIndex]++
      dayTotals[dayIndex] += moodValues[entry.mood]
    })

    // Calculate average mood per day (if there are entries for that day)
    const dayAverages = dayNames.map((_, index) => (dayCounts[index] ? dayTotals[index] / dayCounts[index] : 0))

    return {
      labels: dayNames,
      datasets: [
        {
          label: "Average Mood by Day of Week",
          data: dayAverages,
          backgroundColor: dayAverages.map((value) =>
            value ? moodColors[Math.round(value) as keyof typeof moodColors] : "rgba(203, 213, 225, 0.5)",
          ),
          borderColor: "rgba(203, 213, 225, 1)",
          borderWidth: 1,
        },
      ],
    }
  })()

  // Chart options
  const lineOptions = {
    responsive: true,
    scales: {
      y: {
        min: 0.5,
        max: 5.5,
        ticks: {
          callback: (value: number) => valueToEmoji[value as keyof typeof valueToEmoji] || "",
          stepSize: 1,
        },
        title: {
          display: true,
          text: "Mood Level",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y
            const emoji = valueToEmoji[Math.round(value)]
            const labels = {
              5: "Very Happy",
              4: "Happy",
              3: "Neutral",
              2: "Sad",
              1: "Very Sad",
            }
            return `Mood: ${emoji} ${labels[Math.round(value) as keyof typeof labels]}`
          },
        },
      },
      legend: {
        display: false,
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || ""
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = Math.round((value / total) * 100)
            const moodLabels: Record<string, string> = {
              "🥰": "Very Happy",
              "😄": "Happy",
              "😐": "Neutral",
              "😔": "Sad",
              "😢": "Very Sad",
            }
            return `${label} ${moodLabels[label]}: ${percentage}% (${value} entries)`
          },
        },
      },
      legend: {
        position: "right" as const,
      },
    },
  }

  const barOptions = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          callback: (value: number) => valueToEmoji[value as keyof typeof valueToEmoji] || "",
          stepSize: 1,
        },
        title: {
          display: true,
          text: "Average Mood",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y
            if (value === 0) return "No data"

            const emoji = valueToEmoji[Math.round(value)]
            const labels = {
              5: "Very Happy",
              4: "Happy",
              3: "Neutral",
              2: "Sad",
              1: "Very Sad",
            }
            return `Average Mood: ${emoji} ${labels[Math.round(value) as keyof typeof labels]}`
          },
        },
      },
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Mood Analytics</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="trend" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="trend">Mood Trend</TabsTrigger>
          <TabsTrigger value="distribution">Mood Distribution</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Mood Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Line data={trendData} options={lineOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mood Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex justify-center">
                <Doughnut data={distributionData} options={doughnutOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Mood Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar data={weeklyPatternData} options={barOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to format dates
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}
