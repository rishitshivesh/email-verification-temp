import type React from "react";

import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { getDefaultLoginRedirect, parseAxiosError, requestMagicLink } from "@/lib/auth-service";
import { buildAppUrl } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowRight } from "lucide-react";

const encodeState = (state: unknown) => window.btoa(JSON.stringify(state));

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const defaultRedirect = useMemo(() => getDefaultLoginRedirect(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const state = encodeState({ type: "login", requestedAt: Date.now(), redirect: defaultRedirect });
      const url = new URL(buildAppUrl("/verify"));
      url.searchParams.set("type", "login");
      url.searchParams.set("state", state);
      const response = await requestMagicLink({ email, redirectUrl: url.toString(), state });
      setIsEmailSent(true);
      toast.success(response.message ?? "If this email is registered, you'll receive a magic link shortly.");
    } catch (err) {
      const { message } = parseAxiosError(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Check your email</h3>
          <p className="text-sm text-muted-foreground text-balance">
            We've sent a secure login link to <strong>{email}</strong>
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsEmailSent(false)} className="w-full">
          Send another link
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="h-11"
        />
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
            Sending link...
          </>
        ) : (
          <>
            Send magic link
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}
