"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PenLine, ChevronDown, ChevronUp } from "lucide-react"

interface MoodHistoryProps {
  history: Array<{ mood: string; timestamp: Date; note?: string; id?: string }>
  onEditNote?: (id: string, note: string) => Promise<void>
}

export default function MoodHistory({ history, onEditNote }: MoodHistoryProps) {
  const [viewAll, setViewAll] = useState(false)
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())

  const displayHistory = viewAll ? history : history.slice(-5).reverse()

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const toggleExpand = (id: string) => {
    setExpandedEntries((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <div className="py-2">
      <div className="space-y-3">
        {displayHistory.map((entry, index) => {
          const entryId = entry.id || `entry-${index}`
          const isExpanded = expandedEntries.has(entryId)

          return (
            <div key={entryId} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{entry.mood}</span>
                  <span className="text-sm text-gray-500">{formatTime(entry.timestamp)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {entry.note && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleExpand(entryId)}>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="sr-only">{isExpanded ? "Collapse note" : "Expand note"}</span>
                    </Button>
                  )}

                  {onEditNote && entry.id && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <PenLine className="h-4 w-4 text-gray-500" />
                          <span className="sr-only">Edit note</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Mood Note</DialogTitle>
                        </DialogHeader>
                        <MoodNoteEditor id={entry.id} initialNote={entry.note || ""} onSave={onEditNote} />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              {entry.note && isExpanded && (
                <div className="px-4 pb-3 pt-0">
                  <div className="border-t pt-2 text-sm text-gray-700 whitespace-pre-wrap">{entry.note}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {history.length > 5 && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={() => setViewAll(!viewAll)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            {viewAll ? "Show Recent" : `Show All (${history.length})`}
          </Button>
        </div>
      )}
    </div>
  )
}

function MoodNoteEditor({
  id,
  initialNote,
  onSave,
}: { id: string; initialNote: string; onSave: (id: string, note: string) => Promise<void> }) {
  const [note, setNote] = useState(initialNote)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(id, note)
    } catch (error) {
      console.error("Error saving note:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What influenced your mood?"
        className="min-h-[150px]"
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}

import { Textarea } from "@/components/ui/textarea"
