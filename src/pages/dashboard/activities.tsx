
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/layout/LanguageSelector";

export default function ActivitiesPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    
    // Show message that provider dashboard has been separated
    toast({
      title: t("dashboard.info.title") || "Information",
      description: t("dashboard.info.providerDashboardSeparated") || "Provider dashboard functionality has been moved to a separate application. Please use the dedicated provider dashboard for managing activities.",
    });
    
    setIsLoading(false);
  }, [isAuthenticated, toast, t]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8 sm:py-10">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-[#ededed]" />
          <p className="ml-2 text-sm sm:text-base text-muted-foreground">Loading...</p>
        </div>
      );
    }

    return (
      <div className="text-center py-8 sm:py-10 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-blue-500" />
        <h3 className="text-lg font-medium mb-2">Provider Dashboard Moved</h3>
        <p className="text-sm sm:text-base mb-4">
          The provider dashboard functionality has been moved to a separate application.
        </p>
        <p className="text-sm sm:text-base">
          Please use the dedicated provider dashboard for managing your activities, bookings, and revenue.
        </p>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>{t("dashboard.activities.title") || "Activities - Dashboard"}</title>
        <meta name="description" content={t("dashboard.activities.description") || "Activity management"} />
      </Head>

      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6">
          {/* Language Selector */}
          <div className="flex justify-end mb-4">
            <LanguageSelector />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t("dashboard.activities.title") || "Activities"}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("dashboard.activities.subtitle") || "Activity management has been moved to the provider dashboard."}
              </p>
            </div>
          </div>

          {renderContent()}
        </div>
      </DashboardLayout>
    </>
  );
}
