"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { PenLine, X } from "lucide-react"

interface MoodNoteInputProps {
  onSaveNote: (note: string) => void
  initialNote?: string
  placeholder?: string
}

export default function MoodNoteInput({
  onSaveNote,
  initialNote = "",
  placeholder = "What's influencing your mood today?",
}: MoodNoteInputProps) {
  const [isExpanded, setIsExpanded] = useState(!!initialNote)
  const [note, setNote] = useState(initialNote)

  const handleSave = () => {
    onSaveNote(note)
    if (!note) {
      setIsExpanded(false)
    }
  }

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 hover:border-blue-300"
        onClick={() => setIsExpanded(true)}
      >
        <PenLine size={16} />
        <span>Add a note about your mood</span>
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="mood-note" className="text-sm font-medium text-gray-700">
          What's influencing your mood?
        </label>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          onClick={() => {
            setNote("")
            setIsExpanded(false)
          }}
        >
          <X size={16} />
          <span className="sr-only">Cancel</span>
        </Button>
      </div>
      <Textarea
        id="mood-note"
        placeholder={placeholder}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="min-h-[100px] resize-none"
      />
      <Button onClick={handleSave} size="sm" className="mt-2">
        Save Note
      </Button>
    </div>
  )
}
