import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth() // Removed unused functions
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("new") // Default to new user

  // Pre-fill email from query parameter if available
  useEffect(() => {
    if (router.query.email && typeof router.query.email === "string") {
      const queryEmail = router.query.email;
      setEmail(queryEmail)
      // Note: Automatic status check removed. User will proceed with registration.
      // The backend will determine if it's a new user or existing activity owner.
    }
  }, [router.query.email])


  const handleNewUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate form
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!agreeTerms) {
      setError("You must agree to the terms and conditions")
      return
    }

    setIsLoading(true)

    try {
      // Assuming this registration is for standard users, not activity owners directly via this form.
      // Activity owner registration should go through its specific form and API.
      const { user, session, needsVerification, error: registrationError } = await register(
        email,
        password,
        name
      );

      if (registrationError) {
        setError(registrationError);
        return;
      }
      
      if (needsVerification) {
        setSuccess("Registration successful! Please check your email to verify your account.");
        // Optionally redirect to a page indicating verification is needed
      } else {
        setSuccess("Account created successfully!");
        router.push("/dashboard/overview"); // Or login page
      }
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // handleExistingUserSubmit might be deprecated or needs re-evaluation
  // if activity owner setup is handled by a different flow/API.
  // For now, keeping it but noting it might not be used if checkEmailStatus is removed.
  const handleExistingUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (!agreeTerms) {
      setError("You must agree to the terms and conditions")
      return
    }
    setIsLoading(true)
    try {
      setError("Functionality to set up password for existing user is currently unavailable through this form.");
    } catch (err: any) {
      console.error("Setup password error:", err)
      setError(err.message || "Failed to set up password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Create Account - Dashboard</title>
        <meta name="description" content="Create a new account to access the dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-center mb-8">
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
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
              <CardDescription className="text-center">
                Enter your information to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                  <Info className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {/* Email check section - Simplified: User enters email directly for registration */}
                <div className="space-y-2">
                  <Label htmlFor="email-check">Email</Label> {/* Changed label */}
                  <Input 
                    id="email-check" // Keep ID for label association
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full" // Ensure full width
                  />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="new">New User</TabsTrigger>
                    <TabsTrigger 
                      value="existing" 
                      disabled={true} // Disabled as client-side check for existing verified user is removed
                    >
                      Existing User (Setup Password)
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="new">
                    <form onSubmit={handleNewUserSubmit} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="name-new">Full Name</Label>
                        <Input 
                          id="name-new" 
                          placeholder="John Doe" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={isLoading}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password-new">Password</Label>
                        <Input 
                          id="password-new" 
                          type="password" 
                          placeholder="••••••••" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword-new">Confirm Password</Label>
                        <Input 
                          id="confirmPassword-new" 
                          type="password" 
                          placeholder="••••••••" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex items-start space-x-2 mt-4">
                        <Checkbox 
                          id="terms-new" 
                          checked={agreeTerms}
                          onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                          disabled={isLoading}
                          className="mt-1"
                        />
                        <Label 
                          htmlFor="terms-new" 
                          className="text-sm font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the{" "}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </Label>
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
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="existing">
                    {/* This form might need to be re-evaluated or removed if the flow changes */}
                    <form onSubmit={handleExistingUserSubmit} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="name-existing">Full Name</Label>
                        <Input 
                          id="name-existing" 
                          placeholder="John Doe" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={isLoading}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password-existing">Password</Label>
                        <Input 
                          id="password-existing" 
                          type="password" 
                          placeholder="••••••••" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword-existing">Confirm Password</Label>
                        <Input 
                          id="confirmPassword-existing" 
                          type="password" 
                          placeholder="••••••••" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex items-start space-x-2 mt-4">
                        <Checkbox 
                          id="terms-existing" 
                          checked={agreeTerms}
                          onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                          disabled={isLoading}
                          className="mt-1"
                        />
                        <Label 
                          htmlFor="terms-existing" 
                          className="text-sm font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the{" "}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </Label>
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
                            Setting Up Password...
                          </>
                        ) : (
                          "Set Up Password"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-4 pb-6 border-t">
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/dashboard/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}