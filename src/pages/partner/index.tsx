import Head from "next/head"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PartnerRegistrationForm } from "@/components/partner/PartnerRegistrationForm"
import { Handshake, Hotel, Users, BarChart3 } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { uploadService } from "@/services/uploadService"
import { useAuth } from "@/contexts/AuthContext"

export default function PartnerDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()

  // Example of how to use the upload service for partners
  const handlePartnerFileUpload = async (file: File, documentType: string) => {
    if (!user) return

    try {
      const result = await uploadService.uploadBusinessDocument(
        file, 
        user.id, 
        documentType, 
        user.id
      )

      if (result?.url) {
        console.log("Partner document uploaded:", result.url)
        // Save to partner profile or verification documents
      } else {
        console.error("Partner upload failed:", result?.error)
      }
    } catch (error) {
      console.error("Partner upload error:", error)
    }
  }

  return (
    <>
      <Head>
        <title>{t("partner.meta.title")}</title>
        <meta name="description" content={t("partner.meta.description")} />
      </Head>

      <div className="min-h-screen flex flex-col w-full">
        <Navbar />
        
        <main className="flex-1 w-full">
          <div className="w-full py-12 bg-gradient-to-b from-primary/10 to-background">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">{t("partner.hero.title")}</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t("partner.hero.subtitle")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <Card>
                  <CardHeader>
                    <Hotel className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{t("partner.benefits.hotels.title")}</CardTitle>
                    <CardDescription>
                      {t("partner.benefits.hotels.description")}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <Users className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{t("partner.benefits.agencies.title")}</CardTitle>
                    <CardDescription>
                      {t("partner.benefits.agencies.description")}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <BarChart3 className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{t("partner.benefits.tracking.title")}</CardTitle>
                    <CardDescription>
                      {t("partner.benefits.tracking.description")}
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader>
                    <Handshake className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{t("partner.benefits.support.title")}</CardTitle>
                    <CardDescription>
                      {t("partner.benefits.support.description")}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>{t("partner.registration.title")}</CardTitle>
                  <CardDescription>
                    {t("partner.registration.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PartnerRegistrationForm />
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
