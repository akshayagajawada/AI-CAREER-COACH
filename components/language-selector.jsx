"use client";

import { SUPPORTED_LANGUAGES } from "@/lib/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function LanguageSelector({
  currentLanguage,
  availableLanguages,
  onLanguageChange,
  onCopyLanguage,
  onDeleteLanguage,
  onAddLanguage, // new handler for add with optional translation
}) {
  const handleCopy = (language) => {
    onCopyLanguage(currentLanguage, language);
    toast.success(`Copied content to ${SUPPORTED_LANGUAGES[language].name}`);
  };

  const handleDelete = (language) => {
    onDeleteLanguage(language);
    toast.success(`Deleted ${SUPPORTED_LANGUAGES[language].name} version`);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Resume Language:</span>
        <Select value={currentLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
              <SelectItem key={code} value={code}>
                {lang.flag} {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium text-muted-foreground self-center">
          Available versions:
        </span>
        {availableLanguages.map((lang) => (
          <div
            key={lang}
            className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md"
          >
            <span>{SUPPORTED_LANGUAGES[lang].flag}</span>
            <span className="text-xs font-medium">{SUPPORTED_LANGUAGES[lang].name}</span>
            {lang !== currentLanguage && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => handleCopy(lang)}
                  title="Copy current content to this language"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {lang !== 'en' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(lang)}
                    title="Delete this language version"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
          !availableLanguages.includes(code) && (
            <Button
              key={code}
              variant="outline"
              size="sm"
              onClick={() => {
                if (onAddLanguage) {
                  onAddLanguage(currentLanguage, code);
                } else {
                  onCopyLanguage(currentLanguage, code);
                  toast.success(`Created ${lang.name} version`);
                }
              }}
              className="text-xs"
            >
              {lang.flag} Add {lang.name}
            </Button>
          )
        ))}
      </div>
    </div>
  );
}
