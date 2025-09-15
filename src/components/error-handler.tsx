import { Link, useSearchParams } from "react-router-dom"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { XCircle, RefreshCw, ArrowLeft, Mail, AlertTriangle } from "lucide-react"

export function ErrorHandler() {
  const [searchParams] = useSearchParams()

  const type = searchParams.get("type") || "default"
  const message = searchParams.get("message")
  const email = searchParams.get("email")

  const getErrorConfig = (type: string) => {
    switch (type) {
      case "verification-failed":
        return {
          title: "Verification Failed",
          description: "We couldn't verify your email address.",
          message:
            message || "The verification link is invalid or has expired. Please request a new verification email.",
          icon: XCircle,
          iconColor: "text-red-600 dark:text-red-400",
          iconBg: "bg-red-100 dark:bg-red-900/20",
          showResend: true,
          primaryAction: { text: "Request New Link", href: "/signup" },
          secondaryAction: { text: "Back to Sign In", href: "/" },
        }

      case "login-failed":
        return {
          title: "Sign In Failed",
          description: "We couldn't sign you in.",
          message: message || "The login link is invalid or has expired. Please request a new login link.",
          icon: XCircle,
          iconColor: "text-red-600 dark:text-red-400",
          iconBg: "bg-red-100 dark:bg-red-900/20",
          showResend: true,
          primaryAction: { text: "Try Again", href: "/" },
          secondaryAction: { text: "Create Account", href: "/signup" },
        }

      case "expired":
        return {
          title: "Link Expired",
          description: "This link is no longer valid.",
          message: message || "This link has expired for security reasons. Please request a new one.",
          icon: AlertTriangle,
          iconColor: "text-amber-600 dark:text-amber-400",
          iconBg: "bg-amber-100 dark:bg-amber-900/20",
          showResend: true,
          primaryAction: { text: "Get New Link", href: "/" },
          secondaryAction: null,
        }

      case "rate-limit":
        return {
          title: "Too Many Requests",
          description: "Please wait before trying again.",
          message: message || "You've made too many requests. Please wait a few minutes before trying again.",
          icon: AlertTriangle,
          iconColor: "text-amber-600 dark:text-amber-400",
          iconBg: "bg-amber-100 dark:bg-amber-900/20",
          showResend: false,
          primaryAction: { text: "Back to Sign In", href: "/" },
          secondaryAction: null,
        }

      case "network":
        return {
          title: "Connection Error",
          description: "Unable to connect to our servers.",
          message: message || "Please check your internet connection and try again.",
          icon: RefreshCw,
          iconColor: "text-blue-600 dark:text-blue-400",
          iconBg: "bg-blue-100 dark:bg-blue-900/20",
          showResend: false,
          primaryAction: { text: "Try Again", href: "#", onClick: () => window.location.reload() },
          secondaryAction: { text: "Back to Sign In", href: "/" },
        }

      default:
        return {
          title: "Something Went Wrong",
          description: "An unexpected error occurred.",
          message:
            message ||
            "We're sorry, but something went wrong. Please try again or contact support if the problem persists.",
          icon: XCircle,
          iconColor: "text-red-600 dark:text-red-400",
          iconBg: "bg-red-100 dark:bg-red-900/20",
          showResend: false,
          primaryAction: { text: "Try Again", href: "/" },
          secondaryAction: { text: "Contact Support", href: "/support" },
        }
    }
  }

  const config = getErrorConfig(type)
  const IconComponent = config.icon

  const isInternalLink = (href: string | undefined) => !!href && href.startsWith("/")

  const renderPrimaryAction = () => {
    if (config.primaryAction.onClick) {
      return (
        <Button onClick={config.primaryAction.onClick} className="w-full">
          {config.primaryAction.text}
        </Button>
      )
    }

    if (isInternalLink(config.primaryAction.href)) {
      return (
        <Button asChild className="w-full">
          <Link to={config.primaryAction.href!}>{config.primaryAction.text}</Link>
        </Button>
      )
    }

    return (
      <Button asChild className="w-full">
        <a href={config.primaryAction.href}>{config.primaryAction.text}</a>
      </Button>
    )
  }

  const renderSecondaryAction = () => {
    if (!config.secondaryAction) return null

    const content = (
      <>
        <ArrowLeft className="w-4 h-4 mr-2" />
        {config.secondaryAction.text}
      </>
    )

    if (isInternalLink(config.secondaryAction.href)) {
      return (
        <Button variant="ghost" asChild className="w-full">
          <Link to={config.secondaryAction.href!}>{content}</Link>
        </Button>
      )
    }

    return (
      <Button variant="ghost" asChild className="w-full">
        <a href={config.secondaryAction.href}>{content}</a>
      </Button>
    )
  }

  const handleResendEmail = async () => {
    if (!email) return

    try {
      // This would call your resend API
      const response = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      })

      if (response.ok) {
        window.location.href = `/success?type=email-sent&email=${encodeURIComponent(email)}`
      }
    } catch (error) {
      console.error("Failed to resend email:", error)
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl font-semibold">{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center space-y-4">
            <div className={`mx-auto w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center`}>
              <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-balance">{config.message}</p>
            </div>
          </div>

          {message && message !== config.message && (
            <Alert variant="destructive">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {config.showResend && email && (
              <Button onClick={handleResendEmail} variant="outline" className="w-full bg-transparent">
                <Mail className="w-4 h-4 mr-2" />
                Resend to {email}
              </Button>
            )}

            {renderPrimaryAction()}

            {renderSecondaryAction()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
