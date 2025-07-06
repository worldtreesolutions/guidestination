
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-100 text-gray-700 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.about.title")}</h3>
            <p className="text-sm">{t("footer.about.description")}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.discover.title")}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/recommendation" className="hover:text-primary">{t("footer.discover.recommendations")}</Link></li>
              <li><Link href="/planning" className="hover:text-primary">{t("footer.discover.planning")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.partners.title")}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/activity-owner" className="hover:text-primary">{t("footer.partners.activityOwners")}</Link></li>
              <li><Link href="/partner" className="hover:text-primary">{t("footer.partners.distributionPartners")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.legal.title")}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-primary">{t("footer.legal.terms")}</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">{t("footer.legal.privacy")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Guidestination. {t("footer.rightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
}
