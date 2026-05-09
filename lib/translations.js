// Language configuration and translations
export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', flag: '🇬🇧' },
  es: { code: 'es', name: 'Español', flag: '🇪🇸' },
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ja: { code: 'ja', name: '日本語', flag: '🇯🇵' },
  zh: { code: 'zh', name: '中文', flag: '🇨🇳' },
  pt: { code: 'pt', name: 'Português', flag: '🇵🇹' },
  it: { code: 'it', name: 'Italiano', flag: '🇮🇹' },
};

export const SECTION_TRANSLATIONS = {
  en: {
    contactInfo: 'Contact Information',
    summary: 'Professional Summary',
    skills: 'Skills',
    experience: 'Experience',
    education: 'Education',
    projects: 'Projects',
    email: 'Email',
    phone: 'Phone',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
  },
  es: {
    contactInfo: 'Información de Contacto',
    summary: 'Resumen Profesional',
    skills: 'Habilidades',
    experience: 'Experiencia',
    education: 'Educación',
    projects: 'Proyectos',
    email: 'Correo Electrónico',
    phone: 'Teléfono',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
  },
  fr: {
    contactInfo: 'Informations de Contact',
    summary: 'Résumé Professionnel',
    skills: 'Compétences',
    experience: 'Expérience',
    education: 'Éducation',
    projects: 'Projets',
    email: 'Email',
    phone: 'Téléphone',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
  },
  de: {
    contactInfo: 'Kontaktinformationen',
    summary: 'Berufliche Zusammenfassung',
    skills: 'Fähigkeiten',
    experience: 'Erfahrung',
    education: 'Bildung',
    projects: 'Projekte',
    email: 'E-Mail',
    phone: 'Telefon',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
  },
  ja: {
    contactInfo: '連絡先',
    summary: '職務経歴書',
    skills: 'スキル',
    experience: '経歴',
    education: '学歴',
    projects: 'プロジェクト',
    email: 'メール',
    phone: '電話',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
  },
  zh: {
    contactInfo: '联系信息',
    summary: '专业摘要',
    skills: '技能',
    experience: '工作经历',
    education: '教育背景',
    projects: '项目',
    email: '电子邮件',
    phone: '电话',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
  },
  pt: {
    contactInfo: 'Informações de Contato',
    summary: 'Resumo Profissional',
    skills: 'Habilidades',
    experience: 'Experiência',
    education: 'Educação',
    projects: 'Projetos',
    email: 'Email',
    phone: 'Telefone',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
  },
  it: {
    contactInfo: 'Informazioni di Contatto',
    summary: 'Sintesi Professionale',
    skills: 'Competenze',
    experience: 'Esperienza',
    education: 'Istruzione',
    projects: 'Progetti',
    email: 'Email',
    phone: 'Telefono',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
  },
};

export const getTranslation = (languageCode, key) => {
  return SECTION_TRANSLATIONS[languageCode]?.[key] || SECTION_TRANSLATIONS.en[key];
};

export const translateResume = (content, targetLanguage, sourceLanguage = 'en') => {
  if (sourceLanguage === targetLanguage) return content;
  
  // Placeholder: In production, this would use AI translation
  // For now, we'll store translations locally
  return content;
};
