"use client"

import AuthForm from "@/components/auth/auth-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default function BetaPage() {
  // Check for beta test mode cookie
  const isBetaMode = typeof window !== 'undefined' && document.cookie.split('; ').some(row => row.startsWith('beta-test-mode=true'))
  
  if (isBetaMode) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-700">Journal My Mind</CardTitle>
            <CardDescription>Enter beta test mode to explore the application</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
