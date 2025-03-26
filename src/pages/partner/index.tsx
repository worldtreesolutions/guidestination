
import Head from "next/head"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PartnerRegistrationForm } from "@/components/partner/PartnerRegistrationForm"
import { Separator } from "@/components/ui/separator"
import { QrCode, Hotel, CreditCard, Users } from "lucide-react"

export default function PartnerPage() {
  return (
    <>
      <Head>
        <title>Become a Partner - Guidestination</title>
        <meta name="description" content="Join Guidestination as a hotel or accommodation partner in Chiang Mai" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <div className="relative py-12 bg-gradient-to-b from-primary/10 to-background">
            <div className="container max-w-7xl">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Partner with Guidestination</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join our network of premium hotels and accommodations in Chiang Mai and earn commission on every booking
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <Card>
                  <CardHeader>
                    <QrCode className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>Unique QR Code</CardTitle>
                    <CardDescription>
                      Get your personalized QR code for easy guest bookings and commission tracking
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <Hotel className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>Hotel Integration</CardTitle>
                    <CardDescription>
                      Seamlessly integrate activity bookings into your guest experience
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CreditCard className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>Commission Tracking</CardTitle>
                    <CardDescription>
                      Automated commission calculations and monthly payouts
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <Users className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>Guest Management</CardTitle>
                    <CardDescription>
                      Track bookings and manage guest experiences easily
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>Register as a Partner</CardTitle>
                  <CardDescription>
                    Fill out the form below to join our partner network
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
