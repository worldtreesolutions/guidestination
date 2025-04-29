import Head from "next/head"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { activityService, Booking, Activity } from "@/services/activityService"
import { Loader2 } from "lucide-react"
import EarningsChart from "@/components/dashboard/overview/EarningsChart"
import RecentBookings from "@/components/dashboard/overview/RecentBookings"
import ActivityList from "@/components/dashboard/overview/ActivityList" // Ensure this path is correct

interface EarningsData {
  total: number;
  monthly: { month: string; amount: number }[];
  pending: number;
}

export default function DashboardOverviewPage() {
... existing code ...