import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'resume_languages';

export function useMultiLanguageResume(initialContent) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const initialVersions = typeof initialContent === 'string' ? { en: initialContent } : (initialContent || { en: '' });
  const [resumeVersions, setResumeVersions] = useState(initialVersions);

  // Load from localStorage on mount, fallback to initialContent if none
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResumeVersions(parsed);
      } catch (error) {
        console.error('Failed to load resume versions:', error);
      }
    } else if (initialContent) {
      try {
        const fromInitial = typeof initialContent === 'string' ? { en: initialContent } : initialContent;
        setResumeVersions(fromInitial);
      } catch (error) {
        console.error('Failed to initialize resume versions from initialContent:', error);
      }
    }
  }, [initialContent]);

  // Save to localStorage whenever versions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeVersions));
  }, [resumeVersions]);

  const updateResumeContent = useCallback((content, language = currentLanguage) => {
    setResumeVersions(prev => ({
      ...prev,
      [language]: content,
    }));
  }, [currentLanguage]);

  const switchLanguage = useCallback((language) => {
    setCurrentLanguage(language);
  }, []);

  const getResumeContent = useCallback((language = currentLanguage) => {
    return resumeVersions[language] || '';
  }, [resumeVersions, currentLanguage]);

  const copyToLanguage = useCallback((fromLanguage, toLanguage) => {
    const content = resumeVersions[fromLanguage];
    if (content) {
      setResumeVersions(prev => ({
        ...prev,
        [toLanguage]: content,
      }));
      setCurrentLanguage(toLanguage);
    }
  }, [resumeVersions]);

  const deleteLanguageVersion = useCallback((language) => {
    if (language === 'en') {
      console.warn('Cannot delete English version');
      return;
    }
    setResumeVersions(prev => {
      const updated = { ...prev };
      delete updated[language];
      return updated;
    });
    
    if (currentLanguage === language) {
      setCurrentLanguage('en');
    }
  }, [currentLanguage]);

  return {
    currentLanguage,
    resumeVersions,
    updateResumeContent,
    switchLanguage,
    getResumeContent,
    copyToLanguage,
    deleteLanguageVersion,
  };
}
