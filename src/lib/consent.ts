// Cookie-consent helpers (STD-5 / ITG-970). Typer + default-tekster (da/en).
// Consent-state lever i localStorage[CONSENT_KEY]; banneret OG STD-4's tracking-loader
// deler nøglen + kategori-navnene (statistics/marketing).
export const CONSENT_KEY = "itgo:consent";
export const CONSENT_VERSION = 1;

export interface ConsentTexts {
  title: string;
  message: string;
  acceptAll: string;
  necessaryOnly: string;
  customize: string;
  save: string;
  policy: string;
  necessary: string;
  necessaryHint: string;
  statistics: string;
  statisticsHint: string;
  marketing: string;
  marketingHint: string;
  reopen: string;
}

const DA: ConsentTexts = {
  title: "Cookies",
  message:
    "Vi bruger cookies til statistik og marketing for at gøre sitet bedre. Du bestemmer hvad vi må.",
  acceptAll: "Accepter alle",
  necessaryOnly: "Kun nødvendige",
  customize: "Tilpas",
  save: "Gem valg",
  policy: "Privatlivspolitik",
  necessary: "Nødvendige",
  necessaryHint: "Kræves for at sitet virker. Altid til.",
  statistics: "Statistik",
  statisticsHint: "Hjælper os med at forstå brugen (fx Google Analytics).",
  marketing: "Marketing",
  marketingHint: "Bruges til annoncering (fx Meta Pixel).",
  reopen: "Cookie-indstillinger",
};

const EN: ConsentTexts = {
  title: "Cookies",
  message:
    "We use cookies for statistics and marketing to improve the site. You decide what we may use.",
  acceptAll: "Accept all",
  necessaryOnly: "Necessary only",
  customize: "Customize",
  save: "Save choice",
  policy: "Privacy policy",
  necessary: "Necessary",
  necessaryHint: "Required for the site to work. Always on.",
  statistics: "Statistics",
  statisticsHint: "Helps us understand usage (e.g. Google Analytics).",
  marketing: "Marketing",
  marketingHint: "Used for advertising (e.g. Meta Pixel).",
  reopen: "Cookie settings",
};

export function consentTexts(locale: string): ConsentTexts {
  return locale === "en" ? EN : DA;
}
