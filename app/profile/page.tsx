"use client"

import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-lg">{user.user_metadata?.full_name || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <p className="text-lg">{user.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                    {user.email_confirmed_at ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                <p className="text-lg">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
            <div className="flex gap-4">
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
