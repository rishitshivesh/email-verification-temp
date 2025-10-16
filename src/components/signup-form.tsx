import type React from "react";

import { useState } from "react";
import { toast } from "react-hot-toast";

import { parseAxiosError, requestMagicLink } from "@/lib/auth-service";
import { buildAppUrl } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowRight, User } from "lucide-react";

const encodeState = (state: unknown) => window.btoa(JSON.stringify(state));

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const state = encodeState({
        type: "signup",
        name: formData.name,
        requestedAt: Date.now(),
        redirect: "/",
      });
      const url = new URL(buildAppUrl("/verify"));
      url.searchParams.set("type", "signup");
      url.searchParams.set("state", state);
      const response = await requestMagicLink({ email: formData.email, redirectUrl: url.toString(), state });
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
        <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Verify your email</h3>
          <p className="text-sm text-muted-foreground text-balance">
            We've sent a verification link to <strong>{formData.email}</strong>. Click the link to activate your account.
          </p>
        </div>
        <div className="space-y-2">
          <Button variant="outline" onClick={() => setIsEmailSent(false)} className="w-full">
            Try different email
          </Button>
        </div>
      </div>
    );
  }

  const isFormValid = formData.name.trim() && formData.email.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            className="h-11 pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            className="h-11 pl-10"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full h-11" disabled={isLoading || !isFormValid}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            Create account
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground text-center text-balance">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </div>
    </form>
  );
}
