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
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-[#018fcd] to-[#00ac50] hover:from-[#0177b8] hover:to-[#009a47] text-white border-0 px-6 py-3 h-auto"
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
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-[#018fcd] to-[#00ac50] hover:from-[#0177b8] hover:to-[#009a47] text-white border-0 px-6 py-3 h-auto"
        >
          <Users className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">{t("nav.becomePartnerFull")}</span>
          <span className="sm:hidden">{t("nav.becomePartner")}</span>
        </Button>
      </Link>
    </div>
  )
}
