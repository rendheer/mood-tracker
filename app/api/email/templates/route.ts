import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = createClient()
  
  try {
    // Get all email templates
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('*')

    if (error) throw error
    
    return NextResponse.json(templates)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createClient()
  const body = await request.json()

  try {
    // Create a new email template
    const { data, error } = await supabase
      .from('email_templates')
      .insert([body])
      .select()
      .single()

    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
  }
}
