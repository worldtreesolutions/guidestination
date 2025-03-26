
import { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityListingForm } from "@/components/activity-owner/ActivityListingForm"
import { Info, ChevronRight, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb"
import { Progress } from "@/components/ui/progress"

export default function ListActivityPage() {
  const [progress, setProgress] = useState(0)
  const [isDraft, setIsDraft] = useState(false)

  const handleSaveDraft = () => {
    setIsDraft(true)
  }

  return (
    <>
      <Head>
        <title>List Your Activity - Guidestination</title>
        <meta name="description" content="List your activity on Guidestination and reach more customers" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 bg-slate-50">
          <div className="container py-8 max-w-4xl">
            <Breadcrumb className="mb-6">
              <BreadcrumbItem>
                <BreadcrumbLink href="/activity-owner">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href="#" aria-current="page">List Your Activity</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <div className="mb-8 space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">List Your Activity</h1>
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-5 w-5 text-blue-500" />
                <AlertTitle className="text-blue-700">Commission Information</AlertTitle>
                <AlertDescription className="text-blue-600">
                  <p className="mb-2">Guidestination takes a 20% commission on all bookings to cover:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Marketing and promotion of your activity</li>
                    <li>Payment processing fees</li>
                    <li>Customer support services</li>
                    <li>Platform maintenance and development</li>
                  </ul>
                  <p className="mt-2 font-medium">Set your base price accordingly to ensure profitability.</p>
                </AlertDescription>
              </Alert>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex-1">
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="min-w-[44px] text-right">{progress}%</div>
                </div>
              </div>
            </div>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Activity Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityListingForm onProgress={setProgress} isDraft={isDraft} />
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
