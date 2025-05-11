"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Calendar, FlameIcon as Fire, Award, Star } from "lucide-react"

interface MoodStreakProps {
  history: Array<{ mood: string; timestamp: Date }>
}

export default function MoodStreak({ history }: MoodStreakProps) {
  const [currentStreak, setCurrentStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [nextMilestone, setNextMilestone] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (history.length === 0) {
      setCurrentStreak(0)
      setLongestStreak(0)
      return
    }

    // Calculate streaks based on history
    const { current, longest } = calculateStreaks(history)
    setCurrentStreak(current)
    setLongestStreak(longest)

    // Set next milestone and progress
    const milestones = [3, 7, 14, 21, 30, 60, 90, 180, 365]
    const next = milestones.find((m) => m > current) || current + 7
    setNextMilestone(next)
    setProgress(Math.min(100, (current / next) * 100))
  }, [history])

  // No streak to display yet
  if (currentStreak === 0) {
    return (
      <Card className="border-none bg-white/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Start your streak today!</span>
            </div>
            <span className="text-sm text-gray-500">Log your mood daily to build a streak</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Streak Card */}
        <Card className="border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Fire className="h-5 w-5 text-orange-500" />
                <h3 className="font-medium text-gray-700">Current Streak</h3>
              </div>
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
              >
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-blue-600">{currentStreak}</span>
                  <span className="text-sm text-gray-500">days</span>
                </div>
              </motion.div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Next milestone: {nextMilestone} days</span>
                <span className="font-medium text-blue-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {getStreakMessage(currentStreak)}
          </CardContent>
        </Card>

        {/* Achievements Card */}
        <Card className="border-none bg-gradient-to-br from-purple-50 to-pink-50 shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h3 className="font-medium text-gray-700">Achievements</h3>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-purple-600">{getAchievementCount(longestStreak)}</span>
                <span className="text-sm text-gray-500">unlocked</span>
              </div>
            </div>

            <div className="space-y-3">{renderAchievements(longestStreak)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Longest Streak Display */}
      {longestStreak > currentStreak && (
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 rounded-full mx-auto w-fit">
          <Award className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            Your longest streak: <span className="text-blue-600 font-bold">{longestStreak} days</span>
          </span>
        </div>
      )}
    </div>
  )
}

