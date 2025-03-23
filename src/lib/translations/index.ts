
import { Language } from "@/contexts/LanguageContext"

export const translations = {
  en: {
    nav: {
      aiPlanning: "AI Planning",
      listActivities: "List Your Activities",
      becomePartner: "Become a Partner"
    },
    recommendation: {
      title: "Personalized Planning",
      subtitle: "Share your preferences to get a customized schedule",
      loading: "Creating your personalized schedule...",
      yourPlan: "Your Recommended Plan",
      addAll: "Add All to Planning",
      addToPlanning: "Add to Planning",
      summary: "Summary",
      numberOfDays: "Number of days",
      totalBudget: "Total budget",
      numberOfActivities: "Number of activities",
      restart: "Start Over"
    }
  },
  fr: {
    nav: {
      aiPlanning: "Planification IA",
      listActivities: "Proposer des Activités",
      becomePartner: "Devenir Partenaire"
    },
    recommendation: {
      title: "Planification Personnalisée",
      subtitle: "Partagez vos préférences pour obtenir un planning sur mesure",
      loading: "Création de votre planning personnalisé...",
      yourPlan: "Votre Planning Recommandé",
      addAll: "Tout Ajouter au Planning",
      addToPlanning: "Ajouter au Planning",
      summary: "Résumé",
      numberOfDays: "Nombre de jours",
      totalBudget: "Budget total",
      numberOfActivities: "Nombre d'activités",
      restart: "Recommencer"
    }
  }
  // Add other languages here
}

export const useTranslation = (language: Language) => {
  return translations[language] || translations.en
}
