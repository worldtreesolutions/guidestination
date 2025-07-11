import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import { ActivityListingForm } from "@/components/activity-owner/ActivityListingForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ListActivityPage() {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>List New Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityListingForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
