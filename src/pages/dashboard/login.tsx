
import { useState } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function DashboardLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive"
      })
      return
    }
    
    setLoading(true)
    
    try {
      await login(email, password)
      router.push("/dashboard/overview")
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Activity Provider Login - Guidestination</title>
        <meta name="description" content="Log in to manage your activities and bookings" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-[#22C55E]">Guidestination</span>
            </Link>
            <h1 className="mt-6 text-2xl font-bold">Activity Provider Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Log in to manage your activities and bookings
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Log in</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link 
                      href="/dashboard/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log in"}
                </Button>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link 
                    href="/dashboard/register" 
                    className="text-primary hover:underline"
                  >
                    Register as a provider
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </>
  )
}
