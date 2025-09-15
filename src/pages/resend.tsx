import { Link } from "react-router-dom"

import { ResendForm } from "@/components/resend-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ResendPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Resend Email</h1>
          <p className="text-muted-foreground text-balance">Didn't receive an email? We can send you a new one</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold">Request New Email</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a new verification or login link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResendForm />
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Remember your login details?{" "}
          <Link to="/" className="font-medium text-primary hover:underline transition-colors">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
