import type React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Mail, ArrowRight, RefreshCw } from "lucide-react"

type ResendType = "login" | "signup" | "verification"

export function ResendForm() {
  const [email, setEmail] = useState("")
  const [type, setType] = useState<ResendType>("login")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const endpoint = getEndpointForType(type)
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to send email")
      }

      setIsEmailSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getEndpointForType = (type: ResendType) => {
    switch (type) {
      case "login":
        return "/api/auth/resend-login"
      case "signup":
        return "/api/auth/resend-signup"
      case "verification":
        return "/api/auth/resend-verification"
      default:
        return "/api/auth/resend-login"
    }
  }

  const getTypeDescription = (type: ResendType) => {
    switch (type) {
      case "login":
        return "Send a new magic login link"
      case "signup":
        return "Resend account verification email"
      case "verification":
        return "Resend email verification link"
      default:
        return "Send a new magic login link"
    }
  }

  const getSuccessMessage = (type: ResendType) => {
    switch (type) {
      case "login":
        return "We've sent a new magic login link to your email address."
      case "signup":
        return "We've resent the account verification email. Please check your inbox."
      case "verification":
        return "We've sent a new verification link to your email address."
      default:
        return "We've sent a new email to your address."
    }
  }

  if (isEmailSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Email sent!</h3>
          <p className="text-sm text-muted-foreground text-balance">
            {getSuccessMessage(type)} Please check your inbox at <strong>{email}</strong>.
          </p>
        </div>
        <div className="space-y-2">
          <Button variant="outline" onClick={() => setIsEmailSent(false)} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Send another email
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link to="/">Back to sign in</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">What type of email do you need?</Label>
          <RadioGroup value={type} onValueChange={(value) => setType(value as ResendType)} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="login" id="login" />
              <Label htmlFor="login" className="text-sm cursor-pointer">
                Magic login link
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="signup" id="signup" />
              <Label htmlFor="signup" className="text-sm cursor-pointer">
                Account verification email
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="verification" id="verification" />
              <Label htmlFor="verification" className="text-sm cursor-pointer">
                Email verification link
              </Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground">{getTypeDescription(type)}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 pl-10"
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full h-11" disabled={isLoading || !email}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending email...
          </>
        ) : (
          <>
            Send email
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground text-center text-balance">
        Make sure to check your spam folder if you don't see the email in your inbox.
      </div>
    </form>
  )
}
