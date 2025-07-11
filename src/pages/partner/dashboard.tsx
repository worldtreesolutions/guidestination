import Head from "next/head"
import { useState, useEffect } from 'react';
import Navbar from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PartnerMetrics } from "@/components/partner/PartnerMetrics"
import { CommissionTable } from "@/components/partner/CommissionTable"
import { MonthlyChart } from "@/components/partner/MonthlyChart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, TrendingUp, Users, QrCode } from "lucide-react"

export default function PartnerDashboard() {
  const stats = [
    {
      title: "Total Commission",
      value: "฿45,231",
      description: "+20.1% from last month",
      icon: CreditCard
    },
    {
      title: "Bookings",
      value: "147",
      description: "+15% from last month",
      icon: TrendingUp
    },
    {
      title: "QR Code Scans",
      value: "1,234",
      description: "+35% from last month",
      icon: QrCode
    },
    {
      title: "Total Guests",
      value: "289",
      description: "+18% from last month",
      icon: Users
    }
  ]

  return (
    <>
      <Head>
        <title>Partner Dashboard - Guidestination</title>
        <meta name="description" content="Monitor your performance and commissions as a Guidestination partner" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 py-8">
          <div className="container">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Partner Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor your performance and track commissions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <MonthlyChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Commission by Activity Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <CommissionTable />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <PartnerMetrics />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
