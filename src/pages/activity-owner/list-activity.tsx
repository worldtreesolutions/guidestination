
import { useState } from "react"
import Head from "next/head"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityListingForm } from "@/components/activity-owner/ActivityListingForm"
import { Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ListActivityPage() {
  return (
    <>
      <Head>
        <title>List Your Activity - Guidestination</title>
        <meta name="description" content="List your activity on Guidestination" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <div className="container py-12 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">List Your Activity</h1>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Please note that Guidestination takes a 20% commission on all bookings. 
                  Set your prices accordingly to ensure profitability.
                </AlertDescription>
              </Alert>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Activity Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityListingForm />
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
