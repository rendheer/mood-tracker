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
    
    // Send email using Supabase's email service
    const { error } = await supabase.auth.sendEmail({
      to,
      subject,
      html,
      text,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
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
    
    // Send verification email using Supabase's auth service
    const { error } = await supabase.auth.signUp({
      email,
      password: 'temp_password', // Temporary password for verification
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    })
    
    if (error) throw error
    
    return { success: true }
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw error
  }
}
