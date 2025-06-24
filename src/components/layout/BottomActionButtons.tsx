
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export function BottomActionButtons() {
  const { t } = useLanguage()

  return (
    <div className="fixed bottom-6 left-6 z-40 flex gap-3">
      {/* List Your Activities Button */}
      <Link href="/activity-owner">
        <Button 
          size="sm" 
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="text-sm">{t("nav.listActivities")}</span>
        </Button>
      </Link>

      {/* Become a Partner Button */}
      <Link href="/partner">
        <Button 
          size="sm" 
          variant="outline"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-white hover:bg-gray-50 border-2 border-blue-600 text-blue-600 hover:text-blue-700 px-4 py-2 h-auto"
        >
          <Users className="h-4 w-4 mr-2" />
          <span className="text-sm">{t("nav.becomePartner")}</span>
        </Button>
      </Link>
    </div>
  )
}
