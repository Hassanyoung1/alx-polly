"use client"

import { useState } from "react"
import { CreatePollRequest } from "@/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CreatePollFormProps {
  onSubmit: (pollData: CreatePollRequest) => Promise<void>
}

export function CreatePollForm({ onSubmit }: CreatePollFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    expiresAt: "",
  })
  const [options, setOptions] = useState(["", ""])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validOptions = options.filter(option => option.trim() !== "")
    if (validOptions.length < 2) {
      alert("Please provide at least 2 options")
      return
    }

    setIsSubmitting(true)
    try {
      const pollData: CreatePollRequest = {
        title: formData.title,
        description: formData.description || undefined,
        options: validOptions,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
      }
      await onSubmit(pollData)
    } catch (error) {
      console.error("Failed to create poll:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addOption = () => {
    setOptions([...options, ""])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  return (
    <Card>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Poll</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Poll Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="What would you like to ask?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Add more context to your poll..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label>Poll Options *</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                {options.length > 2 && (
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
              value={formData.expiresAt}
              onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating Poll..." : "Create Poll"}
            </Button>
            <Button type="button" variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
