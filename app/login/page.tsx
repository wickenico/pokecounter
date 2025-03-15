"use client"

import React from "react"
import { login, signup } from "./actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
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
        <div className="flex flex-1 flex-col p-8">
          {/* (Optional) top-right nav or link */}
          <div className="flex w-full justify-end">
            {/* <Button variant="link" href="/somewhere">Register</Button> */}
          </div>

          {/* Centered form */}
          <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center">
            <form className="w-full max-w-sm space-y-6">
              <h2 className="text-2xl font-bold">Sign in to your account</h2>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Button calls the login action */}
                <Button type="submit" formAction={login} className="cursor-pointer">
                  Log in
                </Button>

                {/* Button calls the signup action */}
                <Button variant="outline" formAction={signup} className="cursor-pointer">
                  Sign up
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
  )
}
