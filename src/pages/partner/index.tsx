
import { useState } from "react";
import Head from "next/head";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PartnerRegistrationForm } from "@/components/partner/PartnerRegistrationForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Briefcase,
  User
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export default function PartnerPage() {
  const { t } = useLanguage()
  const [showForm, setShowForm] = useState(false)

  const benefits = [
    {
      icon: TrendingUp,
      title: t("partner.benefits.revenue.title") || "Increase Revenue",
      description: t("partner.benefits.revenue.description") || "Boost your business income through our commission-based partnership program"
    },
    {
      icon: Users,
      title: t("partner.benefits.customers.title") || "Reach More Customers",
      description: t("partner.benefits.customers.description") || "Access our growing network of travelers and activity seekers"
    },
    {
      icon: Shield,
      title: t("partner.benefits.trusted.title") || "Trusted Platform",
      description: t("partner.benefits.trusted.description") || "Join a secure and reliable platform with verified transactions"
    },
    {
      icon: Globe,
      title: t("partner.benefits.global.title") || "Global Exposure",
      description: t("partner.benefits.global.description") || "Showcase your business to international and local customers"
    }
  ]

  const features = [
    t("partner.features.booking") || "Real-time booking management",
    t("partner.features.commission") || "Automated commission tracking",
    t("partner.features.marketing") || "Marketing materials and support",
    t("partner.features.support") || "24/7 customer service",
    t("partner.features.analytics") || "Analytics and reporting tools",
    t("partner.features.mobile") || "Mobile-friendly dashboard"
  ]

  if (showForm) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <Head>
            <title>{t("partner.registration.title") || "Partner Registration"} - Guidestination</title>
            <meta name="description" content={t("partner.registration.description") || "Join Guidestination as a partner and grow your business"} />
          </Head>
          
          <Navbar />
          
          <main className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={() => setShowForm(false)}
                className="mb-4"
              >
                ← {t("partner.form.backToInfo") || "Back to Partner Information"}
              </Button>
              <h1 className="text-3xl font-bold text-center mb-2">{t("partner.registration.title") || "Partner Registration"}</h1>
              <p className="text-muted-foreground text-center">
                {t("partner.registration.subtitle") || "Fill out the form below to join our partner network"}
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <PartnerRegistrationForm />
              </CardContent>
            </Card>
          </main>
          
          <Footer />
        </div>
        <div className="fixed bottom-4 left-4 flex flex-col space-y-2 z-50">
          <Link href="/activity-owner">
            <Button variant="secondary" className="rounded-full shadow-lg">
              <Briefcase className="mr-2 h-4 w-4" /> List your Activity
            </Button>
          </Link>
          <Link href="/partner">
            <Button variant="secondary" className="rounded-full shadow-lg">
              <User className="mr-2 h-4 w-4" /> Become a Partner
            </Button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>{t("partner.page.title") || "Become a Partner"} - Guidestination</title>
          <meta name="description" content={t("partner.page.description") || "Join Guidestination as a partner and grow your business with our activity booking platform"} />
        </Head>
        
        <Navbar />
        
        <main>
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-20">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {t("partner.hero.title") || "Become a Partner"}
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
                {t("partner.hero.subtitle") || "Join our network of successful partners and grow your business with Guidestination"}
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => setShowForm(true)}
                className="text-lg px-8 py-3"
              >
                {t("partner.hero.cta") || "Start Your Application"}
              </Button>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">{t("partner.benefits.title") || "Why Partner With Us?"}</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {t("partner.benefits.subtitle") || "Discover the benefits of joining our growing network of partners"}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <benefit.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-6">{t("partner.features.title") || "Everything You Need to Succeed"}</h2>
                  <p className="text-muted-foreground mb-8">
                    {t("partner.features.subtitle") || "Our comprehensive partner platform provides all the tools and support you need to grow your business."}
                  </p>
                  
                  <div className="space-y-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    size="lg" 
                    className="mt-8"
                    onClick={() => setShowForm(true)}
                  >
                    {t("partner.features.cta") || "Get Started Today"}
                  </Button>
                </div>

                <div className="relative">
                  <Card className="p-6">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <Building2 className="h-8 w-8 text-primary" />
                        <div>
                          <CardTitle>{t("partner.dashboard.title") || "Partner Dashboard"}</CardTitle>
                          <CardDescription>{t("partner.dashboard.subtitle") || "Manage your business efficiently"}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">{t("partner.dashboard.revenue") || "Monthly Revenue"}</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          +25% ↗
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium">{t("partner.dashboard.bookings") || "New Bookings"}</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          47 this week
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium">{t("partner.dashboard.rating") || "Customer Rating"}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">4.8</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 bg-primary/5">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">{t("partner.cta.title") || "Ready to Get Started?"}</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                {t("partner.cta.subtitle") || "Join thousands of successful partners who are growing their business with Guidestination"}
              </p>
              <Button 
                size="lg" 
                onClick={() => setShowForm(true)}
                className="text-lg px-8 py-3"
              >
                {t("partner.cta.button") || "Apply Now"}
              </Button>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">{t("partner.contact.title") || "Have Questions?"}</h2>
                <p className="text-muted-foreground text-lg">
                  {t("partner.contact.subtitle") || "Our partner success team is here to help you every step of the way"}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{t("partner.contact.phone.title") || "Call Us"}</h3>
                    <p className="text-muted-foreground">{t("partner.contact.phone.number") || "+66 2 123 4567"}</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{t("partner.contact.email.title") || "Email Us"}</h3>
                    <p className="text-muted-foreground">{t("partner.contact.email.address") || "partners@guidestination.com"}</p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{t("partner.contact.location.title") || "Visit Us"}</h3>
                    <p className="text-muted-foreground">{t("partner.contact.location.address") || "Bangkok, Thailand"}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
      <div className="fixed bottom-4 left-4 flex flex-col space-y-2 z-50">
        <Link href="/activity-owner">
          <Button variant="secondary" className="rounded-full shadow-lg">
            <Briefcase className="mr-2 h-4 w-4" /> List your Activity
          </Button>
        </Link>
        <Link href="/partner">
          <Button variant="secondary" className="rounded-full shadow-lg">
            <User className="mr-2 h-4 w-4" /> Become a Partner
          </Button>
        </Link>
      </div>
    </>
  )
}
