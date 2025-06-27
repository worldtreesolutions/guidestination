import Head from "next/head"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"
import LoginForm from "@/components/auth/LoginForm"

export default function ActivityOwnerLoginPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/activity-owner/dashboard")
    }
  }, [isAuthenticated, router])

  return (
    <>
      <Head>
        <title>Activity Owner Login - Guidestination</title>
        <meta name="description" content="Login to your activity owner account" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Activity Owner Portal</h1>
            <p className="text-gray-600 mt-2">Sign in to manage your activities</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </>
  )
}
