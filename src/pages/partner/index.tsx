
import Head from "next/head"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PartnerRegistrationForm } from "@/components/partner/PartnerRegistrationForm"
import { Handshake, Hotel, Users, BarChart3 } from "lucide-react"

export default function PartnerPage() {
  return (
    <>
      <Head>
        <title>Become a Partner - Guidestination</title>
        <meta name="description" content="Partner with Guidestination to offer amazing local experiences to your guests" />
      </Head>

      <div className="min-h-screen flex flex-col w-full">
        <Navbar />
        
        <main className="flex-1 w-full">
          <div className="w-full py-12 bg-gradient-to-b from-primary/10 to-background">
            <div className="w-full px-4 sm:px-6 lg:px-8"> {/* Ensure this container is full width */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Partner with Guidestination</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Expand your offerings and earn commissions by connecting your guests with unique local activities in Chiang Mai.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <Card>
                  <CardHeader>
                    <Hotel className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>For Hotels & Accommodations</CardTitle>
                    <CardDescription>
                      Enhance guest experience and generate ancillary revenue.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <Users className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>For Travel Agencies</CardTitle>
                    <CardDescription>
                      Access a curated list of verified local activities for your clients.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <BarChart3 className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>Easy Commission Tracking</CardTitle>
                    <CardDescription>
                      Transparent reporting and timely payouts through our partner dashboard.
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <Card>
                  <CardHeader>
                    <Handshake className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>Dedicated Support</CardTitle>
                    <CardDescription>
                      Our team is here to help you succeed every step of the way.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>Register as a Distribution Partner</CardTitle>
                  <CardDescription>
                    Fill out the form below to join our network.
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
