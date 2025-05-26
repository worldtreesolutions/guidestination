
import { ExcursionPlanner } from "@/components/activities/ExcursionPlanner"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import Head from "next/head"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/contexts/LanguageContext"

export default function PlanningPage() {
  const isMobile = useIsMobile()
  const { t } = useLanguage()
  
  return (
    <>
      <Head>
        <title>{t("planning.pageTitle")} | Guidestination</title>
        <meta
          name="description"
          content={t("planning.metaDescription")}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-4 sm:py-8">
          <div className="container px-4 sm:px-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
              {t("planning.title")}
            </h1>
            <ExcursionPlanner />
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
