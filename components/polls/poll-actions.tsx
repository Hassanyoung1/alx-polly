"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { deletePollAction, togglePollStatusAction } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface PollActionsProps {
  pollId: string
  pollTitle: string
  isActive: boolean
  onAction?: () => void
}

export function PollActions({ pollId, pollTitle, isActive, onAction }: PollActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsDeleting(true)
    try {
      const result = await deletePollAction(pollId)
      if (result.success) {
        router.refresh()
        onAction?.()
      }
    } catch (error) {
      console.error("Error deleting poll:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsToggling(true)
    try {
      const result = await togglePollStatusAction(pollId, !isActive)
      if (result.success) {
        router.refresh()
        onAction?.()
      }
    } catch (error) {
      console.error("Error toggling poll status:", error)
    } finally {
      setIsToggling(false)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/polls/${pollId}/edit`)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const pollUrl = `${window.location.origin}/polls/${pollId}`
    
    try {
      await navigator.clipboard.writeText(pollUrl)
      toast.success("Poll link copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy link:", error)
      toast.error("Failed to copy link")
    }
  }

  return (
    <>
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShareClick}
          className="h-7 px-2 text-xs"
          title="Share poll"
        >
          📤
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditClick}
          className="h-7 px-2 text-xs"
          title="Edit poll"
        >
          ✏️
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleStatus}
          disabled={isToggling}
          className="h-7 px-2 text-xs"
          title={isActive ? "Deactivate poll" : "Activate poll"}
        >
          {isToggling ? "..." : isActive ? "⏸️" : "▶️"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteClick}
          className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
          title="Delete poll"
        >
          🗑️
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Delete Poll</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete &quot;{pollTitle}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteConfirm(false)
                }}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
