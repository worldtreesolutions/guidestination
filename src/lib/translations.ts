// Static translation imports for better performance
import enImported from '../../public/translations/en.json'
// Temporarily disable Thai translations due to encoding issues
// import th from '../../public/translations/th.json'
import frImported from '../../public/translations/fr.json'

export type SupportedLanguage = 'en' | 'th' | 'fr'

// Extend English translations with missing activityOwner section
const en = {
  ...enImported,
  activityOwner: {
    page: {
      title: "List Your Activities",
      description: "Join Guidestination as an activity provider and grow your business"
    },
    hero: {
      title: "List Your Activities",
      subtitle: "Join our platform and start earning by sharing your amazing activities with travelers"
    },
    benefits: {
      legal: {
        title: "Legal Protection",
        description: "Get comprehensive insurance coverage and legal protection for your activities"
      },
      growth: {
        title: "Business Growth",
        description: "Expand your reach and grow your business with our marketing support"
      },
      quality: {
        title: "Quality Standards",
        description: "Maintain high quality standards with our verification and review system"
      },
      flexible: {
        title: "Flexible Schedule",
        description: "Set your own schedule and manage bookings at your convenience"
      }
    },
    registration: {
      title: "Activity Provider Registration",
      subtitle: "Fill out the form below to start listing your activities on our platform"
    },
    form: {
      submit: "Submit Registration"
    }
  },
  form: {
    validation: {
      businessName: "Business name must be at least 2 characters",
      ownerName: "Owner name must be at least 2 characters",
      email: "Please enter a valid email address",
      password: "Password must be at least 8 characters",
      passwordConfirmation: "Passwords don't match",
      phone: "Phone number must be at least 10 characters",
      taxId: "Tax ID must be at least 13 characters",
      address: "Address must be at least 10 characters",
      description: "Description must be at least 50 characters",
      tourismLicense: "Tourism license number is required",
      insurancePolicy: "Insurance policy number is required",
      insuranceAmount: "Insurance coverage amount is required",
      terms: "You must accept the terms of service"
    },
    field: {
      businessName: "Business Name",
      ownerName: "Owner Name",
      email: "Email",
      password: "Password",
      passwordConfirmation: "Confirm Password",
      phone: "Phone",
      taxId: "Tax ID",
      address: "Address",
      description: "Business Description",
      tourismLicense: "Tourism License Number",
      tatLicense: "TAT License Number",
      guideCard: "Guide Card Number",
      insurancePolicy: "Insurance Policy Number",
      insuranceAmount: "Insurance Coverage Amount",
      supportingDocuments: "Supporting Documents",
      terms: "I agree to the terms and conditions"
    },
    placeholder: {
      businessName: "Enter your business name",
      ownerName: "Enter owner's full name",
      email: "Enter email address",
      password: "Enter password",
      passwordConfirmation: "Confirm your password",
      phone: "Enter phone number",
      taxId: "Enter tax identification number",
      address: "Start typing your address...",
      description: "Describe your business and the activities you offer",
      tourismLicense: "Enter tourism license number",
      tatLicense: "Enter TAT license number (optional)",
      guideCard: "Enter guide card number (optional)",
      insurancePolicy: "Enter insurance policy number",
      insuranceAmount: "Enter coverage amount in THB"
    },
    description: {
      tourismLicense: "Required for all activity providers",
      tatLicense: "Required for tour guide services",
      guideCard: "Optional - for certified tour guides",
      insurancePolicy: "Liability insurance policy number",
      insuranceAmount: "Minimum coverage amount in Thai Baht",
      coordinates: "Location coordinates",
      supportingDocuments: "Upload insurance documents, licenses, certifications, and other required paperwork (PDF, JPG, PNG, DOC, DOCX - Max 15MB each)",
      terms: "You agree to comply with all platform policies and regulations"
    },
    section: {
      contact: "Contact Information",
      legal: "Legal & Insurance Information",
      business: "Business Information"
    },
    legal: {
      title: "Legal Requirements",
      requirement1: "Valid business registration in Thailand",
      requirement2: "Tourism license from local authorities",
      requirement3: "Comprehensive liability insurance",
      requirement4: "TAT license (for tour guide services)"
    },
    compliance: {
      title: "Compliance Notice",
      description: "All activity providers must comply with Thai tourism regulations and maintain valid insurance coverage. Your application will be reviewed by our compliance team."
    },
    terms: {
      agreeToThe: "I agree to the",
      termsOfService: "Terms of Service"
    },
    button: {
      submit: "Submit Registration",
      submitting: "Submitting..."
    },
    success: {
      title: "Registration Successful"
    },
    error: {
      title: "Registration Error",
      unexpected: "An unexpected error occurred. Please try again."
    }
  },
  partner: {
    page: {
      title: "Become a Partner",
      description: "Join Guidestination as a partner and grow your business with our activity booking platform"
    },
    registration: {
      title: "Partner Registration",
      subtitle: "Fill out the form below to join our partner network",
      description: "Join Guidestination as a partner and grow your business"
    },
    form: {
      backToInfo: "Back to Partner Information",
      legal: {
        title: "Legal Requirements",
        requirement1: "Valid business registration",
        requirement2: "Current insurance coverage",
        requirement3: "Tourism industry compliance",
        requirement4: "Tax registration documents"
      },
      section: {
        business: "Business Information",
        documents: "Supporting Documents",
        commission: "Commission Package"
      },
      field: {
        businessName: "Business Name",
        businessAddress: "Business Address",
        supportingDocuments: "Supporting Documents"
      },
      placeholder: {
        businessName: "Enter your business name",
        businessAddress: "Enter business address"
      },
      description: {
        businessAddress: "Please provide the complete address of your business"
      },
      documents: {
        title: "Required Documents",
        description: "Upload the following documents to verify your business:",
        item1: "Business registration certificate",
        item2: "Tax registration documents",
        item3: "Insurance certificates",
        item4: "Tourism operator license (if applicable)"
      },
      package: {
        recommended: "Recommended",
        basic: {
          title: "Basic Package",
          description: "Standard commission structure with essential features",
          feature1: "15% commission on bookings",
          feature2: "Basic listing promotion",
          feature3: "Standard customer support",
          feature4: "Monthly payment cycles",
          select: "Select Basic"
        },
        premium: {
          title: "Premium Package",
          description: "Enhanced features with priority support and marketing",
          feature1: "12% commission on bookings",
          feature2: "Priority listing placement",
          feature3: "24/7 dedicated support",
          feature4: "Weekly payment cycles",
          select: "Select Premium"
        }
      },
      materials: {
        title: "Marketing Materials",
        description: "Once approved, you'll receive access to:",
        item1: "Professional listing templates",
        item2: "Marketing banners and assets",
        item3: "Social media content kit",
        item4: "Partner certification badge"
      },
      terms: {
        description: "You agree to comply with our partner terms and conditions"
      },
      success: {
        message: "Registration submitted successfully! Please check your email for verification instructions."
      }
    },
    benefits: {
      title: "Why Partner With Us?",
      subtitle: "Discover the benefits of joining our growing network of partners",
      revenue: {
        title: "Increase Revenue",
        description: "Boost your business income through our commission-based partnership program"
      },
      customers: {
        title: "Reach More Customers",
        description: "Access our growing network of travelers and activity seekers"
      },
      trusted: {
        title: "Trusted Platform",
        description: "Join a secure and reliable platform with verified transactions"
      },
      global: {
        title: "Global Exposure",
        description: "Showcase your business to international and local customers"
      }
    },
    features: {
      title: "Everything You Need to Succeed",
      subtitle: "Our comprehensive partner platform provides all the tools and support you need to grow your business.",
      booking: "Real-time booking management",
      commission: "Automated commission tracking",
      marketing: "Marketing materials and support",
      support: "24/7 customer service",
      analytics: "Analytics and reporting tools",
      mobile: "Mobile-friendly dashboard",
      cta: "Get Started Today"
    },
    dashboard: {
      title: "Partner Dashboard",
      subtitle: "Manage your business efficiently",
      revenue: "Monthly Revenue",
      bookings: "New Bookings",
      rating: "Customer Rating"
    },
    cta: {
      title: "Ready to Get Started?",
      subtitle: "Join thousands of successful partners who are growing their business with Guidestination",
      button: "Apply Now"
    },
    contact: {
      title: "Have Questions?",
      subtitle: "Our partner success team is here to help you every step of the way",
      phone: {
        title: "Call Us",
        number: "+66 2 123 4567"
      },
      email: {
        title: "Email Us",
        address: "partners@guidestination.com"
      },
      location: {
        title: "Visit Us",
        address: "Bangkok, Thailand"
      }
    },
    buttons: {
      listActivity: "List your Activity",
      becomePartner: "Become a Partner"
    }
  },
  profile: {
    page: {
      title: "My Profile"
    },
    tabs: {
      profile: "Profile",
      bookings: "My Bookings",
      wishlist: "Wishlist"
    },
    section: {
      profileInfo: "Profile Information",
      myBookings: "My Bookings",
      myWishlist: "My Wishlist"
    },
    messages: {
      loginRequired: "Please log in to view your profile.",
      loading: "Loading...",
      noBookings: "No bookings found.",
      noWishlist: "No items in wishlist.",
      locationNotSpecified: "Location not specified",
      priceTBA: "Price TBA",
      perPerson: "/person",
      removeFromWishlist: "Remove from wishlist",
      viewDetails: "View Details"
    },
    editForm: {
      title: "Edit Profile",
      description: "Update your personal information",
      fields: {
        fullName: "Full Name",
        email: "Email",
        phoneNumber: "Phone Number"
      },
      placeholders: {
        fullName: "Enter your full name",
        email: "Enter your email",
        phone: "Enter your phone number"
      },
      buttons: {
        saveChanges: "Save Changes",
        saving: "Saving..."
      },
      toast: {
        updateSuccess: "Profile updated successfully!",
        updateError: "Error updating profile"
      }
    },
    bookingDetails: {
      title: "Booking Details",
      status: {
        confirmed: "confirmed",
        pending: "pending",
        cancelled: "cancelled"
      },
      labels: {
        bookingDate: "Booking Date",
        participants: "Participants",
        location: "Location",
        totalAmount: "Total Amount",
        bookingId: "Booking ID",
        unknownActivity: "Unknown Activity",
        noDescription: "No description available",
        locationTBD: "Location TBD",
        participantsCount: "participants"
        ,activityProvider: "Activity provider"
      },
      buttons: {
        close: "Close",
        cancelBooking: "Cancel Booking",
        viewDetails: "View Details"
      }
    }
  },
  activity: {
    details: {
      topRated: "Top rated",
      reviews: "reviews",
      activityProvider: "Activity provider",
      addToWishlist: "Add to wishlist",
      share: "Share",
      experienceHighlights: "Experience Highlights",
      whatsIncluded: "What's Included",
      notIncluded: "Not Included",
      upcomingDates: "Upcoming dates",
      spotsAvailable: "spots available",
      selected: "Selected",
      select: "Select",
      saveUpTo: "Save up to",
      checkAvailability: "Check availability",
      hideSchedules: "Hide schedules",
      bookNow: "Book Now",
      freeCancellation: "Free cancellation",
      hoursBefore: "hours) before activity start",
      instantBooking: "Instant booking",
      activityDetails: "Activity details",
      duration: "Duration",
      groupSize: "Group size",
      languages: "Languages",
      booking: "Booking",
      instant: "Instant",
      ageRequirements: "Age requirements",
      minimumAge: "Minimum age",
      maximumAge: "Maximum age",
      years: "years",
      cancellationPolicy: "Cancellation policy",
      upTo: "Up to",
      people: "people",
      bookThisActivity: "Book This Activity",
      selectedDateTime: "Selected Date & Time",
      numberOfParticipants: "Number of Participants",
      maxParticipants: "Max",
      participants: "participants",
      pricePerPerson: "Price per person",
      totalPrice: "Total Price",
      addToCart: "Add to Cart",
      noImagesAvailable: "No images available",
      selectDate: "Select Date",
      availableExcursions: "Available Excursions",
      noActivitiesAvailable: "No activities available for the selected date.",
      goBack: "Go Back",
      pleaseSelectDate: "Please select a date and time first",
      importantInformation: "Important information",
      activityRequirements: "Activity requirements",
      maximumGroupSize: "Maximum group size",
      physicalEffort: "Physical effort",
      technicalSkill: "Technical skill",
      level: "level",
      instantBookingAvailable: "Instant booking available",
      pickupServiceIncluded: "Pickup service included",
      mealIncluded: "Meal included",
      selectedDateTimeTitle: "Selected Date & Time",
      date: "Date",
      time: "Time",
      price: "Price",
      availableSpots: "Available spots",
      skillLevel: "Skill Level",
      meetingPoints: "Meeting Points",
      pickupPoint: "Pickup Point",
      meetingPoint: "Meeting Point",
      dropoffPoint: "Drop-off Point"
    }
  }
};

