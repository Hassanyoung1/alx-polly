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
  console.log('🔧 PollActions rendered for:', { pollId, pollTitle, isActive })
  
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
    console.log('🗑️ Actual delete triggered!', { pollId })
    e.preventDefault()
    e.stopPropagation()
    
    setIsDeleting(true)
    try {
      console.log('🗑️ Calling deletePollAction...')
      const result = await deletePollAction(pollId)
      console.log('🗑️ Delete result:', result)
      if (result.success) {
        toast.success("Poll deleted successfully!")
        router.refresh()
        onAction?.()
      } else {
        toast.error(result.error || "Failed to delete poll")
        console.error("Delete poll error:", result.error)
      }
    } catch (error) {
      console.error("Error deleting poll:", error)
      toast.error("An unexpected error occurred while deleting the poll")
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
        toast.success(`Poll ${!isActive ? 'activated' : 'deactivated'} successfully!`)
        router.refresh()
        onAction?.()
      } else {
        toast.error(result.error || "Failed to toggle poll status")
        console.error("Toggle poll status error:", result.error)
      }
    } catch (error) {
      console.error("Error toggling poll status:", error)
      toast.error("An unexpected error occurred while updating the poll")
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
    console.log('🗑️ Delete button clicked!', { pollId, pollTitle })
    e.preventDefault()
    e.stopPropagation()
    console.log('🗑️ Event prevented and stopped')
    setShowDeleteConfirm(true)
    console.log('🗑️ Confirmation dialog should show')
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
          onClick={(e) => {
            console.log('🗑️ Raw delete button clicked!')
            handleDeleteClick(e)
          }}
          className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          title="Delete poll"
          style={{ backgroundColor: '#fee2e2', border: '1px solid #dc2626' }}
        >
          🗑️
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[9999]"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            <h3 className="text-lg font-medium mb-4" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              Delete Poll
            </h3>
            <p className="text-sm text-muted-foreground mb-6" style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              Are you sure you want to delete &quot;{pollTitle}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1"
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
              <Button
                variant="outline"
                onClick={(e) => {
                  console.log('🗑️ Cancel button clicked')
                  e.stopPropagation()
                  setShowDeleteConfirm(false)
                }}
                disabled={isDeleting}
                className="flex-1"
                style={{
                  backgroundColor: 'white',
                  color: '#333',
                  border: '1px solid #ccc',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
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
