
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import authService from "@/services/authService"
import { supabase } from "@/integrations/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)

  useEffect(() => {
    // Check if the URL contains a valid reset token
    const checkResetToken = async () => {
      const { hash } = window.location;
      if (hash && hash.includes('type=recovery')) {
        setIsValidToken(true);
      } else {
        setError("Invalid or expired password reset link. Please request a new one.");
      }
    };

    checkResetToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    setIsLoading(true)

    try {
      await authService.updatePasswordWithResetToken(password);
      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.message) {
        setError(err.message);
      } else {
        setError("An error occurred. Please try again or request a new reset link.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Set New Password - Dashboard</title>
        <meta name="description" content="Set a new password for your account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Guidestination Logo" 
                width={180} 
                height={40}
                className="h-10 w-auto"
                onError={(e) => {
                  // Fallback if logo doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.style.display = 'none';
                }}
              />
              <span className="text-2xl font-bold ml-2">Guidestination</span>
            </Link>
          </div>

          <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1 pb-6 text-center">
              <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
              <CardDescription>
                {!success 
                  ? "Create a new password for your account" 
                  : "Your password has been updated successfully"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Password Updated!</p>
                  <p className="text-muted-foreground mb-6">
                    Your password has been reset successfully. You can now log in with your new password.
                  </p>
                  <Button 
                    className="mt-2" 
                    onClick={() => router.push("/dashboard/login")}
                  >
                    Go to Login
                  </Button>
                </div>
              ) : (
                isValidToken && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="••••••••" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="w-full"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full py-6 mt-6" 
                      disabled={isLoading}
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Updating password...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                )
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4 pb-6 border-t">
              <div className="text-center text-sm w-full">
                <Link href="/dashboard/login" className="text-primary font-medium hover:underline">
                  <ArrowLeft className="inline-block mr-1 h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}
