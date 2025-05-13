"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthForm() {
  const [isBetaMode, setIsBetaMode] = useState(false)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user is in beta test mode
  const isUserInBetaMode = () => {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('beta-test-mode='))
    return cookie ? cookie.split('=')[1] === 'true' : false
  }

  // Simplified auth handler for beta test
  const handleAuth = async () => {
    try {
      // Create a temporary session for beta testing
      document.cookie = 'beta-test-mode=true; path=/; max-age=3600'; // Cookie expires in 1 hour
      // Clear any existing session
      document.cookie = 'supabase.auth.token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Beta Test Mode</CardTitle>
        <CardDescription>
          Welcome to the beta test mode! You can use this mode to test the application without creating an account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={handleAuth}
            className="w-full"
          >
            Enter Beta Test Mode
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            This session will expire in 1 hour. You can refresh the page to extend it.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
