
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
      </Head>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-8">
          <ExcursionPlanner />
        </main>
        <Footer />
      </div>
    </>
  )
}
