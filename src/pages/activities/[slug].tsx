
    import { useRouter } from "next/router"
    import { Navbar } from "@/components/layout/Navbar"
    import { Footer } from "@/components/layout/Footer"

    export default function ActivityPage() {
      const router = useRouter()
      const { slug } = router.query

      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 container py-8">
            <h1 className="text-2xl font-bold">Activity Details</h1>
            <p>Loading details for: {slug}</p>
          </main>
          <Footer />
        </div>
      )
    }
  