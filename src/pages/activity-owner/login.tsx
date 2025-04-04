
import { useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { LoginForm } from "@/components/auth/LoginForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/activity-owner/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <>
      <Head>
        <title>Activity Provider Login - Guidestination</title>
        <meta name="description" content="Sign in to your activity provider account" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 flex items-center justify-center bg-slate-50 py-12">
          <div className="w-full max-w-md px-4">
            <Card className="shadow-lg border-0">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Activity Provider Login</CardTitle>
                <CardDescription>
                  Sign in to manage your activities and bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm />
                
                <div className="mt-6 text-center text-sm">
                  <p className="text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/activity-owner" className="text-primary font-medium hover:underline">
                      Register as an activity provider
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