// Extend French translations with missing activityOwner section
const fr = {
  ...frImported,
  activityOwner: {
    page: {
      title: "Listez Vos Activités",
      description: "Rejoignez Guidestination en tant que fournisseur d'activités et développez votre entreprise"
    },
    hero: {
      title: "Listez Vos Activités",
      subtitle: "Rejoignez notre plateforme et commencez à gagner en partageant vos activités incroyables avec les voyageurs"
    },
    benefits: {
      legal: {
        title: "Protection Juridique",
        description: "Obtenez une couverture d'assurance complète et une protection juridique pour vos activités"
      },
      growth: {
        title: "Croissance Commerciale",
        description: "Élargissez votre portée et développez votre entreprise avec notre soutien marketing"
      },
      quality: {
        title: "Normes de Qualité",
        description: "Maintenez des normes de qualité élevées avec notre système de vérification et d'évaluation"
      },
      flexible: {
        title: "Horaire Flexible",
        description: "Définissez votre propre horaire et gérez les réservations à votre convenance"
      }
    },
    registration: {
      title: "Inscription Fournisseur d'Activités",
      subtitle: "Remplissez le formulaire ci-dessous pour commencer à lister vos activités sur notre plateforme"
    },
    form: {
      submit: "Soumettre l'Inscription"
    }
  },
  form: {
    validation: {
      businessName: "Le nom de l'entreprise doit contenir au moins 2 caractères",
      ownerName: "Le nom du propriétaire doit contenir au moins 2 caractères",
      email: "Veuillez entrer une adresse email valide",
      password: "Le mot de passe doit contenir au moins 8 caractères",
      passwordConfirmation: "Les mots de passe ne correspondent pas",
      phone: "Le numéro de téléphone doit contenir au moins 10 caractères",
      taxId: "L'identifiant fiscal doit contenir au moins 13 caractères",
      address: "L'adresse doit contenir au moins 10 caractères",
      description: "La description doit contenir au moins 50 caractères",
      tourismLicense: "Le numéro de licence touristique est requis",
      insurancePolicy: "Le numéro de police d'assurance est requis",
      insuranceAmount: "Le montant de couverture d'assurance est requis",
      terms: "Vous devez accepter les conditions de service"
    },
    field: {
      businessName: "Nom de l'Entreprise",
      ownerName: "Nom du Propriétaire",
      email: "Email",
      password: "Mot de Passe",
      passwordConfirmation: "Confirmer le Mot de Passe",
      phone: "Téléphone",
      taxId: "Identifiant Fiscal",
      address: "Adresse",
      description: "Description de l'Entreprise",
      tourismLicense: "Numéro de Licence Touristique",
      tatLicense: "Numéro de Licence TAT",
      guideCard: "Numéro de Carte de Guide",
      insurancePolicy: "Numéro de Police d'Assurance",
      insuranceAmount: "Montant de Couverture d'Assurance",
      supportingDocuments: "Documents Justificatifs",
      terms: "J'accepte les termes et conditions"
    },
    placeholder: {
      businessName: "Entrez le nom de votre entreprise",
      ownerName: "Entrez le nom complet du propriétaire",
      email: "Entrez l'adresse email",
      password: "Entrez le mot de passe",
      passwordConfirmation: "Confirmez votre mot de passe",
      phone: "Entrez le numéro de téléphone",
      taxId: "Entrez le numéro d'identification fiscale",
      address: "Commencez à taper votre adresse...",
      description: "Décrivez votre entreprise et les activités que vous proposez",
      tourismLicense: "Entrez le numéro de licence touristique",
      tatLicense: "Entrez le numéro de licence TAT (optionnel)",
      guideCard: "Entrez le numéro de carte de guide (optionnel)",
      insurancePolicy: "Entrez le numéro de police d'assurance",
      insuranceAmount: "Entrez le montant de couverture en THB"
    },
    description: {
      tourismLicense: "Requis pour tous les fournisseurs d'activités",
      tatLicense: "Requis pour les services de guide touristique",
      guideCard: "Optionnel - pour les guides touristiques certifiés",
      insurancePolicy: "Numéro de police d'assurance responsabilité",
      insuranceAmount: "Montant de couverture minimum en baht thaïlandais",
      coordinates: "Coordonnées de localisation",
      supportingDocuments: "Téléchargez les documents d'assurance, licences, certifications et autres documents requis (PDF, JPG, PNG, DOC, DOCX - Max 15MB chacun)",
      terms: "Vous acceptez de vous conformer à toutes les politiques et réglementations de la plateforme"
    },
    section: {
      contact: "Informations de Contact",
      legal: "Informations Légales et d'Assurance",
      business: "Informations sur l'Entreprise"
    },
    legal: {
      title: "Exigences Légales",
      requirement1: "Enregistrement d'entreprise valide en Thaïlande",
      requirement2: "Licence touristique des autorités locales",
      requirement3: "Assurance responsabilité civile complète",
      requirement4: "Licence TAT (pour les services de guide touristique)"
    },
    compliance: {
      title: "Avis de Conformité",
      description: "Tous les fournisseurs d'activités doivent se conformer aux réglementations touristiques thaïlandaises et maintenir une couverture d'assurance valide. Votre candidature sera examinée par notre équipe de conformité."
    },
    terms: {
      agreeToThe: "J'accepte les",
      termsOfService: "Conditions de Service"
    },
    button: {
      submit: "Soumettre l'Inscription",
      submitting: "Soumission en cours..."
    },
    success: {
      title: "Inscription Réussie"
    },
    error: {
      title: "Erreur d'Inscription",
      unexpected: "Une erreur inattendue s'est produite. Veuillez réessayer."
    }
  },
  partner: {
    page: {
      title: "Devenir Partenaire",
      description: "Rejoignez Guidestination en tant que partenaire et développez votre entreprise avec notre plateforme de réservation d'activités"
    },
    registration: {
      title: "Inscription Partenaire",
      subtitle: "Remplissez le formulaire ci-dessous pour rejoindre notre réseau de partenaires",
      description: "Rejoignez Guidestination en tant que partenaire et développez votre entreprise"
    },
    form: {
      backToInfo: "Retour aux Informations Partenaire",
      legal: {
        title: "Exigences Légales",
        requirement1: "Immatriculation d'entreprise valide",
        requirement2: "Couverture d'assurance actuelle",
        requirement3: "Conformité de l'industrie touristique",
        requirement4: "Documents d'immatriculation fiscale"
      },
      section: {
        business: "Informations sur l'Entreprise",
        documents: "Documents Justificatifs",
        commission: "Package Commission"
      },
      field: {
        businessName: "Nom de l'Entreprise",
        businessAddress: "Adresse de l'Entreprise",
        supportingDocuments: "Documents Justificatifs"
      },
      placeholder: {
        businessName: "Entrez le nom de votre entreprise",
        businessAddress: "Entrez l'adresse de l'entreprise"
      },
      description: {
        businessAddress: "Veuillez fournir l'adresse complète de votre entreprise"
      },
      documents: {
        title: "Documents Requis",
        description: "Téléchargez les documents suivants pour vérifier votre entreprise :",
        item1: "Certificat d'immatriculation d'entreprise",
        item2: "Documents d'immatriculation fiscale",
        item3: "Certificats d'assurance",
        item4: "Licence d'opérateur touristique (le cas échéant)"
      },
      package: {
        recommended: "Recommandé",
        basic: {
          title: "Package de Base",
          description: "Structure de commission standard avec fonctionnalités essentielles",
          feature1: "15% de commission sur les réservations",
          feature2: "Promotion de liste de base",
          feature3: "Support client standard",
          feature4: "Cycles de paiement mensuels",
          select: "Sélectionner Base"
        },
        premium: {
          title: "Package Premium",
          description: "Fonctionnalités améliorées avec support prioritaire et marketing",
          feature1: "12% de commission sur les réservations",
          feature2: "Placement prioritaire dans les listes",
          feature3: "Support dédié 24h/24 et 7j/7",
          feature4: "Cycles de paiement hebdomadaires",
          select: "Sélectionner Premium"
        }
      },
      materials: {
        title: "Matériel Marketing",
        description: "Une fois approuvé, vous aurez accès à :",
        item1: "Modèles de liste professionnels",
        item2: "Bannières marketing et ressources",
        item3: "Kit de contenu pour réseaux sociaux",
        item4: "Badge de certification partenaire"
      },
      terms: {
        description: "Vous acceptez de vous conformer à nos conditions générales de partenariat"
      },
      success: {
        message: "Inscription soumise avec succès ! Veuillez vérifier votre email pour les instructions de vérification."
      }
    },
    benefits: {
      title: "Pourquoi Devenir Partenaire ?",
      subtitle: "Découvrez les avantages de rejoindre notre réseau croissant de partenaires",
      revenue: {
        title: "Augmenter les Revenus",
        description: "Boostez les revenus de votre entreprise grâce à notre programme de partenariat basé sur les commissions"
      },
      customers: {
        title: "Atteindre Plus de Clients",
        description: "Accédez à notre réseau croissant de voyageurs et de chercheurs d'activités"
      },
      trusted: {
        title: "Plateforme de Confiance",
        description: "Rejoignez une plateforme sécurisée et fiable avec des transactions vérifiées"
      },
      global: {
        title: "Exposition Mondiale",
        description: "Présentez votre entreprise aux clients internationaux et locaux"
      }
    },
    features: {
      title: "Tout ce dont Vous Avez Besoin pour Réussir",
      subtitle: "Notre plateforme partenaire complète fournit tous les outils et le support dont vous avez besoin pour développer votre entreprise.",
      booking: "Gestion des réservations en temps réel",
      commission: "Suivi automatisé des commissions",
      marketing: "Matériel marketing et support",
      support: "Service client 24h/24 et 7j/7",
      analytics: "Outils d'analyse et de reporting",
      mobile: "Tableau de bord adapté aux mobiles",
      cta: "Commencer Aujourd'hui"
    },
    dashboard: {
      title: "Tableau de Bord Partenaire",
      subtitle: "Gérez votre entreprise efficacement",
      revenue: "Revenus Mensuels",
      bookings: "Nouvelles Réservations",
      rating: "Évaluation Client"
    },
    cta: {
      title: "Prêt à Commencer ?",
      subtitle: "Rejoignez des milliers de partenaires prospères qui développent leur entreprise avec Guidestination",
      button: "Postuler Maintenant"
    },
    contact: {
      title: "Des Questions ?",
      subtitle: "Notre équipe de succès partenaire est là pour vous aider à chaque étape",
      phone: {
        title: "Appelez-nous",
        number: "+66 2 123 4567"
      },
      email: {
        title: "Envoyez-nous un Email",
        address: "partners@guidestination.com"
      },
      location: {
        title: "Visitez-nous",
        address: "Bangkok, Thaïlande"
      }
    },
    buttons: {
      listActivity: "Listez votre Activité",
      becomePartner: "Devenir Partenaire"
    }
  },
  profile: {
    page: {
      title: "Mon Profil"
    },
    tabs: {
      profile: "Profil",
      bookings: "Mes Réservations",
      wishlist: "Liste de Souhaits"
    },
    section: {
      profileInfo: "Informations du Profil",
      myBookings: "Mes Réservations",
      myWishlist: "Ma Liste de Souhaits"
    },
    messages: {
      loginRequired: "Veuillez vous connecter pour voir votre profil.",
      loading: "Chargement...",
      noBookings: "Aucune réservation trouvée.",
      noWishlist: "Aucun élément dans la liste de souhaits.",
      locationNotSpecified: "Lieu non spécifié",
      priceTBA: "Prix à déterminer",
      perPerson: "/personne",
      removeFromWishlist: "Retirer de la liste de souhaits",
      viewDetails: "Voir les Détails"
    },
    editForm: {
      title: "Modifier le Profil",
      description: "Mettez à jour vos informations personnelles",
      fields: {
        fullName: "Nom Complet",
        email: "Email",
        phoneNumber: "Numéro de Téléphone"
      },
      placeholders: {
        fullName: "Entrez votre nom complet",
        email: "Entrez votre email",
        phone: "Entrez votre numéro de téléphone"
      },
      buttons: {
        saveChanges: "Enregistrer les Modifications",
        saving: "Enregistrement..."
      },
      toast: {
        updateSuccess: "Profil mis à jour avec succès!",
        updateError: "Erreur lors de la mise à jour du profil"
      }
    },
    bookingDetails: {
      title: "Détails de la Réservation",
      status: {
        confirmed: "confirmé",
        pending: "en attente",
        cancelled: "annulé"
      },
      labels: {
        bookingDate: "Date de Réservation",
        participants: "Participants",
        location: "Lieu",
        totalAmount: "Montant Total",
        bookingId: "ID de Réservation",
        unknownActivity: "Activité Inconnue",
        noDescription: "Aucune description disponible",
        locationTBD: "Lieu à déterminer",
        participantsCount: "participants"
        ,activityProvider: "Fournisseur d'activité"
      },
      buttons: {
        close: "Fermer",
        cancelBooking: "Annuler la Réservation",
        viewDetails: "Voir les Détails"
      }
    }
  },
  activity: {
    details: {
      topRated: "Le mieux noté",
      reviews: "avis",
      activityProvider: "Fournisseur d'activité",
      addToWishlist: "Ajouter aux favoris",
      share: "Partager",
      experienceHighlights: "Points Forts de l'Expérience",
      whatsIncluded: "Ce qui est Inclus",
      notIncluded: "Non Inclus",
      upcomingDates: "Dates à venir",
      spotsAvailable: "places disponibles",
      selected: "Sélectionné",
      select: "Sélectionner",
      saveUpTo: "Économisez jusqu'à",
      checkAvailability: "Vérifier la disponibilité",
      hideSchedules: "Masquer les horaires",
      bookNow: "Réserver Maintenant",
      freeCancellation: "Annulation gratuite",
      hoursBefore: "heures) avant le début de l'activité",
      instantBooking: "Réservation instantanée",
      activityDetails: "Détails de l'activité",
      duration: "Durée",
      groupSize: "Taille du groupe",
      languages: "Langues",
      booking: "Réservation",
      instant: "Instantané",
      ageRequirements: "Exigences d'âge",
      minimumAge: "Âge minimum",
      maximumAge: "Âge maximum",
      years: "ans",
      cancellationPolicy: "Politique d'annulation",
      upTo: "Jusqu'à",
      people: "personnes",
      bookThisActivity: "Réserver cette Activité",
      selectedDateTime: "Date et Heure Sélectionnées",
      numberOfParticipants: "Nombre de Participants",
      maxParticipants: "Max",
      participants: "participants",
      pricePerPerson: "Prix par personne",
      totalPrice: "Prix Total",
      addToCart: "Ajouter au Panier",
      noImagesAvailable: "Aucune image disponible",
      selectDate: "Sélectionner la Date",
      availableExcursions: "Excursions Disponibles",
      noActivitiesAvailable: "Aucune activité disponible pour la date sélectionnée.",
      goBack: "Retour",
      pleaseSelectDate: "Veuillez d'abord sélectionner une date et une heure",
      importantInformation: "Informations importantes",
      activityRequirements: "Exigences de l'activité",
      maximumGroupSize: "Taille maximale du groupe",
      physicalEffort: "Effort physique",
      technicalSkill: "Compétence technique",
      level: "niveau",
      instantBookingAvailable: "Réservation instantanée disponible",
      pickupServiceIncluded: "Service de ramassage inclus",
      mealIncluded: "Repas inclus",
      selectedDateTimeTitle: "Date et Heure Sélectionnées",
      date: "Date",
      time: "Heure",
      price: "Prix",
      availableSpots: "Places disponibles",
      skillLevel: "Niveau de Compétence",
      meetingPoints: "Points de Rendez-vous",
      pickupPoint: "Point de Ramassage",
      meetingPoint: "Point de Rendez-vous",
      dropoffPoint: "Point de Dépôt"
    }
  }
};

