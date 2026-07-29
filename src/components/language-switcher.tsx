import { Languages } from "lucide-react";
import { useLanguage } from "@/i18n";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-border/60 bg-card/80 p-1 shadow-sm"
      aria-label="Language selector"
    >
      <Languages className="mx-1 h-4 w-4 text-muted-foreground" />
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-all ${
          language === "en"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
        aria-pressed={language === "en"}
        title="English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("id")}
        className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-all ${
          language === "id"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
        aria-pressed={language === "id"}
        title="Bahasa Indonesia"
      >
        ID
      </button>
    </div>
  );
}
