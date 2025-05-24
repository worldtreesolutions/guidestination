
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CategoryNav } from "@/components/home/CategoryNav"
import { ActivityCard } from "@/components/home/ActivityCard"
import { Search, Calendar } from "lucide-react"
import { usePlanning } from "@/contexts/PlanningContext"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Home() {
  const { selectedActivities } = usePlanning()
  const { t } = useLanguage()

  const featuredActivities = [
    {
      titleKey: "activities.doiSuthep.title",
      title: t("activities.doiSuthep.title"),
      image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed",
      price: 1500,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/doi-suthep"
    },
    {
      titleKey: "activities.cookingClass.title",
      title: t("activities.cookingClass.title"),
      image: "https://images.unsplash.com/photo-1544025162-d76694265947",
      price: 1200,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/cooking-class"
    },
    {
      titleKey: "activities.elephantPark.title",
      title: t("activities.elephantPark.title"),
      image: "https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5",
      price: 2500,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/elephant-sanctuary"
    },
    {
      titleKey: "activities.massage.title",
      title: t("activities.massage.title"),
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874",
      price: 1800,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/massage-workshop"
    },
    {
      titleKey: "activities.foodTour.title",
      title: t("activities.foodTour.title"),
      image: "https://images.unsplash.com/photo-1516211881327-e5120a941edc",
      price: 1000,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/food-tour"
    },
    {
      titleKey: "activities.biking.title",
      title: t("activities.biking.title"),
      image: "https://images.unsplash.com/photo-1544198365-f5d60b6d8190",
      price: 2200,
      location: t("activities.location.chiangMai"),
      rating: 4,
      href: "/activities/mountain-biking"
    },
    {
      titleKey: "activities.ceramics.title",
      title: t("activities.ceramics.title"),
      image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261",
      price: 1300,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/ceramics-workshop"
    },
    {
      titleKey: "activities.templeBike.title",
      title: t("activities.templeBike.title"),
      image: "https://images.unsplash.com/photo-1528181304800-259b08848526",
      price: 800,
      location: t("activities.location.chiangMai"),
      rating: 4,
      href: "/activities/temple-bike-tour"
    },
    {
      titleKey: "activities.meditation.title",
      title: t("activities.meditation.title"),
      image: "https://images.unsplash.com/photo-1545389336-cf090694435e",
      price: 1600,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/meditation-retreat"
    }
  ]

  return (
    <>
      <Head>
        <title>{t("meta.title")}</title>
        <meta name="description" content={t("meta.description")} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" type="image/png" href="/wts-logo-maq82ya8.png" />
        {/* Remove Google Fonts from here as they're already in _document.tsx */}
      </Head>

      <div className="min-h-screen flex flex-col w-full">
        <Navbar />
        
        <main className="flex-1 w-full">
          {selectedActivities.length > 0 && (
            <div className="fixed bottom-4 right-4 z-40">
              <Link href="/planning">
                <Button size="lg" className="shadow-lg">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">{t("planning.view")}</span>
                  <span className="sm:hidden">{t("planning.short")}</span> ({selectedActivities.length})
                </Button>
              </Link>
            </div>
          )}
          
          <section className="relative h-[350px] sm:h-[450px] md:h-[550px] w-full">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1563492065599-3520f775eeed"
                alt={t("hero.image.alt")}
                fill
                sizes="100vw"
                className="object-cover brightness-75"
                priority
              />
            </div>
            <div className="relative w-full h-full flex flex-col items-center justify-center text-white px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-center max-w-4xl">
                {t("home.hero.title")}
              </h1>
              <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-md p-2 rounded-lg">
                <Input
                  placeholder={t("home.search.placeholder")}
                  className="bg-white/80 flex-1"
                />
                <Button className="w-full sm:w-auto mt-2 sm:mt-0">
                  <Search className="h-5 w-5 mr-2" />
                  {t("home.search.button")}
                </Button>
              </div>
            </div>
          </section>

          <section className="py-6 sm:py-8 md:py-12 w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto w-full">
              <CategoryNav />
            </div>
          </section>

          <section className="py-6 sm:py-8 md:py-12 w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto w-full">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 md:mb-8">
                {t("home.popular.title")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {featuredActivities.map((activity) => (
                  <ActivityCard key={activity.href} {...activity} />
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
