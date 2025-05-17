
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/router"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const { login } = useAuth(); // Changed from signInWithEmail to login
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

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: signInError } = await login(values.email, values.password); // Changed from signInWithEmail to login

      if (signInError) {
        setError(signInError.message || "An unexpected error occurred during login.")
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Check for admin role if your app has one
        // const isAdmin = data.user.app_metadata?.roles?.includes("admin")
        // if (isAdmin) {
        //   router.push("/admin/dashboard")
        // } else {
        router.push("/dashboard") // Default redirect for non-admin users
        // }
      } else {
        setError("Login successful, but no user data received. Please try again.")
      }
    } catch (e: any) {
      console.error("Login error:", e)
      setError(e.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
  )
}
