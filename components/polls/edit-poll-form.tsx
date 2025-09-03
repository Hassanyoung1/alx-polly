"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createPollSchema, type CreatePollFormData } from "@/lib/schemas"
import { updatePollAction, deletePollAction } from "@/lib/actions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Poll } from "@/types"

interface EditPollFormProps {
  poll: Poll
}

export function EditPollForm({ poll }: EditPollFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreatePollFormData>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      title: poll.title,
      description: poll.description || "",
      options: poll.options?.map(opt => opt.text) || ["", ""],
      expiresAt: poll.expires_at ? new Date(poll.expires_at).toISOString().slice(0, 16) : ""
    }
  })

  const watchedOptions = watch("options")

  const addOption = () => {
    const currentOptions = watch("options")
    setValue("options", [...currentOptions, ""])
  }

  const removeOption = (index: number) => {
    const currentOptions = watch("options")
    if (currentOptions.length > 2) {
      setValue("options", currentOptions.filter((_, i) => i !== index))
    }
  }

  const onSubmit = async (data: CreatePollFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Create FormData for the server action
      const formData = new FormData()
      formData.append("title", data.title)
      if (data.description) {
        formData.append("description", data.description)
      }
      data.options.forEach(option => {
        formData.append("options", option)
      })
      if (data.expiresAt && data.expiresAt.trim() !== "") {
        formData.append("expiresAt", data.expiresAt)
      }

      const result = await updatePollAction(poll.id, formData)

      if (result.success) {
        router.push(`/polls/${poll.id}`)
        router.refresh()
      } else {
        setError(result.error || "Failed to update poll")
      }
    } catch (error) {
      setError("An unexpected error occurred")
      console.error("Error updating poll:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await deletePollAction(poll.id)

      if (result.success) {
        router.push("/polls")
        router.refresh()
      } else {
        setError(result.error || "Failed to delete poll")
      }
    } catch (error) {
      setError("An unexpected error occurred")
      console.error("Error deleting poll:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const totalVotes = poll.votes?.length || 0
  const hasVotes = totalVotes > 0

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Poll</h1>
          <div className="text-sm text-muted-foreground">
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </div>
        </div>

        {hasVotes && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-700 text-sm">
              ⚠️ This poll has {totalVotes} vote{totalVotes !== 1 ? 's' : ''}. 
              Editing options will reset all votes.
            </p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Poll Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="What would you like to ask?"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Add more context to your poll..."
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>Poll Options *</Label>
            {watchedOptions.map((_, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  {...register(`options.${index}`)}
                  placeholder={`Option ${index + 1}`}
                />
                {watchedOptions.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeOption(index)}
                    className="px-3"
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            {errors.options && (
              <p className="text-red-500 text-sm">{errors.options.message}</p>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              className="w-full"
            >
              + Add Option
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiration Date (optional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              {...register("expiresAt")}
              min={new Date().toISOString().slice(0, 16)}
            />
            {errors.expiresAt && (
              <p className="text-red-500 text-sm">{errors.expiresAt.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Updating Poll..." : "Update Poll"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={() => router.push(`/polls/${poll.id}`)}
            >
              Cancel
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                Once you delete a poll, there is no going back. Please be certain.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
            >
              Delete Poll
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Delete Poll</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Are you sure you want to delete &quot;{poll.title}&quot;? This action cannot be undone.
                  {hasVotes && ` This will also delete ${totalVotes} vote${totalVotes !== 1 ? 's' : ''}.`}
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
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Card>
  )
}
