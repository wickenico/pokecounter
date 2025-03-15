"use client"

import { login, signup } from "./actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side (brand & testimonial) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-neutral-900 p-8 text-neutral-50 md:flex">
        <div className="text-xl font-bold">Acme Inc</div>

        <blockquote className="flex-1 flex items-center justify-center text-center px-4">
          <p className="text-lg italic">
            “This library has saved me countless hours of work and helped me
            deliver stunning designs to my clients faster than ever before.”
          </p>
        </blockquote>

        <div className="text-right">Sofia Davis</div>
      </div>

      {/* Right side (login form) */}
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
              <Button type="submit" formAction={login}>
                Log in
              </Button>

              {/* Button calls the signup action */}
              <Button variant="outline" formAction={signup}>
                Sign up
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
