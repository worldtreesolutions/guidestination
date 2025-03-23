
import { Language } from "@/contexts/LanguageContext"

type TranslationKeys = {
  nav: {
    aiPlanning: string
    listActivities: string
    becomePartner: string
  }
  recommendation: {
    title: string
    subtitle: string
    loading: string
    yourPlan: string
    addAll: string
    addToPlanning: string
    summary: string
    numberOfDays: string
    totalBudget: string
    numberOfActivities: string
    restart: string
  }
}

export const translations: Record<Language, TranslationKeys> = {
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
  },
  th: {
    nav: {
      aiPlanning: "การวางแผนด้วย AI",
      listActivities: "ลงทะเบียนกิจกรรม",
      becomePartner: "เป็นพาร์ทเนอร์"
    },
    recommendation: {
      title: "การวางแผนส่วนบุคคล",
      subtitle: "แบ่งปันความชอบของคุณเพื่อรับตารางที่ปรับแต่ง",
      loading: "กำลังสร้างตารางส่วนบุคคลของคุณ...",
      yourPlan: "แผนที่แนะนำของคุณ",
      addAll: "เพิ่มทั้งหมดในการวางแผน",
      addToPlanning: "เพิ่มในการวางแผน",
      summary: "สรุป",
      numberOfDays: "จำนวนวัน",
      totalBudget: "งบประมาณทั้งหมด",
      numberOfActivities: "จำนวนกิจกรรม",
      restart: "เริ่มใหม่"
    }
  },
  zh: {
    nav: {
      aiPlanning: "AI规划",
      listActivities: "列出您的活动",
      becomePartner: "成为合作伙伴"
    },
    recommendation: {
      title: "个性化规划",
      subtitle: "分享您的偏好以获取定制行程",
      loading: "正在创建您的个性化行程...",
      yourPlan: "推荐行程",
      addAll: "全部添加到规划",
      addToPlanning: "添加到规划",
      summary: "摘要",
      numberOfDays: "天数",
      totalBudget: "总预算",
      numberOfActivities: "活动数量",
      restart: "重新开始"
    }
  },
  ja: {
    nav: {
      aiPlanning: "AI プランニング",
      listActivities: "アクティビティを登録",
      becomePartner: "パートナーになる"
    },
    recommendation: {
      title: "パーソナライズドプランニング",
      subtitle: "カスタマイズされたスケジュールを取得するために設定を共有",
      loading: "パーソナライズされたスケジュールを作成中...",
      yourPlan: "おすすめプラン",
      addAll: "すべてをプランに追加",
      addToPlanning: "プランに追加",
      summary: "概要",
      numberOfDays: "日数",
      totalBudget: "合計予算",
      numberOfActivities: "アクティビティ数",
      restart: "やり直す"
    }
  },
  ko: {
    nav: {
      aiPlanning: "AI 플래닝",
      listActivities: "활동 등록하기",
      becomePartner: "파트너 되기"
    },
    recommendation: {
      title: "맞춤형 플래닝",
      subtitle: "맞춤 일정을 받으려면 선호도를 공유하세요",
      loading: "맞춤형 일정을 만드는 중...",
      yourPlan: "추천 플랜",
      addAll: "전체 플래닝에 추가",
      addToPlanning: "플래닝에 추가",
      summary: "요약",
      numberOfDays: "일수",
      totalBudget: "총 예산",
      numberOfActivities: "활동 수",
      restart: "다시 시작"
    }
  },
  ru: {
    nav: {
      aiPlanning: "AI Планирование",
      listActivities: "Добавить активности",
      becomePartner: "Стать партнером"
    },
    recommendation: {
      title: "Персонализированное планирование",
      subtitle: "Поделитесь своими предпочтениями для получения индивидуального расписания",
      loading: "Создание вашего персонализированного расписания...",
      yourPlan: "Ваш рекомендуемый план",
      addAll: "Добавить все в планирование",
      addToPlanning: "Добавить в планирование",
      summary: "Сводка",
      numberOfDays: "Количество дней",
      totalBudget: "Общий бюджет",
      numberOfActivities: "Количество активностей",
      restart: "Начать заново"
    }
  }
}

export const useTranslation = (language: Language) => {
  return translations[language]
}
