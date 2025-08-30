import { useState } from "react";
import Head from "next/head";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityOwnerRegistrationForm } from "@/components/activity-owner/ActivityOwnerRegistrationForm";
import { Shield, Building2, Award, Clock, User, Briefcase, Plus, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { FloatingActionButtons } from "@/components/layout/FloatingActionButtons";

export default function ActivityOwnerDashboard() {
  const { user } = useAuth()
  const { t ,language} = useLanguage()

  console.log('Current language:', language)
  console.log('Legal title translation:', t("activityOwner.benefits.legal.title"))
  console.log('Home translation (should work):', t("nav.home"))

  return (
    <>
      <Head>
        <title>{t("activityOwner.page.title") || "List Your Activities"} - Guidestination</title>
        <meta name="description" content={t("activityOwner.page.description") || "Join Guidestination as an activity provider and grow your business"} />
      </Head>

      <div className="min-h-screen flex flex-col w-full">
        <Navbar />
        
        <main className="flex-1 w-full">
          <div className="w-full py-12 bg-gradient-to-b from-primary/10 to-background">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">
                  {t("activityOwner.hero.title") || "List Your Activities"}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t("activityOwner.hero.subtitle") || "Join our platform and start earning by sharing your amazing activities with travelers"}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <Card>
                  <CardHeader>
                    <Shield className="h-10 w-10 text-black mb-4" />
                    <CardTitle>{t("activityOwner.benefits.legal.title") || "Legal Protection"}</CardTitle>
                    <CardDescription>
                      {t("activityOwner.benefits.legal.description") || "Get comprehensive insurance coverage and legal protection for your activities"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <Building2 className="h-10 w-10 text-black mb-4" />
                    <CardTitle>{t("activityOwner.benefits.growth.title") || "Business Growth"}</CardTitle>
                    <CardDescription>
                      {t("activityOwner.benefits.growth.description") || "Expand your reach and grow your business with our marketing support"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <Award className="h-10 w-10 text-black mb-4" />
                    <CardTitle>{t("activityOwner.benefits.quality.title") || "Quality Standards"}</CardTitle>
                    <CardDescription>
                      {t("activityOwner.benefits.quality.description") || "Maintain high quality standards with our verification and review system"}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <Clock className="h-10 w-10 text-black mb-4" />
                    <CardTitle>{t("activityOwner.benefits.flexible.title") || "Flexible Schedule"}</CardTitle>
                    <CardDescription>
                      {t("activityOwner.benefits.flexible.description") || "Set your own schedule and manage bookings at your convenience"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>{t("activityOwner.registration.title") || "Activity Provider Registration"}</CardTitle>
                  <CardDescription>
                    {t("activityOwner.registration.subtitle") || "Fill out the form below to start listing your activities on our platform"}
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
  <FloatingActionButtons />
    </>
  )
}
