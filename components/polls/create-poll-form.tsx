"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createPollSchema, type CreatePollFormData } from "@/lib/schemas"
import { createPollAction } from "@/lib/actions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export function CreatePollForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<CreatePollFormData>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      title: "",
      description: "",
      options: ["", ""],
      expiresAt: ""
    }
  })

  const watchedOptions = watch("options")

  // Set a default expiration time (24 hours from now)
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setHours(tomorrow.getHours() + 24)
    
    // Format for datetime-local input (YYYY-MM-DDTHH:mm)
    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const day = String(tomorrow.getDate()).padStart(2, '0')
    const hours = String(tomorrow.getHours()).padStart(2, '0')
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0')
    
    const defaultExpiration = `${year}-${month}-${day}T${hours}:${minutes}`
    setValue("expiresAt", defaultExpiration)
  }, [setValue])

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

      const result = await createPollAction(formData)

      if (result.success && result.data) {
        reset()
        router.push(`/polls/${result.data.id}`)
      } else {
        setError(result.error || "Failed to create poll")
      }
    } catch (error) {
      setError("An unexpected error occurred")
      console.error("Error creating poll:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Poll</h1>
        
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
              {isSubmitting ? "Creating Poll..." : "Create Poll"}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