// Helper function to calculate current and longest streaks
function calculateStreaks(history: Array<{ mood: string; timestamp: Date }>) {
  if (history.length === 0) return { current: 0, longest: 0 }

  // Sort history by date (newest first)
  const sortedHistory = [...history].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  // Get unique dates (in YYYY-MM-DD format) to count only one mood entry per day
  const uniqueDates = new Set<string>()
  sortedHistory.forEach((entry) => {
    const date = new Date(entry.timestamp)
    uniqueDates.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`)
  })

  // Convert back to array and sort (newest first)
  const dates = Array.from(uniqueDates)
    .map((dateStr) => {
      const [year, month, day] = dateStr.split("-").map(Number)
      return new Date(year, month, day)
    })
    .sort((a, b) => b.getTime() - a.getTime())

  // Calculate current streak
  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Check if logged today or yesterday to maintain streak
  const mostRecentDate = dates[0]
  const mostRecentDay = new Date(mostRecentDate)
  mostRecentDay.setHours(0, 0, 0, 0)

  // If most recent log is not from today or yesterday, streak is broken
  if (!(mostRecentDay.getTime() === today.getTime() || mostRecentDay.getTime() === yesterday.getTime())) {
    return { current: 0, longest: calculateLongestStreak(dates) }
  }

  // Calculate current streak by checking consecutive days
  let checkDate = mostRecentDay
  const streakDates = new Set<string>()

  // Add the most recent day to the streak
  streakDates.add(`${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`)
  currentStreak = 1

  // Check previous days
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(checkDate)
    prevDate.setDate(prevDate.getDate() - 1)

    const dateToCheck = new Date(dates[i])
    dateToCheck.setHours(0, 0, 0, 0)

    // If the date is the previous day, continue the streak
    if (dateToCheck.getTime() === prevDate.getTime()) {
      streakDates.add(`${dateToCheck.getFullYear()}-${dateToCheck.getMonth()}-${dateToCheck.getDate()}`)
      currentStreak++
      checkDate = dateToCheck
    } else {
      // Break in the streak
      break
    }
  }

  // Calculate longest streak
  const longest = Math.max(currentStreak, calculateLongestStreak(dates))

  return { current: currentStreak, longest }
}

// Helper function to calculate the longest streak
function calculateLongestStreak(dates: Date[]) {
  if (dates.length === 0) return 0

  let longestStreak = 1
  let currentStreak = 1

  for (let i = 0; i < dates.length - 1; i++) {
    const currentDate = new Date(dates[i])
    currentDate.setHours(0, 0, 0, 0)

    const nextDate = new Date(dates[i + 1])
    nextDate.setHours(0, 0, 0, 0)

    const expectedPrevDate = new Date(currentDate)
    expectedPrevDate.setDate(expectedPrevDate.getDate() - 1)

    if (nextDate.getTime() === expectedPrevDate.getTime()) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return longestStreak
}

// Helper function to get motivational message based on streak length
function getStreakMessage(streak: number) {
  if (streak === 1) {
    return (
      <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
        Great start! Come back tomorrow to continue your streak.
      </div>
    )
  } else if (streak < 3) {
    return (
      <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded-md">You're building momentum! Keep going!</div>
    )
  } else if (streak < 7) {
    return (
      <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
        Impressive! You're developing a healthy habit.
      </div>
    )
  } else if (streak < 14) {
    return (
      <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
        A week-long streak! You're committed to your wellbeing.
      </div>
    )
  } else if (streak < 30) {
    return (
      <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
        Amazing dedication! You're making mood tracking a part of your routine.
      </div>
    )
  } else {
    return (
      <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
        Incredible! Your consistency is truly inspiring.
      </div>
    )
  }
}

// Helper function to count achievements based on longest streak
function getAchievementCount(streak: number) {
  const milestones = [1, 3, 7, 14, 30, 60, 90, 180, 365]
  return milestones.filter((m) => streak >= m).length
}

// Helper function to render achievement badges
function renderAchievements(streak: number) {
  const achievements = [
    {
      days: 1,
      name: "First Step",
      icon: <Star className="h-4 w-4 text-blue-500" />,
      color: "bg-blue-100 text-blue-700",
    },
    {
      days: 3,
      name: "Three-Day Streak",
      icon: <Fire className="h-4 w-4 text-orange-500" />,
      color: "bg-orange-100 text-orange-700",
    },
    {
      days: 7,
      name: "One Week Warrior",
      icon: <Calendar className="h-4 w-4 text-green-500" />,
      color: "bg-green-100 text-green-700",
    },
    {
      days: 14,
      name: "Two Week Triumph",
      icon: <Award className="h-4 w-4 text-purple-500" />,
      color: "bg-purple-100 text-purple-700",
    },
    {
      days: 30,
      name: "Monthly Master",
      icon: <Trophy className="h-4 w-4 text-yellow-500" />,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      days: 60,
      name: "Dedicated Tracker",
      icon: <Star className="h-4 w-4 text-pink-500" />,
      color: "bg-pink-100 text-pink-700",
    },
    {
      days: 90,
      name: "Quarterly Champion",
      icon: <Award className="h-4 w-4 text-indigo-500" />,
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      days: 180,
      name: "Half-Year Hero",
      icon: <Trophy className="h-4 w-4 text-emerald-500" />,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      days: 365,
      name: "Year-Long Legend",
      icon: <Fire className="h-4 w-4 text-red-500" />,
      color: "bg-red-100 text-red-700",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-2">
      {achievements.map((achievement) => (
        <div
          key={achievement.days}
          className={`flex items-center gap-2 p-2 rounded-md ${
            streak >= achievement.days ? achievement.color : "bg-gray-100 text-gray-400"
          } transition-all`}
        >
          <div className={`${streak >= achievement.days ? "opacity-100" : "opacity-50"}`}>{achievement.icon}</div>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${streak >= achievement.days ? "" : "text-gray-400"}`}>
              {achievement.name}
            </span>
            <span className="text-xs">
              {streak >= achievement.days
                ? "Unlocked!"
                : `${achievement.days - Math.min(streak, achievement.days)} days to go`}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
