'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/utils/supabase/server'

interface AuthResult {
  error?: string
  success?: boolean
}

export async function login(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // Anstatt zu redirecten, geben wir das Fehlerobjekt zurück
    return { error: error.message }
  }

  revalidatePath('/components', 'layout')
  return { success: true }
}

export async function signup(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient()
  const email = formData.get("email") as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: '/password-reset'
  })

  if (error) {
    return { error: error.message }
  }
  return { success: true }
}
