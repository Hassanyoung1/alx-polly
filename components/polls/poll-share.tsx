"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Poll } from "@/types"

// QR Code component using qrcode-generator
function QRCodeCanvas({ value, size = 200 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return

    try {
      // Dynamic import for client-side only
      import('qrcode-generator').then((QRCode) => {
        const qr = QRCode.default(0, 'M')
        qr.addData(value)
        qr.make()

        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!
        
        const moduleCount = qr.getModuleCount()
        const cellSize = size / moduleCount
        const margin = 0

        canvas.width = size + margin * 2
        canvas.height = size + margin * 2

        // White background
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Black modules
        ctx.fillStyle = '#000000'
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (qr.isDark(row, col)) {
              ctx.fillRect(
                margin + col * cellSize,
                margin + row * cellSize,
                cellSize,
                cellSize
              )
            }
          }
        }
      })
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }, [value, size])

  return <canvas ref={canvasRef} className="border rounded" />
}

interface PollShareProps {
  poll: Poll
}

export function PollShare({ poll }: PollShareProps) {
  const [showQRCode, setShowQRCode] = useState(false)
  const pollUrl = typeof window !== "undefined" ? `${window.location.origin}/polls/${poll.id}` : ""

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl)
      toast.success("Poll link copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy link:", error)
      toast.error("Failed to copy link")
    }
  }

  const shareViaNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poll.title,
          text: poll.description || "Check out this poll!",
          url: pollUrl,
        })
      } catch (error) {
        console.error("Failed to share:", error)
        toast.error("Failed to share poll")
      }
    } else {
      // Fallback to copy link
      copyLink()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📤 Share Poll
          <Badge variant="outline">QR Code</Badge>
        </CardTitle>
        <CardDescription>
          Share this poll with others via link or QR code
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Poll Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Poll Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={pollUrl}
              readOnly
              className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
            />
            <Button onClick={copyLink} variant="outline" size="sm">
              📋 Copy
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={shareViaNative} 
            variant="default" 
            size="sm"
            className="flex-1"
          >
            📤 Share
          </Button>
          <Button 
            onClick={() => setShowQRCode(!showQRCode)} 
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            📱 QR Code
          </Button>
        </div>

        {/* QR Code Display */}
        {showQRCode && (
          <div className="text-center space-y-3 pt-4 border-t">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg border">
                <QRCodeCanvas 
                  value={pollUrl}
                  size={200}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Scan this QR code to access the poll
            </p>
          </div>
        )}

        {/* Poll Info */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p><strong>Poll:</strong> {poll.title}</p>
          {poll.description && <p><strong>Description:</strong> {poll.description}</p>}
          <p><strong>Status:</strong> {poll.is_active ? "Active" : "Inactive"}</p>
        </div>
      </CardContent>
    </Card>
  )
}
