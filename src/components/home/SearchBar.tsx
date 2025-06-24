
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export function SearchBar() {
  const { t } = useLanguage()

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 bg-white shadow-lg p-2 rounded-lg">
      <Input
        placeholder={t("home.search.placeholder")}
        className="flex-1 border-0 focus-visible:ring-0"
      />
      <Button className="w-full sm:w-auto">
        <Search className="h-5 w-5 mr-2" />
        {t("home.search.button")}
      </Button>
    </div>
  )
}
