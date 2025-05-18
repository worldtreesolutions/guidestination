
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/router"
import Link from "next/link"
import Image from "next/image"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit({ email, password }: LoginFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const {  authData, error: signInError } = await login(email, password)

      if (signInError) {
        setError(signInError.message || "An unexpected error occurred during login.")
        setIsLoading(false) // Reset loading state on error
        return
      }

      if (authData?.user) {
        const role = authData.user.user_metadata?.role
        console.log("User role from meta", role) // For debugging

        if (role === "activity_owner") {
          router.push("/activity-owner/dashboard")
        } else if (role === "admin") { 
          router.push("/admin") // Adjust if your admin dashboard path is different
        } else {
          router.push("/dashboard/overview") // Default dashboard
        }
      } else if (authData?.session) {
        // Session exists, but user object (and thus metadata) might not be immediately available.
        // The AuthContext's onAuthStateChange listener should handle full user profile loading.
        // Redirect to a default page; role-based redirection might be handled by a layout component.
        console.warn("Login successful with session, but user metadata not immediately available. Defaulting redirect to /dashboard/overview.")
        router.push("/dashboard/overview")
      } else {
        setError("Login successful, but no session or user data was returned. Please try again.")
      }
    } catch (err: any) {
      console.error("Login page onSubmit error:", err)
      let message = "An unexpected error occurred during login."
      if (err instanceof Error) {
        message = err.message
      } else if (typeof err === "object" && err && "message" in err) {
        message = (err as {message: string}).message
      }
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center">
          <Link href="/" className="mb-6">
            <Image
              src="/logo-masdxep0.png"
              alt="Guidestination"
              width={180}
              height={32}
              priority
              className="h-8 w-auto"
            />
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Sign in to your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email below to access your account
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...form.register("email")}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/dashboard/forgot-password" legacyBehavior>
                <a className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </a>
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              disabled={isLoading}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/dashboard/register" legacyBehavior>
            <a className="font-medium text-primary hover:underline">Sign up</a>
          </Link>
        </p>
         <p className="mt-2 text-center text-sm">
          Activity Owner?{" "}
          <Link href="/activity-owner" legacyBehavior>
            <a className="font-medium text-primary hover:underline">Register here</a>
          </Link>
        </p>
      </div>
    </div>
  )
}
