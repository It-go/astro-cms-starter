---
title: Forside
seo:
  description: Eksempel-forside bygget med ITGo Studio.
blocks:
  - type: hero
    heading: Velkommen til dit nye site
    subheading: Bygget med ITGo Studio — rediger selv, ingen kode.
    cta_label: Kontakt os
    cta_href: "#kontakt"
  - type: text
    heading: Om os
    body: <p>Skriv din historie her. Indholdet redigeres i ITGo Studio og udgives med ét klik.</p>
  - type: faq
    heading: Ofte stillede spørgsmål
    items:
      - q: Hvordan redigerer jeg siden?
        a: Log ind på ITGo Studio og klik på den side, du vil ændre.
      - q: Hvor hurtigt går ændringer live?
        a: Typisk under et minut efter du klikker Udgiv.
  - type: contact_form
    heading: Kontakt os
    submit_label: Send
    form_key: contact
    fields:
      - { name: name, label: Navn, type: text, required: true }
      - { name: email, label: E-mail, type: email, required: true }
      - { name: message, label: Besked, type: textarea }
  - type: footer
    company: Dit Firma ApS
    address: Eksempelvej 1, 9999 Byen
    links:
      - { label: Forside, href: "/" }
      - { label: English, href: "/en" }
---
