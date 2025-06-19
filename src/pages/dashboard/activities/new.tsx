
import { useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { LanguageSelector } from "@/components/layout/LanguageSelector"

export default function NewActivityPage() {
  const { isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/dashboard/login')
      return
    }

    // Show message that provider dashboard has been separated
    toast({
      title: t("dashboard.info.title") || "Information",
      description: t("dashboard.info.providerDashboardSeparated") || "Provider dashboard functionality has been moved to a separate application. Please use the dedicated provider dashboard for creating activities.",
    })
  }, [isAuthenticated, router, toast, t])

  return (
    <>
      <Head>
        <title>{t("dashboard.activities.createNew") || "Create New Activity - Dashboard"}</title>
        <meta name="description" content={t("dashboard.activities.createDescription") || "Activity creation has been moved to the provider dashboard"} />
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          {/* Language Selector */}
          <div className="flex justify-end mb-4">
            <LanguageSelector />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.activities.createTitle") || "Create New Activity"}</h1>
              <p className="text-muted-foreground">
                {t("dashboard.activities.createSubtitle") || "Activity creation has been moved to the provider dashboard."}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/activities">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("dashboard.activities.backToActivities") || "Back to Activities"}
              </Link>
            </Button>
          </div>

          <div className="text-center py-8 sm:py-10 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-medium mb-2">Provider Dashboard Moved</h3>
            <p className="text-sm sm:text-base mb-4">
              Activity creation functionality has been moved to a separate provider dashboard application.
            </p>
            <p className="text-sm sm:text-base">
              Please use the dedicated provider dashboard for creating new activities, setting up schedules, and managing your listings.
            </p>
          </div>
        </div>
      </DashboardLayout>
    </>
  )
}
