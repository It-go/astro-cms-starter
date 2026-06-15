// Privatlivspolitik-generator (STD-6 / ITG-971). Ren funktion: byg en da/en politik ud fra
// site-settings (firmainfo STD-1 + tracking STD-4 + consent STD-5). Altid korrekt ved build.
// Bemærk: skabelon, ikke juridisk rådgivning (disclaimer i bunden).
import type { SiteSettings } from "../content.config";

export interface PolicySection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}
export interface PolicyDoc {
  title: string;
  note: string;
  sections: PolicySection[];
  disclaimer: string;
}

export function buildPrivacyPolicy(site: SiteSettings, opts: { locale: string }): PolicyDoc {
  const da = opts.locale !== "en";
  const company = (site.company || "").trim() || (da ? "Virksomheden" : "The company");

  const controller: string[] = [company];
  if (site.cvr) controller.push((da ? "CVR: " : "Company reg. no.: ") + site.cvr);
  if (site.address) controller.push(site.address);
  if (site.email) controller.push((da ? "E-mail: " : "Email: ") + site.email);
  if (site.phone) controller.push((da ? "Telefon: " : "Phone: ") + site.phone);

  const tools: string[] = [];
  if (site.tracking?.ga4_id) tools.push(da ? "Google Analytics 4 (statistik)" : "Google Analytics 4 (statistics)");
  if (site.tracking?.gtm_id) tools.push("Google Tag Manager (marketing)");
  if (site.tracking?.meta_pixel_id) tools.push("Meta Pixel (marketing)");
  const hasTools = tools.length > 0;

  const cookieParagraphs = hasTools
    ? [
        da
          ? "Ud over nødvendige cookies bruger vi følgende værktøjer, som kun aktiveres efter dit samtykke i cookie-banneret:"
          : "In addition to necessary cookies, we use the following tools, which are only activated after your consent in the cookie banner:",
      ]
    : [
        da
          ? "Vi bruger kun nødvendige cookies, der er påkrævet for at sitet fungerer. Vi indsamler ikke statistik og bruger ikke marketing-cookies."
          : "We only use necessary cookies required for the site to work. We do not collect statistics and do not use marketing cookies.",
      ];

  const sections: PolicySection[] = [
    {
      heading: da ? "Dataansvarlig" : "Data controller",
      paragraphs: [
        da
          ? "Den dataansvarlige for behandlingen af dine personoplysninger er:"
          : "The controller responsible for processing your personal data is:",
      ],
      bullets: controller,
    },
    {
      heading: da ? "Hvilke oplysninger vi behandler" : "What information we process",
      bullets: [
        da
          ? "Oplysninger du selv giver via kontaktformularer (fx navn, e-mail, besked)."
          : "Information you provide via contact forms (e.g. name, email, message).",
        da
          ? "Tekniske oplysninger om dit besøg (fx IP-adresse og browser), i det omfang du har givet samtykke."
          : "Technical information about your visit (e.g. IP address and browser), to the extent you have consented.",
      ],
    },
    {
      heading: da ? "Cookies og tracking" : "Cookies and tracking",
      paragraphs: cookieParagraphs,
      bullets: hasTools ? tools : undefined,
    },
    {
      heading: da ? "Formål og retsgrundlag" : "Purpose and legal basis",
      paragraphs: [
        da
          ? "Vi behandler oplysninger for at besvare henvendelser, drive og forbedre sitet samt — ved samtykke — til statistik og marketing. Retsgrundlaget er dit samtykke (databeskyttelsesforordningen art. 6, stk. 1, litra a) og vores legitime interesse i at drive sitet (art. 6, stk. 1, litra f)."
          : "We process information to respond to inquiries, to operate and improve the site and — with consent — for statistics and marketing. The legal basis is your consent (GDPR art. 6(1)(a)) and our legitimate interest in operating the site (art. 6(1)(f)).",
      ],
    },
    {
      heading: da ? "Opbevaring" : "Retention",
      paragraphs: [
        da
          ? "Vi opbevarer kun oplysninger så længe det er nødvendigt til formålet, hvorefter de slettes."
          : "We only keep information for as long as necessary for the purpose, after which it is deleted.",
      ],
    },
    {
      heading: da ? "Dine rettigheder" : "Your rights",
      paragraphs: [da ? "Du har efter databeskyttelsesreglerne ret til:" : "Under data protection law you have the right to:"],
      bullets: da
        ? [
            "Indsigt i hvilke oplysninger vi behandler",
            "Berigtigelse af forkerte oplysninger",
            "Sletning af dine oplysninger",
            "Begrænsning af og indsigelse mod behandling",
            "Dataportabilitet",
            "At trække dit samtykke tilbage til enhver tid",
          ]
        : [
            "Access to the information we process",
            "Rectification of incorrect information",
            "Erasure of your information",
            "Restriction of and objection to processing",
            "Data portability",
            "Withdraw your consent at any time",
          ],
    },
    {
      heading: da ? "Klage" : "Complaints",
      paragraphs: [
        da
          ? "Er du utilfreds med vores behandling, kan du klage til Datatilsynet (datatilsynet.dk)."
          : "If you are dissatisfied with our processing, you can complain to the Danish Data Protection Agency (datatilsynet.dk) or your local supervisory authority.",
      ],
    },
    {
      heading: da ? "Ændringer" : "Changes",
      paragraphs: [
        da
          ? "Denne politik kan blive opdateret. Den aktuelle version findes altid på denne side."
          : "This policy may be updated. The current version is always available on this page.",
      ],
    },
  ];

  if (site.email) {
    sections.push({
      heading: da ? "Kontakt" : "Contact",
      paragraphs: [
        (da
          ? "Har du spørgsmål til behandlingen af dine personoplysninger, så kontakt os på "
          : "If you have questions about the processing of your personal data, contact us at ") +
          site.email +
          ".",
      ],
    });
  }

  return {
    title: da ? "Privatlivspolitik" : "Privacy policy",
    note: da
      ? "Denne politik er genereret automatisk ud fra sitets indstillinger."
      : "This policy is generated automatically from the site's settings.",
    sections,
    disclaimer: da
      ? "Bemærk: Dette er en skabelon genereret ud fra dine indstillinger og udgør ikke juridisk rådgivning. Få den gennemgået af en jurist før brug."
      : "Note: This is a template generated from your settings and does not constitute legal advice. Have it reviewed by a lawyer before use.",
  };
}
