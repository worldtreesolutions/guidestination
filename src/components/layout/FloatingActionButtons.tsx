import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export function FloatingActionButtons() {
  const { t } = useLanguage()

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-row gap-3">
      {/* List Your Activities Button */}
      <Link href="/activity-owner">
        <Button
          size="lg"
          className="bg-gradient-to-r from-[#eb1951] to-[#faaa15] text-white hover:from-[#d01747] hover:to-[#e09a13] focus:ring-2 focus:ring-pink-400 focus:outline-none rounded-full shadow-lg px-6 py-3 h-auto font-semibold transition-all duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">{t("nav.listActivitiesFull")}</span>
          <span className="sm:hidden">{t("nav.listActivities")}</span>
        </Button>
      </Link>

      {/* Become a Partner Button */}
      <Link href="/partner">
        <Button
          size="lg"
          className="bg-gradient-to-r from-[#eb1951] to-[#faaa15] text-white hover:from-[#d01747] hover:to-[#e09a13] focus:ring-2 focus:ring-pink-400 focus:outline-none rounded-full shadow-lg px-6 py-3 h-auto font-semibold transition-all duration-200"
        >
          <Users className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">{t("nav.becomePartnerFull")}</span>
          <span className="sm:hidden">{t("nav.becomePartner")}</span>
        </Button>
      </Link>
    </div>
  )
}
