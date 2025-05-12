import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    const supabase = createClient()
    
    // Send email using Supabase's built-in email functionality
    const { error } = await supabase.auth.admin.sendEmail({
      to,
      subject,
      html,
      text,
    })

    if (error) throw error
    
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function sendVerificationEmail(email: string) {
  try {
    const supabase = createClient()
    
    // Send verification email
    const { error } = await supabase.auth.admin.sendVerificationEmail(email)
    
    if (error) throw error
    
    return { success: true }
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw error
  }
}
