
import Head from "next/head"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ActivityRow } from "@/components/home/ActivityRow"
import { SearchBar } from "@/components/home/SearchBar"
import { Calendar } from "lucide-react"
import { usePlanning } from "@/contexts/PlanningContext"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Home() {
  const { selectedActivities } = usePlanning()
  const { t } = useLanguage()

  const recommendedActivities = [
    {
      title: t("activities.doiSuthep.title"),
      image: "/wat-doi-suthep-mb4vp7pn.jpg",
      price: 1500,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/doi-suthep"
    },
    {
      title: t("activities.cookingClass.title"),
      image: "/cooking-class-mb4w0l3a.jpg",
      price: 1200,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/cooking-class"
    },
    {
      title: t("activities.elephantPark.title"),
      image: "https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5",
      price: 2500,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/elephant-sanctuary"
    },
    {
      title: t("activities.massage.title"),
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874",
      price: 1800,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/massage-workshop"
    },
    {
      title: t("activities.foodTour.title"),
      image: "/42de8397-8cce-8211-e115-56406ae074b9-mb4vvptt.jpg",
      price: 1000,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/food-tour"
    }
  ]

  const adventureActivities = [
    {
      title: t("activities.biking.title"),
      image: "/trekking-mb4w3w4s.webp",
      price: 2200,
      location: t("activities.location.chiangMai"),
      rating: 4,
      href: "/activities/mountain-biking"
    },
    {
      title: t("activities.elephantPark.title"),
      image: "https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5",
      price: 2500,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/elephant-sanctuary"
    },
    {
      title: "White Water Rafting",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
      price: 1800,
      location: t("activities.location.chiangMai"),
      rating: 4,
      href: "/activities/rafting"
    },
    {
      title: "Rock Climbing",
      image: "https://images.unsplash.com/photo-1522163182402-834f871fd851",
      price: 2000,
      location: t("activities.location.chiangMai"),
      rating: 4,
      href: "/activities/rock-climbing"
    }
  ]

  const cultureActivities = [
    {
      title: t("activities.doiSuthep.title"),
      image: "/wat-doi-suthep-mb4vp7pn.jpg",
      price: 1500,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/doi-suthep"
    },
    {
      title: t("activities.templeBike.title"),
      image: "https://images.unsplash.com/photo-1528181304800-259b08848526",
      price: 800,
      location: t("activities.location.chiangMai"),
      rating: 4,
      href: "/activities/temple-bike-tour"
    },
    {
      title: t("activities.meditation.title"),
      image: "https://images.unsplash.com/photo-1545389336-cf090694435e",
      price: 1600,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/meditation-retreat"
    },
    {
      title: "Traditional Dance Class",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96",
      price: 900,
      location: t("activities.location.chiangMai"),
      rating: 4,
      href: "/activities/dance-class"
    }
  ]

  const artCraftActivities = [
    {
      title: t("activities.ceramics.title"),
      image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261",
      price: 1300,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/ceramics-workshop"
    },
    {
      title: "Silver Jewelry Making",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
      price: 1500,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/jewelry-making"
    },
    {
      title: "Wood Carving Workshop",
      image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3",
      price: 1100,
      location: t("activities.location.chiangMai"),
      rating: 4,
      href: "/activities/wood-carving"
    },
    {
      title: "Textile Weaving",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
      price: 1200,
      location: t("activities.location.chiangMai"),
      rating: 4,
      href: "/activities/textile-weaving"
    }
  ]

  const cookingActivities = [
    {
      title: t("activities.cookingClass.title"),
      image: "/cooking-class-mb4w0l3a.jpg",
      price: 1200,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/cooking-class"
    },
    {
      title: t("activities.foodTour.title"),
      image: "/42de8397-8cce-8211-e115-56406ae074b9-mb4vvptt.jpg",
      price: 1000,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/food-tour"
    },
    {
      title: "Street Food Adventure",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      price: 800,
      location: t("activities.location.chiangMai"),
      rating: 4,
      href: "/activities/street-food"
    },
    {
      title: "Farm to Table Experience",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
      price: 1400,
      location: t("activities.location.chiangMai"),
      rating: 5,
      href: "/activities/farm-to-table"
    }
  ]

  return (
    <>
      <Head>
        <title>{t("meta.title")}</title>
        <meta name="description" content={t("meta.description")} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" type="image/png" href="/wts-logo-maq82ya8.png" />
      </Head>

      <div className="min-h-screen flex flex-col w-full bg-gray-50">
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
          
          <section className="py-8 sm:py-12 w-full px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto w-full text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
                {t("home.hero.title")}
              </h1>
              <SearchBar />
            </div>
          </section>

          <section className="py-8 sm:py-12 w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto w-full">
              <ActivityRow
                title="Recommended by Us"
                activities={recommendedActivities}
                showViewAll={true}
                viewAllHref="/recommended"
              />
              
              <ActivityRow
                title={t("category.adventure")}
                activities={adventureActivities}
                showViewAll={true}
                viewAllHref="/category/adventure"
              />
              
              <ActivityRow
                title={t("category.culture")}
                activities={cultureActivities}
                showViewAll={true}
                viewAllHref="/category/culture"
              />
              
              <ActivityRow
                title={t("category.artCraft")}
                activities={artCraftActivities}
                showViewAll={true}
                viewAllHref="/category/art-craft"
              />
              
              <ActivityRow
                title={t("category.cooking")}
                activities={cookingActivities}
                showViewAll={true}
                viewAllHref="/category/cooking"
              />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
