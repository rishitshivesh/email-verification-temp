import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getDefaultLoginRedirect, requestMagicLink, verifyMagicLink, parseAxiosError } from "@/lib/auth-service";
import { buildAppUrl } from "@/lib/config";
import { CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw } from "lucide-react";

type VerificationState = "loading" | "success" | "error" | "expired" | "invalid";

type DecodedState = { redirect?: string } | undefined;

const encodeState = (state: unknown) => window.btoa(JSON.stringify(state));

function decodeState(value: string | null): DecodedState {
  if (!value) return undefined;
  try {
    return JSON.parse(window.atob(value)) as DecodedState;
  } catch (error) {
    console.warn("Failed to decode state", error);
    return undefined;
  }
}

function mapErrorToState(errorCode?: string, status?: number): VerificationState {
  if (errorCode === "TOKEN_EXPIRED" || status === 401) {
    return "expired";
  }
  if (errorCode === "TOKEN_ALREADY_USED" || errorCode === "INVALID_TOKEN" || status === 400) {
    return "invalid";
  }
  return "error";
}

export function VerificationHandler() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerificationState>("loading");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get("token");
  const type = searchParams.get("type") ?? "login";
  const rawState = searchParams.get("state");
  const decodedState = useMemo(() => decodeState(rawState), [rawState]);

  useEffect(() => {
    if (!token) {
      setState("invalid");
      setError("No verification token provided");
      toast.error("Verification token is missing.");
      return;
    }

    let isActive = true;
    const verify = async () => {
      setState("loading");
      setError("");

      try {
        const verificationResult = await verifyMagicLink(token, rawState ?? undefined);
        if (!isActive) return;
        setEmail(verificationResult.user.email);
        setState("success");
        toast.success(type === "signup" ? "Account verified successfully." : "You're now signed in.");

        if (type !== "signup") {
          const redirectTarget = decodedState?.redirect ?? getDefaultLoginRedirect();
          setTimeout(() => {
            window.location.href = redirectTarget;
          }, 1500);
        }
      } catch (err) {
        if (!isActive) return;
        const parsed = parseAxiosError(err);
        setError(parsed.message);
        setState(mapErrorToState(parsed.code, parsed.status));
        toast.error(parsed.message);
      }
    };

    void verify();

    return () => {
      isActive = false;
    };
  }, [token, type, rawState, decodedState?.redirect]);

  const handleResendVerification = async () => {
    if (!email) return;

    setIsResending(true);
    try {
      const statePayload = encodeState({
        type,
        requestedAt: Date.now(),
        redirect: type === "login" ? decodedState?.redirect ?? getDefaultLoginRedirect() : "/",
      });
      const url = new URL(buildAppUrl("/verify"));
      url.searchParams.set("type", type);
      url.searchParams.set("state", statePayload);
      const response = await requestMagicLink({ email, redirectUrl: url.toString(), state: statePayload });
      toast.success(response.message ?? "We've sent a new link to your inbox.");
    } catch (err) {
      const parsed = parseAxiosError(err);
      setError(parsed.message);
      toast.error(parsed.message);
    } finally {
      setIsResending(false);
    }
  };

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
        );

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
        );

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
                <Button onClick={handleResendVerification} disabled={isResending} variant="outline" className="w-full bg-transparent">
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
        );

      default:
        return null;
    }
  };

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
  );
}
