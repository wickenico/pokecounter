"use client"

import React, { useState } from "react"
import { login, signup, resetPassword } from "./actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    if (result.error) {
      setError(`Login fehlgeschlagen: ${result.error}`)
    } else {
      router.push("/")
    }
  }

  const handleSignup = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const formData = new FormData()
    formData.set("email", email)
    formData.set("password", password)
    const result = await signup(formData)
    if (result.error) {
      setError(`Signup fehlgeschlagen: ${result.error}`)
    } else {
      router.push("/")
    }
  }

  const handleForgotPassword = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (!email) {
      setError("Bitte gib deine Email-Adresse ein, um das Passwort zurückzusetzen.")
      return
    }
    const formData = new FormData()
    formData.set("email", email)
    const result = await resetPassword(formData)
    if (result.error) {
      setError(`Passwort zurücksetzen fehlgeschlagen: ${result.error}`)
    } else {
      setMessage("Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet.")
    }
  }

  return (
      <div className="flex min-h-screen">
        {/* Linke Seite mit login.png als Hintergrund */}
        <div className="relative hidden w-1/2 md:flex">
          <img
              src="/login.png"
              alt="Login illustration"
              className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* Rechte Seite (Login-Form) */}
        <div className="flex flex-1 flex-col p-8 items-center justify-center bg-gray-100">
          {/* Zentrale Überschrift */}
          <h1 className="text-4xl font-bold mb-8">Pokecounter</h1>
          <div className="w-full max-w-md">
            <form className="space-y-6 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleLogin}>
              <h2 className="text-2xl font-bold text-center">Melde dich an</h2>

              {error && <p className="text-red-500 text-center">{error}</p>}
              {message && <p className="text-green-500 text-center">{message}</p>}

              <div>
                <Label htmlFor="email" className="mb-1">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="password" className="mb-1">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-center space-x-4">
                <Button type="submit" className="cursor-pointer">
                  Log in
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleSignup}
                    className="cursor-pointer"
                >
                  Sign up
                </Button>
              </div>

              <div className="text-center">
                <Button type="button" variant="link" onClick={handleForgotPassword}>
                  Passwort vergessen?
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
  )
}
