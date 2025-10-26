import { Link, useSearchParams } from "react-router-dom"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"

export function SuccessHandler() {
  const [searchParams] = useSearchParams()

  const type = searchParams.get("type") || "default"
  const email = searchParams.get("email")
  const redirect = searchParams.get("redirect")

  const getSuccessConfig = (type: string) => {
    switch (type) {
      case "signup":
        return {
          title: "Account Created!",
          description: "Your account has been successfully created.",
          message: email
            ? `Welcome! We've sent a verification link to ${email}. Please check your inbox to activate your account.`
            : "Welcome! Please check your email for a verification link to activate your account.",
          primaryAction: { text: "Check Email", href: "#", onClick: () => window.open("mailto:") },
          secondaryAction: { text: "Back to Sign In", href: "/" },
        }

      case "login":
        return {
          title: "Successfully Signed In!",
          description: "You have been logged in to your account.",
          message: "Welcome back! You're being redirected to your dashboard.",
          primaryAction: { text: "Go to Dashboard", href: redirect || "/dashboard" },
          secondaryAction: null,
          autoRedirect: true,
        }

      case "verification":
        return {
          title: "Email Verified!",
          description: "Your email address has been successfully verified.",
          message: "Great! Your account is now active and you can start using all features.",
          primaryAction: { text: "Continue to Sign In", href: "/" },
          secondaryAction: null,
        }

      case "password-reset":
        return {
          title: "Password Reset!",
          description: "Your password has been successfully updated.",
          message: "You can now sign in with your new password.",
          primaryAction: { text: "Sign In", href: "/" },
          secondaryAction: null,
        }

      case "email-sent":
        return {
          title: "Email Sent!",
          description: "We've sent you an email with further instructions.",
          message: email
            ? `Please check your inbox at ${email} and follow the instructions in the email.`
            : "Please check your inbox and follow the instructions in the email.",
          primaryAction: { text: "Check Email", href: "#", onClick: () => window.open("mailto:") },
          secondaryAction: { text: "Back to Sign In", href: "/" },
        }

      default:
        return {
          title: "Success!",
          description: "Your request has been completed successfully.",
          message: "Everything went smoothly. You can continue using the application.",
          primaryAction: { text: "Continue", href: "/" },
          secondaryAction: null,
        }
    }
  }

  const config = getSuccessConfig(type)

  const isInternalLink = (href: string | undefined) => !!href && href.startsWith("/")

  const renderPrimaryAction = () => {
    if (!config.primaryAction) return null

    if (config.primaryAction.onClick) {
      return (
        <Button onClick={config.primaryAction.onClick} className="w-full">
          {config.primaryAction.text}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )
    }

    const actionContent = (
      <>
        {config.primaryAction.text}
        <ArrowRight className="w-4 h-4 ml-2" />
      </>
    )

    if (isInternalLink(config.primaryAction.href)) {
      return (
        <Button asChild className="w-full">
          <Link to={config.primaryAction.href!}>{actionContent}</Link>
        </Button>
      )
    }

    return (
      <Button asChild className="w-full">
        <a href={config.primaryAction.href}>{actionContent}</a>
      </Button>
    )
  }

  const renderSecondaryAction = () => {
    if (!config.secondaryAction) return null

    if (isInternalLink(config.secondaryAction.href)) {
      return (
        <Button variant="ghost" asChild className="w-full">
          <Link to={config.secondaryAction.href!}>{config.secondaryAction.text}</Link>
        </Button>
      )
    }

    return (
      <Button variant="ghost" asChild className="w-full">
        <a href={config.secondaryAction.href}>{config.secondaryAction.text}</a>
      </Button>
    )
  }

  // Auto-redirect for login success
  if (config.autoRedirect && config.primaryAction?.href) {
    setTimeout(() => {
      window.location.href = config.primaryAction!.href
    }, 2000)
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl font-semibold">{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-balance">{config.message}</p>
          </div>

          <div className="space-y-2 pt-2">
            {renderPrimaryAction()}

            {renderSecondaryAction()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