// Create a simple fallback for Thai
const th = {
  seo: {
    title: "Guidestination - ค้นพบกิจกรรมที่น่าสนใจ",
    description: "ค้นหาและจองประสบการณ์ที่ไม่เหมือนใครทั่วโลก"
  },
  hero: {
    title: "ค้นพบความมหัศจรรย์ของเชียงใหม่",
    subtitle: "ค้นหาและจองประสบการณ์ที่ไม่เหมือนใครทั่วโลก"
  },
  nav: {
    home: "หน้าแรก",
    activities: "กิจกรรม",
    planning: "วางแผน",
    login: "เข้าสู่ระบบ",
    logout: "ออกจากระบบ",
    register: "สมัครสมาชิก",
    listActivities: "ลงกิจกรรม",
    listActivitiesFull: "ลงกิจกรรมของคุณ",
    becomePartner: "เป็นพาร์ทเนอร์",
    becomePartnerFull: "เป็นพาร์ทเนอร์กับเรา",
    profile: "โปรไฟล์",
    myBookings: "การจองของฉัน",
    wishlist: "รายการโปรด",
    settings: "การตั้งค่า",
    myAccount: "บัญชีของฉัน",
    signingOut: "กำลังออกจากระบบ...",
    signOut: "ออกจากระบบ"
  },
  home: {
    welcomeMessage: "ยินดีต้อนรับ {{userName}}! พร้อมสำหรับการผจญภัยครั้งต่อไปหรือยัง?",
    activitiesCount: "เรามี {{count}} กิจกรรมที่น่าสนใจรอคุณอยู่!",
    recommendedTitle: "แนะนำจากเรา",
    recommendedSubtitle: "ค้นพบประสบการณ์ที่ได้รับคะแนนสูงสุดของเรา",
    viewAll: "ดูทั้งหมด",
    popular: "ยอดนิยม",
    noActivities: "ไม่มีกิจกรรมในขณะนี้",
    hero: {
      title: "ค้นพบความมหัศจรรย์ของเชียงใหม่"
    }
  },
  common: {
    loading: "กำลังโหลด...",
    error: "ข้อผิดพลาด",
    search: "ค้นหา",
    book: "จอง",
    cancel: "ยกเลิก",
    confirm: "ยืนยัน"
  },
  activityOwner: {
    page: {
      title: "ลงกิจกรรมของคุณ",
      description: "เข้าร่วม Guidestination ในฐานะผู้ให้บริการกิจกรรมและขยายธุรกิจของคุณ"
    },
    hero: {
      title: "ลงกิจกรรมของคุณ",
      subtitle: "เข้าร่วมแพลตฟอร์มของเราและเริ่มสร้างรายได้ด้วยการแบ่งปันกิจกรรมที่น่าทึ่งของคุณกับนักท่องเที่ยว"
    },
    benefits: {
      legal: {
        title: "ความคุ้มครองทางกฎหมาย",
        description: "รับความคุ้มครองประกันภัยและการปกป้องทางกฎหมายอย่างครอบคลุมสำหรับกิจกรรมของคุณ"
      },
      growth: {
        title: "การเติบโตทางธุรกิจ",
        description: "ขยายการเข้าถึงและพัฒนาธุรกิจของคุณด้วยการสนับสนุนด้านการตลาดของเรา"
      },
      quality: {
        title: "มาตรฐานคุณภาพ",
        description: "รักษามาตรฐานคุณภาพสูงด้วยระบบการตรวจสอบและการรีวิวของเรา"
      },
      flexible: {
        title: "ตารางเวลาที่ยืดหยุ่น",
        description: "กำหนดตารางเวลาของคุณเองและจัดการการจองตามความสะดวกของคุณ"
      }
    },
    registration: {
      title: "การลงทะเบียนผู้ให้บริการกิจกรรม",
      subtitle: "กรอกแบบฟอร์มด้านล่างเพื่อเริ่มลงรายการกิจกรรมของคุณบนแพลตฟอร์มของเรา"
    },
    form: {
      submit: "ส่งการลงทะเบียน"
    }
  },
  form: {
    validation: {
      businessName: "ชื่อธุรกิจต้องมีอย่างน้อย 2 ตัวอักษร",
      ownerName: "ชื่อเจ้าของต้องมีอย่างน้อย 2 ตัวอักษร",
      email: "กรุณากรอกอีเมลที่ถูกต้อง",
      password: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
      passwordConfirmation: "รหัสผ่านไม่ตรงกัน",
      phone: "หมายเลขโทรศัพท์ต้องมีอย่างน้อย 10 ตัวอักษร",
      taxId: "เลขประจำตัวผู้เสียภาษีต้องมีอย่างน้อย 13 ตัวอักษร",
      address: "ที่อยู่ต้องมีอย่างน้อย 10 ตัวอักษร",
      description: "คำอธิบายต้องมีอย่างน้อย 50 ตัวอักษร",
      tourismLicense: "หมายเลขใบอนุญาตท่องเที่ยวจำเป็นต้องกรอก",
      insurancePolicy: "หมายเลขกรมธรรม์ประกันภัยจำเป็นต้องกรอก",
      insuranceAmount: "จำนวนเงินความคุ้มครองประกันภัยจำเป็นต้องกรอก",
      terms: "คุณต้องยอมรับข้อกำหนดการให้บริการ"
    },
    field: {
      businessName: "ชื่อธุรกิจ",
      ownerName: "ชื่อเจ้าของ",
      email: "อีเมล",
      password: "รหัสผ่าน",
      passwordConfirmation: "ยืนยันรหัสผ่าน",
      phone: "โทรศัพท์",
      taxId: "เลขประจำตัวผู้เสียภาษี",
      address: "ที่อยู่",
      description: "คำอธิบายธุรกิจ",
      tourismLicense: "หมายเลขใบอนุญาตท่องเที่ยว",
      tatLicense: "หมายเลขใบอนุญาต TAT",
      guideCard: "หมายเลขใบอนุญาตมัคคุเทศก์",
      insurancePolicy: "หมายเลขกรมธรรม์ประกันภัย",
      insuranceAmount: "จำนวนเงินความคุ้มครองประกันภัย",
      supportingDocuments: "เอกสารประกอบ",
      terms: "ฉันยอมรับข้อกำหนดและเงื่อนไข"
    },
    placeholder: {
      businessName: "กรอกชื่อธุรกิจของคุณ",
      ownerName: "กรอกชื่อเต็มของเจ้าของ",
      email: "กรอกที่อยู่อีเมล",
      password: "กรอกรหัสผ่าน",
      passwordConfirmation: "ยืนยันรหัสผ่านของคุณ",
      phone: "กรอกหมายเลขโทรศัพท์",
      taxId: "กรอกเลขประจำตัวผู้เสียภาษี",
      address: "เริ่มพิมพ์ที่อยู่ของคุณ...",
      description: "อธิบายธุรกิจและกิจกรรมที่คุณเสนอ",
      tourismLicense: "กรอกหมายเลขใบอนุญาตท่องเที่ยว",
      tatLicense: "กรอกหมายเลขใบอนุญาต TAT (ไม่บังคับ)",
      guideCard: "กรอกหมายเลขใบอนุญาตมัคคุเทศก์ (ไม่บังคับ)",
      insurancePolicy: "กรอกหมายเลขกรมธรรม์ประกันภัย",
      insuranceAmount: "กรอกจำนวนเงินความคุ้มครองเป็นบาท"
    },
    description: {
      tourismLicense: "จำเป็นสำหรับผู้ให้บริการกิจกรรมทั้งหมด",
      tatLicense: "จำเป็นสำหรับบริการมัคคุเทศก์",
      guideCard: "ไม่บังคับ - สำหรับมัคคุเทศก์ที่ได้รับใบรับรอง",
      insurancePolicy: "หมายเลขกรมธรรม์ประกันภัยความรับผิดชอบ",
      insuranceAmount: "จำนวนเงินความคุ้มครองขั้นต่ำเป็นบาทไทย",
      coordinates: "พิกัดตำแหน่ง",
      supportingDocuments: "อัปโหลดเอกสารประกันภัย ใบอนุญาต ใบรับรอง และเอกสารที่จำเป็นอื่นๆ (PDF, JPG, PNG, DOC, DOCX - สูงสุด 15MB ต่อไฟล์)",
      terms: "คุณยอมรับที่จะปฏิบัติตามนโยบายและข้อบังคับทั้งหมดของแพลตฟอร์ม"
    },
    section: {
      contact: "ข้อมูลการติดต่อ",
      legal: "ข้อมูลทางกฎหมายและประกันภัย",
      business: "ข้อมูลธุรกิจ"
    },
    legal: {
      title: "ข้อกำหนดทางกฎหมาย",
      requirement1: "การจดทะเบียนธุรกิจที่ถูกต้องในประเทศไทย",
      requirement2: "ใบอนุญาตท่องเที่ยวจากหน่วยงานท้องถิ่น",
      requirement3: "ประกันภัยความรับผิดชอบอย่างครอบคลุม",
      requirement4: "ใบอนุญาต TAT (สำหรับบริการมัคคุเทศก์)"
    },
    compliance: {
      title: "ประกาศการปฏิบัติตามกฎระเบียบ",
      description: "ผู้ให้บริการกิจกรรมทั้งหมดต้องปฏิบัติตามกฎระเบียบการท่องเที่ยวของไทยและรักษาความคุ้มครองประกันภัยที่ถูกต้อง ใบสมัครของคุณจะได้รับการตรวจสอบโดยทีมการปฏิบัติตามกฎระเบียบของเรา"
    },
    terms: {
      agreeToThe: "ฉันยอมรับ",
      termsOfService: "ข้อกำหนดการให้บริการ"
    },
    button: {
      submit: "ส่งการลงทะเบียน",
      submitting: "กำลังส่ง..."
    },
    success: {
      title: "ลงทะเบียนสำเร็จ"
    },
    error: {
      title: "ข้อผิดพลาดในการลงทะเบียน",
      unexpected: "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง"
    }
  },
  partner: {
    page: {
      title: "เป็นพาร์ทเนอร์",
      description: "เข้าร่วม Guidestination ในฐานะพาร์ทเนอร์และพัฒนาธุรกิจของคุณด้วยแพลตฟอร์มการจองกิจกรรมของเรา"
    },
    registration: {
      title: "ลงทะเบียนพาร์ทเนอร์",
      subtitle: "กรอกแบบฟอร์มด้านล่างเพื่อเข้าร่วมเครือข่ายพาร์ทเนอร์ของเรา",
      description: "เข้าร่วม Guidestination ในฐานะพาร์ทเนอร์และพัฒนาธุรกิจของคุณ"
    },
    form: {
      backToInfo: "กลับไปยังข้อมูลพาร์ทเนอร์",
      legal: {
        title: "ข้อกำหนดทางกฎหมาย",
        requirement1: "การจดทะเบียนธุรกิจที่ถูกต้อง",
        requirement2: "ความคุ้มครองประกันภัยปัจจุบัน",
        requirement3: "การปฏิบัติตามข้อกำหนดอุตสาหกรรมการท่องเที่ยว",
        requirement4: "เอกสารการจดทะเบียนภาษี"
      },
      section: {
        business: "ข้อมูลธุรกิจ",
        documents: "เอกสารประกอบ",
        commission: "แพ็คเกจค่าคอมมิชชั่น"
      },
      field: {
        businessName: "ชื่อธุรกิจ",
        businessAddress: "ที่อยู่ธุรกิจ",
        supportingDocuments: "เอกสารประกอบ"
      },
      placeholder: {
        businessName: "กรอกชื่อธุรกิจของคุณ",
        businessAddress: "กรอกที่อยู่ธุรกิจ"
      },
      description: {
        businessAddress: "กรุณาระบุที่อยู่ธุรกิจของคุณให้ครบถ้วน"
      },
      documents: {
        title: "เอกสารที่จำเป็น",
        description: "อัปโหลดเอกสารต่อไปนี้เพื่อตรวจสอบธุรกิจของคุณ:",
        item1: "ใบรับรองการจดทะเบียนธุรกิจ",
        item2: "เอกสารการจดทะเบียนภาษี",
        item3: "ใบรับรองประกันภัย",
        item4: "ใบอนุญาตประกอบการท่องเที่ยว (หากมี)"
      },
      package: {
        recommended: "แนะนำ",
        basic: {
          title: "แพ็คเกจพื้นฐาน",
          description: "โครงสร้างค่าคอมมิชชั่นมาตรฐานพร้อมคุณสมบัติที่จำเป็น",
          feature1: "ค่าคอมมิชชั่น 15% จากการจอง",
          feature2: "การโปรโมทรายการพื้นฐาน",
          feature3: "การสนับสนุนลูกค้ามาตรฐาน",
          feature4: "รอบการชำระเงินรายเดือน",
          select: "เลือกพื้นฐาน"
        },
        premium: {
          title: "แพ็คเกจพรีเมียม",
          description: "คุณสมบัติที่ปรับปรุงแล้วพร้อมการสนับสนุนและการตลาดที่มีความสำคัญ",
          feature1: "ค่าคอมมิชชั่น 12% จากการจอง",
          feature2: "การจัดวางรายการที่มีความสำคัญ",
          feature3: "การสนับสนุนเฉพาะบุคคล 24/7",
          feature4: "รอบการชำระเงินรายสัปดาห์",
          select: "เลือกพรีเมียม"
        }
      },
      materials: {
        title: "วัสดุการตลาด",
        description: "เมื่อได้รับอนุมัติแล้ว คุณจะได้รับการเข้าถึง:",
        item1: "เทมเพลตรายการมืออาชีพ",
        item2: "แบนเนอร์การตลาดและสินทรัพย์",
        item3: "ชุดเนื้อหาโซเชียลมีเดีย",
        item4: "ตรารับรองพาร์ทเนอร์"
      },
      terms: {
        description: "คุณยอมรับที่จะปฏิบัติตามข้อกำหนดและเงื่อนไขพาร์ทเนอร์ของเรา"
      },
      success: {
        message: "ส่งการลงทะเบียนเรียบร้อยแล้ว! กรุณาตรวจสอบอีเมลของคุณสำหรับคำแนะนำการตรวจสอบ"
      }
    },
    benefits: {
      title: "ทำไมต้องเป็นพาร์ทเนอร์กับเรา?",
      subtitle: "ค้นพบประโยชน์ของการเข้าร่วมเครือข่ายพาร์ทเนอร์ที่เติบโตของเรา",
      revenue: {
        title: "เพิ่มรายได้",
        description: "เพิ่มรายได้ธุรกิจของคุณผ่านโปรแกรมพาร์ทเนอร์ที่ใช้ระบบค่าคอมมิชชั่น"
      },
      customers: {
        title: "เข้าถึงลูกค้าได้มากขึ้น",
        description: "เข้าถึงเครือข่ายนักท่องเที่ยวและผู้ที่มองหากิจกรรมที่เติบโตของเรา"
      },
      trusted: {
        title: "แพลตฟอร์มที่เชื่อถือได้",
        description: "เข้าร่วมแพลตฟอร์มที่ปลอดภัยและเชื่อถือได้พร้อมการตรวจสอบธุรกรรม"
      },
      global: {
        title: "การเปิดรับทั่วโลก",
        description: "แสดงธุรกิจของคุณให้ลูกค้าระหว่างประเทศและในประเทศได้เห็น"
      }
    },
    features: {
      title: "ทุกสิ่งที่คุณต้องการเพื่อความสำเร็จ",
      subtitle: "แพลตฟอร์มพาร์ทเนอร์ที่ครอบคลุมของเราให้เครื่องมือและการสนับสนุนทั้งหมดที่คุณต้องการเพื่อพัฒนาธุรกิจของคุณ",
      booking: "การจัดการการจองแบบเรียลไทม์",
      commission: "การติดตามค่าคอมมิชชั่นอัตโนมัติ",
      marketing: "วัสดุการตลาดและการสนับสนุน",
      support: "บริการลูกค้า 24/7",
      analytics: "เครื่องมือการวิเคราะห์และรายงาน",
      mobile: "แดชบอร์ดที่ใช้งานบนมือถือได้",
      cta: "เริ่มต้นวันนี้"
    },
    dashboard: {
      title: "แดชบอร์ดพาร์ทเนอร์",
      subtitle: "จัดการธุรกิจของคุณอย่างมีประสิทธิภาพ",
      revenue: "รายได้รายเดือน",
      bookings: "การจองใหม่",
      rating: "คะแนนความพึงพอใจลูกค้า"
    },
    cta: {
      title: "พร้อมที่จะเริ่มต้นแล้วหรือยัง?",
      subtitle: "เข้าร่วมกับพาร์ทเนอร์หลายพันรายที่ประสบความสำเร็จและกำลังพัฒนาธุรกิจของพวกเขากับ Guidestination",
      button: "สมัครเลย"
    },
    contact: {
      title: "มีคำถามหรือไม่?",
      subtitle: "ทีมความสำเร็จพาร์ทเนอร์ของเราพร้อมช่วยเหลือคุณทุกขั้นตอน",
      phone: {
        title: "โทรหาเรา",
        number: "+66 2 123 4567"
      },
      email: {
        title: "ส่งอีเมลหาเรา",
        address: "partners@guidestination.com"
      },
      location: {
        title: "มาเยี่ยมเรา",
        address: "กรุงเทพฯ, ประเทศไทย"
      }
    },
    buttons: {
      listActivity: "ลงรายการกิจกรรม",
      becomePartner: "เป็นพาร์ทเนอร์"
    }
  },
  profile: {
    page: {
      title: "โปรไฟล์ของฉัน"
    },
    tabs: {
      profile: "โปรไฟล์",
      bookings: "การจองของฉัน",
      wishlist: "รายการโปรด"
    },
    section: {
      profileInfo: "ข้อมูลโปรไฟล์",
      myBookings: "การจองของฉัน",
      myWishlist: "รายการโปรดของฉัน"
    },
    messages: {
      loginRequired: "กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์ของคุณ",
      loading: "กำลังโหลด...",
      noBookings: "ไม่พบการจอง",
      noWishlist: "ไม่มีรายการในรายการโปรด",
      locationNotSpecified: "ไม่ได้ระบุสถานที่",
      priceTBA: "ราคาจะแจ้งให้ทราบ",
      perPerson: "/คน",
      removeFromWishlist: "ลบออกจากรายการโปรด",
      viewDetails: "ดูรายละเอียด"
    },
    editForm: {
      title: "แก้ไขโปรไฟล์",
      description: "อัปเดตข้อมูลส่วนตัวของคุณ",
      fields: {
        fullName: "ชื่อเต็ม",
        email: "อีเมล",
        phoneNumber: "หมายเลขโทรศัพท์"
      },
      placeholders: {
        fullName: "ป้อนชื่อเต็มของคุณ",
        email: "ป้อนอีเมลของคุณ",
        phone: "ป้อนหมายเลขโทรศัพท์ของคุณ"
      },
      buttons: {
        saveChanges: "บันทึกการเปลี่ยนแปลง",
        saving: "กำลังบันทึก..."
      },
      toast: {
        updateSuccess: "อัปเดตโปรไฟล์สำเร็จ!",
        updateError: "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์"
      }
    },
    bookingDetails: {
      title: "รายละเอียดการจอง",
      status: {
        confirmed: "ยืนยันแล้ว",
        pending: "รอดำเนินการ",
        cancelled: "ยกเลิกแล้ว"
      },
      labels: {
        bookingDate: "วันที่จอง",
        participants: "ผู้เข้าร่วม",
        location: "สถานที่",
        totalAmount: "จำนวนเงินรวม",
        bookingId: "รหัสการจอง",
        unknownActivity: "กิจกรรมที่ไม่ทราบ",
        noDescription: "ไม่มีคำอธิบาย",
        locationTBD: "สถานที่จะแจ้งให้ทราบ",
        participantsCount: "ผู้เข้าร่วม"
        ,activityProvider: "ผู้ให้บริการกิจกรรม"
      },
      buttons: {
        close: "ปิด",
        cancelBooking: "ยกเลิกการจอง",
        viewDetails: "ดูรายละเอียด"
      }
    }
  },
  activity: {
    details: {
      topRated: "ได้คะแนนสูงสุด",
      reviews: "รีวิว",
      activityProvider: "ผู้ให้บริการกิจกรรม",
      addToWishlist: "เพิ่มในรายการโปรด",
      share: "แชร์",
      experienceHighlights: "จุดเด่นของประสบการณ์",
      whatsIncluded: "สิ่งที่รวมอยู่ในแพ็คเกจ",
      notIncluded: "ไม่รวมในแพ็คเกจ",
      upcomingDates: "วันที่กำลังจะมาถึง",
      spotsAvailable: "ที่ว่าง",
      selected: "เลือกแล้ว",
      select: "เลือก",
      saveUpTo: "ประหยัดได้ถึง",
      checkAvailability: "ตรวจสอบความพร้อม",
      hideSchedules: "ซ่อนตารางเวลา",
      bookNow: "จองเลย",
      freeCancellation: "ยกเลิกฟรี",
      hoursBefore: "ชั่วโมง) ก่อนเริ่มกิจกรรม",
      instantBooking: "จองทันที",
      activityDetails: "รายละเอียดกิจกรรม",
      duration: "ระยะเวลา",
      groupSize: "ขนาดกลุ่ม",
      languages: "ภาษา",
      booking: "การจอง",
      instant: "ทันที",
      ageRequirements: "ข้อกำหนดอายุ",
      minimumAge: "อายุขั้นต่ำ",
      maximumAge: "อายุสูงสุด",
      years: "ปี",
      cancellationPolicy: "นโยบายการยกเลิก",
      upTo: "สูงสุด",
      people: "คน",
      bookThisActivity: "จองกิจกรรมนี้",
      selectedDateTime: "วันที่และเวลาที่เลือก",
      numberOfParticipants: "จำนวนผู้เข้าร่วม",
      maxParticipants: "สูงสุด",
      participants: "ผู้เข้าร่วม",
      pricePerPerson: "ราคาต่อคน",
      totalPrice: "ราคารวม",
      addToCart: "เพิ่มในตะกร้า",
      noImagesAvailable: "ไม่มีรูปภาพ",
      selectDate: "เลือกวันที่",
      availableExcursions: "ทริปที่มี",
      noActivitiesAvailable: "ไม่มีกิจกรรมสำหรับวันที่เลือก",
      goBack: "กลับ",
      pleaseSelectDate: "กรุณาเลือกวันที่และเวลาก่อน",
      importantInformation: "ข้อมูลสำคัญ",
      activityRequirements: "ข้อกำหนดกิจกรรม",
      maximumGroupSize: "ขนาดกลุ่มสูงสุด",
      physicalEffort: "ความพยายามทางร่างกาย",
      technicalSkill: "ทักษะเทคนิค",
      level: "ระดับ",
      instantBookingAvailable: "มีการจองทันที",
      pickupServiceIncluded: "รวมบริการรับส่ง",
      mealIncluded: "รวมอาหาร",
      selectedDateTimeTitle: "วันที่และเวลาที่เลือก",
      date: "วันที่",
      time: "เวลา",
      price: "ราคา",
      availableSpots: "ที่ว่าง",
      skillLevel: "ระดับทักษะ",
      meetingPoints: "จุดนัดพบ",
      pickupPoint: "จุดรับ",
      meetingPoint: "จุดนัดพบ",
      dropoffPoint: "จุดส่ง"
    }
  }
};

export const translations = {
  en,
  th,
  fr
} as const

// Helper function to get nested values from translation object
export function getTranslationValue(
  obj: any,
  path: string,
  fallback: string = ''
): string {
  const keys = path.split('.')
  let value = obj
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return fallback || path // Return the key itself if translation missing
    }
  }
  
  return typeof value === 'string' ? value : fallback || path
}

// Interpolation function for dynamic values
export function interpolate(
  template: string,
  params: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key]?.toString() || match
  })
}

// Get available languages
export function getAvailableLanguages(): Array<{
  code: SupportedLanguage
  name: string
  flag: string
}> {
  return [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ]
}
