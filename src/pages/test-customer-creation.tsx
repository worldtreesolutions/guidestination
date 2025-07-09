
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function TestCustomerCreation() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const createTestUser = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/create-test-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
        toast({
          title: "Success",
          description: "Test customer created successfully!",
        })
      } else {
        throw new Error(data.error || "Failed to create test user")
      }
    } catch (error) {
      console.error("Error creating test user:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create test user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create Test Customer</CardTitle>
            <CardDescription>
              Create a test customer account for testing the profile system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={createTestUser} 
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Test Customer
            </Button>

            {result && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Test Customer Created!</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {result.credentials.email}</p>
                  <p><strong>Password:</strong> {result.credentials.password}</p>
                  <p className="text-green-700">{result.message}</p>
                  {result.note && (
                    <p className="text-amber-700 mt-2">{result.note}</p>
                  )}
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={() => window.location.href = "/auth/login"}
                    variant="outline"
                  >
                    Go to Login Page
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
