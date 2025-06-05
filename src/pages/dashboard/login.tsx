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

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await login(data.email, data.password)
      
      if (response.error) {
        setError(response.error.message)
        return
      }

      // Check if user has provider_id to determine redirect
      if (response.provider_id) {
        router.push('/dashboard/overview')
      } else {
        router.push('/dashboard/overview')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Link href="/" className="mb-6">
            <Image
              src="/logo-masdxep0.png"
              alt="Guidestination"
              width={280}
              height={52}
              priority
              className="h-14 w-auto"
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
