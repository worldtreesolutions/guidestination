
import { ExcursionPlanner } from "@/components/activities/ExcursionPlanner"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import Head from "next/head"

export default function PlanningPage() {
  return (
    <>
      <Head>
        <title>Mon Planning Excursion | Guidestination</title>
        <meta
          name="description"
          content="Planifiez vos activités et excursions à Chiang Mai avec notre planificateur hebdomadaire interactif"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-4 sm:py-8">
          <div className="container px-4 sm:px-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
              Your Activity Planning
            </h1>
            <ExcursionPlanner />
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
