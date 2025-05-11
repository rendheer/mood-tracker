"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import MoodNoteInput from "./mood-note-input"

interface MoodSelectorProps {
  onSelectMood: (mood: string, note?: string) => void
  selectedMood: string | null
  isDisabled?: boolean
}

export default function MoodSelector({ onSelectMood, selectedMood, isDisabled = false }: MoodSelectorProps) {
  const [note, setNote] = useState("")
  const [showNoteInput, setShowNoteInput] = useState(false)

  const moods = [
    { emoji: "🥰", label: "Very Happy" },
    { emoji: "😄", label: "Happy" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "😔", label: "Sad" },
    { emoji: "😢", label: "Very Sad" },
  ]

  const handleMoodClick = (mood: string) => {
    if (isDisabled) return

    if (selectedMood === mood) {
      // If clicking the same mood again, toggle note input
      setShowNoteInput(!showNoteInput)
    } else {
      // If selecting a new mood, show note input and set the mood
      setSelectedMood(mood)
      setShowNoteInput(true)
    }
  }

  const handleSubmitMood = () => {
    if (selectedMood) {
      onSelectMood(selectedMood, note)
      setNote("")
      setShowNoteInput(false)
    }
  }

  const setSelectedMood = (mood: string) => {
    if (!isDisabled) {
      onSelectMood(mood, undefined) // Just update the UI, don't submit yet
    }
  }

  return (
    <div className="py-4 space-y-6">
      <div className="flex flex-wrap justify-center gap-4">
        {moods.map((mood) => (
          <motion.button
            key={mood.emoji}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleMoodClick(mood.emoji)}
            className={`flex flex-col items-center p-4 rounded-xl transition-all ${
              selectedMood === mood.emoji ? "bg-blue-200 shadow-md" : "bg-white hover:bg-blue-50"
            } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isDisabled}
          >
            <span className="text-5xl mb-2">{mood.emoji}</span>
            <span className="text-sm font-medium text-gray-700">{mood.label}</span>
          </motion.button>
        ))}
      </div>

      {selectedMood && showNoteInput && (
        <div className="mt-4 max-w-md mx-auto">
          <MoodNoteInput
            onSaveNote={(newNote) => {
              setNote(newNote)
              handleSubmitMood()
            }}
            initialNote={note}
          />
        </div>
      )}
    </div>
  )
}
