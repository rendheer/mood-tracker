"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  groupEntriesByMood,
  findCommonWordsByMood,
  findCategoriesByMood,
  generateInsights,
  getMoodName,
} from "@/lib/text-analysis"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface MoodCorrelationProps {
  history: Array<{ mood: string; timestamp: Date; note?: string; id?: string }>
}

export default function MoodCorrelation({ history }: MoodCorrelationProps) {
  const [insights, setInsights] = useState<string[]>([])
  const [wordsByMood, setWordsByMood] = useState<Record<string, Array<{ text: string; value: number }>>>({})
  const [categoriesByMood, setCategoriesByMood] = useState<Record<string, Record<string, number>>>({})
  const [selectedMood, setSelectedMood] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("insights")

  // Filter entries with notes
  const entriesWithNotes = history.filter((entry) => entry.note && entry.note.trim() !== "")

  useEffect(() => {
    if (entriesWithNotes.length === 0) return

    // Group notes by mood
    const groupedNotes = groupEntriesByMood(entriesWithNotes)

    // Find common words for each mood
    const commonWords = findCommonWordsByMood(groupedNotes)
    setWordsByMood(commonWords)

    // Find categories for each mood
    const categories = findCategoriesByMood(groupedNotes)
    setCategoriesByMood(categories)

    // Generate insights
    const generatedInsights = generateInsights(entriesWithNotes, commonWords, categories)
    setInsights(generatedInsights)
  }, [entriesWithNotes])

  if (entriesWithNotes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Add notes to your mood entries to see correlations</p>
        <p className="text-sm text-gray-400 mt-2">
          We'll analyze your notes to find patterns between your words and moods
        </p>
      </div>
    )
  }

  // Prepare data for mood distribution chart
  const moodDistribution = Object.entries(
    entriesWithNotes.reduce(
      (acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  ).map(([mood, count]) => ({
    name: getMoodName(mood),
    value: count,
    mood,
  }))

  // Colors for mood chart
  const MOOD_COLORS = {
    "🥰": "#48bb78", // green
    "😄": "#68d391", // light green
    "😐": "#ed8936", // orange
    "😔": "#ed64a6", // pink
    "😢": "#e0245e", // red
  }

  // Prepare data for category chart
  const getCategoryData = () => {
    if (selectedMood === "all") {
      // Combine all moods
      const combinedCategories: Record<string, number> = {}
      Object.values(categoriesByMood).forEach((moodCats) => {
        Object.entries(moodCats).forEach(([category, count]) => {
          combinedCategories[category] = (combinedCategories[category] || 0) + count
        })
      })
      return Object.entries(combinedCategories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    } else {
      // Show categories for selected mood
      const moodCats = categoriesByMood[selectedMood] || {}
      return Object.entries(moodCats)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    }
  }

  const categoryData = getCategoryData()

  // Prepare word cloud data
  const getWordCloudData = () => {
    if (selectedMood === "all") {
      // Combine all moods
      const allWords: Array<{ text: string; value: number }> = []
      Object.values(wordsByMood).forEach((moodWords) => {
        moodWords.forEach((word) => {
          const existingWord = allWords.find((w) => w.text === word.text)
          if (existingWord) {
            existingWord.value += word.value
          } else {
            allWords.push({ ...word })
          }
        })
      })
      return allWords.sort((a, b) => b.value - a.value).slice(0, 20)
    } else {
      // Show words for selected mood
      return wordsByMood[selectedMood] || []
    }
  }

  const wordCloudData = getWordCloudData()

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="words">Common Words</TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mood Insights</CardTitle>
              <CardDescription>Patterns detected in your mood notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Mood Distribution</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={moodDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {moodDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.mood as keyof typeof MOOD_COLORS]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number, name: string) => [`${value} entries`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Key Insights</h3>
                  <ul className="space-y-2">
                    {insights.map((insight, index) => (
                      <li key={index} className="bg-blue-50 p-3 rounded-md text-sm">
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Topic Categories</CardTitle>
              <CardDescription>What topics appear in your mood notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Filter by mood:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedMood("all")}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedMood === "all"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    All Moods
                  </button>
                  {Object.keys(wordsByMood).map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={`px-3 py-1 rounded-full text-sm flex items-center ${
                        selectedMood === mood
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      <span className="mr-1">{mood}</span>
                      <span>{getMoodName(mood)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip formatter={(value: number) => [`${value} mentions`]} />
                    <Bar
                      dataKey="value"
                      fill={selectedMood !== "all" ? MOOD_COLORS[selectedMood as keyof typeof MOOD_COLORS] : "#3182ce"}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="words">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Common Words</CardTitle>
              <CardDescription>Words that appear most frequently in your notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Filter by mood:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedMood("all")}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedMood === "all"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    All Moods
                  </button>
                  {Object.keys(wordsByMood).map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={`px-3 py-1 rounded-full text-sm flex items-center ${
                        selectedMood === mood
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      <span className="mr-1">{mood}</span>
                      <span>{getMoodName(mood)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {wordCloudData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={wordCloudData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="text" width={80} />
                      <Tooltip formatter={(value: number) => [`${value} mentions`]} />
                      <Bar
                        dataKey="value"
                        fill={
                          selectedMood !== "all" ? MOOD_COLORS[selectedMood as keyof typeof MOOD_COLORS] : "#3182ce"
                        }
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No common words found for this mood</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
