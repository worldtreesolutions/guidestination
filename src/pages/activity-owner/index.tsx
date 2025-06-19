import { useState } from "react"
import Head from "next/head"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityOwnerRegistrationForm } from "@/components/activity-owner/ActivityOwnerRegistrationForm"
import { Shield, Building2, Award, Clock } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function ActivityOwnerPage() {
  const { t } = useLanguage()

  return (
    <>
      <Head>
        <title>{t("activityOwner.meta.title")}</title>
        <meta name="description" content={t("activityOwner.meta.description")} />
      </Head>

      <div className="min-h-screen flex flex-col w-full">
        <Navbar />
        
        <main className="flex-1 w-full">
          <div className="w-full py-12 bg-gradient-to-b from-primary/10 to-background">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">
                  {t("activityOwner.hero.title")}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t("activityOwner.hero.subtitle")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <Card>
                  <CardHeader>
                    <Shield className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{t("activityOwner.benefits.legalProtection.title")}</CardTitle>
                    <CardDescription>
                      {t("activityOwner.benefits.legalProtection.description")}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <Building2 className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{t("activityOwner.benefits.businessGrowth.title")}</CardTitle>
                    <CardDescription>
                      {t("activityOwner.benefits.businessGrowth.description")}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <Award className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{t("activityOwner.benefits.qualityStandards.title")}</CardTitle>
                    <CardDescription>
                      {t("activityOwner.benefits.qualityStandards.description")}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <Clock className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{t("activityOwner.benefits.flexibleSchedule.title")}</CardTitle>
                    <CardDescription>
                      {t("activityOwner.benefits.flexibleSchedule.description")}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>{t("activityOwner.registration.title")}</CardTitle>
                  <CardDescription>
                    {t("activityOwner.registration.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityOwnerRegistrationForm />
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
