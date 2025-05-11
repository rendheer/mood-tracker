import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function Home() {
  const supabase = createClient()

  // Check if user is already logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-5xl font-bold text-blue-700">Journal My Mind</h1>
        <p className="text-xl text-gray-700">
          Journal your emotions, get personalized insights, and improve your well-being
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/login">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            <Link href="/login?tab=register">Create Account</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Track Your Moods</h3>
            <p className="text-gray-600">Log your daily emotions and build a history of your mental well-being</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-lg font-semibold mb-2">Get Suggestions</h3>
            <p className="text-gray-600">Receive personalized recommendations to improve your mood</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🔥</div>
            <h3 className="text-lg font-semibold mb-2">Build Streaks</h3>
            <p className="text-gray-600">Stay consistent with your mood tracking and build healthy habits</p>
          </div>
        </div>
      </div>
    </main>
  )
}
