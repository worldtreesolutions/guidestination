
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
        <title>{t("activityOwner.meta.title") || "List Your Activities - Guidestination"}</title>
        <meta name="description" content={t("activityOwner.meta.description") || "Join Guidestination as an activity provider in Chiang Mai"} />
      </Head>

      <div className="min-h-screen flex flex-col w-full">
        <Navbar />
        
        <main className="flex-1 w-full">
          <div className="w-full py-12 bg-gradient-to-b from-primary/10 to-background">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">
                  {t("activityOwner.hero.title") || "List Your Activities on Guidestination"}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t("activityOwner.hero.subtitle") || "Join the leading platform for local experiences in Chiang Mai and connect with travelers worldwide"}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <Card>
                  <CardHeader>
                    <Shield className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{t("activityOwner.benefits.legalProtection.title") || "Legal Protection"}</CardTitle>
                    <CardDescription>
                      {t("activityOwner.benefits.legalProtection.description") || "All activities are covered by our comprehensive insurance policy"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <Building2 className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{t("activityOwner.benefits.businessGrowth.title") || "Business Growth"}</CardTitle>
                    <CardDescription>
                      {t("activityOwner.benefits.businessGrowth.description") || "Access to a wide network of hotels and tourism partners"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <Award className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{t("activityOwner.benefits.qualityStandards.title") || "Quality Standards"}</CardTitle>
                    <CardDescription>
                      {t("activityOwner.benefits.qualityStandards.description") || "Maintain high service standards with our certification program"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <Clock className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{t("activityOwner.benefits.flexibleSchedule.title") || "Flexible Schedule"}</CardTitle>
                    <CardDescription>
                      {t("activityOwner.benefits.flexibleSchedule.description") || "Set your own availability and manage bookings easily"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>{t("activityOwner.registration.title") || "Register as an Activity Provider"}</CardTitle>
                  <CardDescription>
                    {t("activityOwner.registration.description") || "Fill out the form below to start listing your activities"}
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
