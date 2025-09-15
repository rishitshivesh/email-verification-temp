import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw } from "lucide-react"

type VerificationState = "loading" | "success" | "error" | "expired" | "invalid"

export function VerificationHandler() {
  const [searchParams] = useSearchParams()
  const [state, setState] = useState<VerificationState>("loading")
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [isResending, setIsResending] = useState(false)

  const token = searchParams.get("token")
  const type = searchParams.get("type") // "login" or "signup"

  useEffect(() => {
    if (!token) {
      setState("invalid")
      setError("No verification token provided")
      return
    }

    verifyToken(token, type || "login")
  }, [token, type])

  const verifyToken = async (token: string, verificationType: string) => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, type: verificationType }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 410) {
          setState("expired")
          setError("This verification link has expired")
        } else {
          setState("error")
          setError(data.message || "Verification failed")
        }
        setEmail(data.email || "")
        return
      }

      setState("success")
      setEmail(data.email || "")

      // Redirect after successful verification
      if (verificationType === "login") {
        // Redirect to dashboard or intended page
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 2000)
      }
    } catch (err) {
      setState("error")
      setError("Network error. Please try again.")
    }
  }

  const handleResendVerification = async () => {
    if (!email) return

    setIsResending(true)
    try {
      const endpoint = type === "signup" ? "/api/auth/resend-signup" : "/api/auth/resend-login"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setState("loading")
        setError("")
      } else {
        const data = await response.json()
        setError(data.message || "Failed to resend verification")
      }
    } catch (err) {
      setError("Failed to resend verification")
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (state) {
      case "loading":
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Verifying...</h3>
              <p className="text-sm text-muted-foreground">Please wait while we verify your request</p>
            </div>
          </div>
        )

      case "success":
        return (
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {type === "signup" ? "Account verified!" : "Successfully signed in!"}
              </h3>
              <p className="text-sm text-muted-foreground text-balance">
                {type === "signup"
                  ? "Your account has been verified. You can now sign in."
                  : "You're being redirected to your dashboard..."}
              </p>
            </div>
            {type === "signup" && (
              <Button asChild className="w-full">
                <Link to="/">
                  Continue to sign in
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        )

      case "expired":
      case "error":
      case "invalid":
        return (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Verification failed</h3>
                <p className="text-sm text-muted-foreground text-balance">
                  {state === "expired"
                    ? "This verification link has expired. Please request a new one."
                    : state === "invalid"
                      ? "This verification link is invalid or has already been used."
                      : "Something went wrong during verification."}
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              {email && (state === "expired" || state === "error") && (
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Send new verification link
                    </>
                  )}
                </Button>
              )}

              <Button variant="ghost" asChild className="w-full">
                <Link to="/">Back to sign in</Link>
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl font-semibold">Email Verification</CardTitle>
        <CardDescription>
          {state === "loading" ? "Processing your verification request" : "Verification status"}
        </CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  )
}
