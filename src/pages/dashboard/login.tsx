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
import { useLanguage } from "@/contexts/LanguageContext"
import { LanguageSelector } from "@/components/layout/LanguageSelector"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useLanguage()
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
      const { data, error: signInError } = await login(email, password)

      if (signInError) {
        setError(signInError.message || "An unexpected error occurred during login.")
        setIsLoading(false)
        return
      }

      if (data?.user && data?.session) {
        const role = data.user.user_metadata?.role
        console.log("User role from meta", role)
        console.log("Provider ID:", data.provider_id)

        // Store provider_id in localStorage for use in activity creation
        if (data.provider_id) {
          localStorage.setItem('provider_id', data.provider_id)
        }

        // Successful login with both user and session
        if (role === "activity_owner") {
          router.push("/activity-owner/dashboard")
        } else if (role === "admin") { 
          router.push("/admin")
        } else {
          router.push("/dashboard/overview")
        }
      } else {
        setError("Login failed. Please check your credentials and try again.")
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
        {/* Language Selector */}
        <div className="flex justify-end">
          <LanguageSelector />
        </div>
        
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
          <h2 className="text-3xl font-bold tracking-tight">{t("login.title") || "Sign in to your account"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("login.subtitle") || "Enter your email below to access your account"}
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t("login.email") || "Email"}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("login.emailPlaceholder") || "m@example.com"}
              {...form.register("email")}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("login.password") || "Password"}</Label>
              <Link href="/dashboard/forgot-password" legacyBehavior>
                <a className="text-sm font-medium text-primary hover:underline">
                  {t("login.forgotPassword") || "Forgot password?"}
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
            {isLoading ? (t("login.signingIn") || "Signing In...") : (t("login.signIn") || "Sign In")}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          {t("login.noAccount") || "Don't have an account?"}{" "}
          <Link href="/dashboard/register" legacyBehavior>
            <a className="font-medium text-primary hover:underline">{t("login.signUp") || "Sign up"}</a>
          </Link>
        </p>
         <p className="mt-2 text-center text-sm">
          {t("login.activityOwner") || "Activity Owner?"}{" "}
          <Link href="/activity-owner" legacyBehavior>
            <a className="font-medium text-primary hover:underline">{t("login.registerHere") || "Register here"}</a>
          </Link>
        </p>
      </div>
    </div>
  )
}
